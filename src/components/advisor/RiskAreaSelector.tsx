"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { RISK_AREAS } from "@/lib/advisor/types";

interface RiskAreaSelectorProps {
  selectedAreas: string[];
  onChange: (areas: string[]) => void;
  disabled?: boolean;
}

export function RiskAreaSelector({ selectedAreas, onChange, disabled = false }: RiskAreaSelectorProps) {
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAreaToggle = (areaId: string) => {
    if (disabled) return;

    const isCurrentlySelected = selectedAreas.includes(areaId);
    let newSelectedAreas: string[];

    if (isCurrentlySelected) {
      newSelectedAreas = selectedAreas.filter(id => id !== areaId);
    } else {
      newSelectedAreas = [...selectedAreas, areaId];
    }

    onChange(newSelectedAreas);

    // Clear validation error when user makes a selection
    if (newSelectedAreas.length > 0 && validationError) {
      setValidationError(null);
    }
  };

  const triggerValidation = () => {
    if (selectedAreas.length === 0) {
      setValidationError("Please select at least one risk area before approving.");
      return false;
    }
    setValidationError(null);
    return true;
  };

  // Expose validation function to parent
  (RiskAreaSelector as any).triggerValidation = triggerValidation;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Focus Risk Areas</h3>
        <p className="text-sm text-muted-foreground">
          Select the risk areas that require deeper assessment for this client.
        </p>
      </div>

      {/* Selection count */}
      <div className="text-sm text-muted-foreground">
        {selectedAreas.length} of {RISK_AREAS.length} areas selected
      </div>

      {/* Grid of checkboxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {RISK_AREAS.map((area) => {
          const isSelected = selectedAreas.includes(area.id);

          return (
            <div
              key={area.id}
              className={`rounded-lg border p-4 transition-colors cursor-pointer ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleAreaToggle(area.id)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={isSelected}
                  disabled={disabled}
                  className="mt-0.5"
                  onCheckedChange={() => handleAreaToggle(area.id)}
                />
                <div className="space-y-1 flex-1">
                  <div className="font-medium text-sm leading-5">
                    {area.name}
                  </div>
                  <p className="text-xs text-muted-foreground leading-4">
                    Assessment subcategory focusing on {area.name.toLowerCase()} within family wealth governance.
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Validation error */}
      {validationError && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          {validationError}
        </div>
      )}

      {/* Minimum selection note */}
      <div className="text-xs text-muted-foreground border-t pt-3">
        <strong>Note:</strong> At least one risk area must be selected for client approval.
        Selected areas will determine which assessment questions the client receives.
      </div>
    </div>
  );
}