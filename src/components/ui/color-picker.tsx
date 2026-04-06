'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { calculateContrastRatio, generateColorHarmony } from '@/lib/validation/branding';
import { Palette, Check, X, Info } from 'lucide-react';

interface ColorPickerProps {
  label: string;
  value?: string;
  onChange: (color: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showHarmony?: boolean;
}

interface ContrastStatus {
  ratio: number;
  level: 'AAA' | 'AA' | 'FAIL';
  accessible: boolean;
}

const PRESET_COLORS = [
  '#1a1a2e', '#16213e', '#0f3460', '#533483', '#7209b7',
  '#f39800', '#ff6b35', '#e74c3c', '#c0392b', '#8e44ad',
  '#3498db', '#2980b9', '#1abc9c', '#16a085', '#27ae60',
  '#2ecc71', '#f1c40f', '#f39c12', '#e67e22', '#d35400',
];

export function ColorPicker({
  label,
  value = '',
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  showHarmony = false,
}: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);
  const [contrastStatus, setContrastStatus] = useState<ContrastStatus | null>(null);
  const [harmony, setHarmony] = useState<ReturnType<typeof generateColorHarmony> | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Validate color format
  const isValidColor = (color: string): boolean => {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  };

  // Calculate contrast status
  useEffect(() => {
    if (isValidColor(inputValue)) {
      const contrastWithWhite = calculateContrastRatio(inputValue, '#ffffff');
      const contrastWithBlack = calculateContrastRatio(inputValue, '#000000');

      const bestContrast = Math.max(contrastWithWhite, contrastWithBlack);
      const status: ContrastStatus = {
        ratio: bestContrast,
        level: bestContrast >= 7 ? 'AAA' : bestContrast >= 4.5 ? 'AA' : 'FAIL',
        accessible: bestContrast >= 4.5,
      };

      setContrastStatus(status);

      // Generate color harmony if requested
      if (showHarmony) {
        try {
          const harmonyColors = generateColorHarmony(inputValue);
          setHarmony(harmonyColors);
        } catch (error) {
          setHarmony(null);
        }
      }
    } else {
      setContrastStatus(null);
      setHarmony(null);
    }
  }, [inputValue, showHarmony]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    if (isValidColor(newValue)) {
      onChange(newValue);
    }
  };

  const handlePresetClick = (color: string) => {
    setInputValue(color);
    onChange(color);
    setIsOpen(false);
  };

  const ContrastIndicator = ({ status }: { status: ContrastStatus }) => (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1">
        {status.accessible ? (
          <Check className="h-3 w-3 text-green-600" />
        ) : (
          <X className="h-3 w-3 text-red-600" />
        )}
        <span className={status.accessible ? 'text-green-600' : 'text-red-600'}>
          {status.level}
        </span>
      </div>
      <span className="text-muted-foreground">
        {status.ratio.toFixed(1)}:1 contrast
      </span>
    </div>
  );

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={`color-${label}`} className="flex items-center gap-2">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>

      <div className="flex gap-2">
        {/* Color preview and input */}
        <div className="flex items-center gap-2 flex-1">
          <div
            className="w-10 h-10 rounded-md border-2 border-muted-foreground/20 cursor-pointer transition-all hover:scale-105"
            style={{
              backgroundColor: isValidColor(inputValue) ? inputValue : '#transparent',
              backgroundImage: !isValidColor(inputValue) ?
                'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' :
                'none',
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
            }}
            onClick={() => !disabled && setIsOpen(true)}
          />

          <Input
            id={`color-${label}`}
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="#000000"
            className="font-mono flex-1"
            disabled={disabled}
            maxLength={7}
          />

          {/* Color picker popover */}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                className="px-2"
              >
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Preset Colors</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded border border-muted-foreground/20 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => handlePresetClick(color)}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Native color picker */}
                <div>
                  <Label className="text-sm font-medium">Custom Color</Label>
                  <input
                    type="color"
                    value={isValidColor(inputValue) ? inputValue : '#000000'}
                    onChange={(e) => handlePresetClick(e.target.value)}
                    className="w-full h-10 rounded border cursor-pointer"
                  />
                </div>

                {/* Color harmony suggestions */}
                {harmony && showHarmony && (
                  <div>
                    <Label className="text-sm font-medium">Color Harmony</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-20">Complementary:</span>
                        <button
                          className="w-6 h-6 rounded border border-muted-foreground/20 hover:scale-110 transition-transform"
                          style={{ backgroundColor: harmony.complementary }}
                          onClick={() => handlePresetClick(harmony.complementary)}
                          title={harmony.complementary}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-20">Analogous:</span>
                        <div className="flex gap-1">
                          {harmony.analogous.map((color, index) => (
                            <button
                              key={index}
                              className="w-6 h-6 rounded border border-muted-foreground/20 hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                              onClick={() => handlePresetClick(color)}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Validation feedback */}
      <div className="space-y-1">
        {contrastStatus && (
          <div className="flex items-center justify-between">
            <ContrastIndicator status={contrastStatus} />
            {!contrastStatus.accessible && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>May not meet accessibility requirements</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        {!error && !isValidColor(inputValue) && inputValue.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Enter a valid hex color (e.g., #1a1a2e)
          </p>
        )}
      </div>
    </div>
  );
}

export default ColorPicker;