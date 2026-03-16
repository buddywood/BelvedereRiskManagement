"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStageLabel } from "@/lib/pipeline/status";
import type { PipelineFilters, PipelineMetrics } from "@/lib/pipeline/types";
import type { ClientWorkflowStage } from "@prisma/client";

interface PipelineFiltersProps {
  filters: PipelineFilters;
  onFilterChange: (filters: PipelineFilters) => void;
  metrics: PipelineMetrics;
  totalCount: number;
  filteredCount: number;
}

const stages: ClientWorkflowStage[] = [
  'INVITED',
  'REGISTERED',
  'INTAKE_IN_PROGRESS',
  'INTAKE_COMPLETE',
  'ASSESSMENT_IN_PROGRESS',
  'ASSESSMENT_COMPLETE',
  'DOCUMENTS_REQUIRED',
  'COMPLETE',
];

export function PipelineFilters({
  filters,
  onFilterChange,
  metrics,
  totalCount,
  filteredCount
}: PipelineFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  // Debounce search input
  const debouncedSearchChange = useDebouncedCallback(
    (value: string) => {
      onFilterChange({ ...filters, search: value || undefined });
    },
    300
  );

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    debouncedSearchChange(value);
  };

  const handleStageChange = (value: string) => {
    const stage = value === 'all' ? undefined : value as ClientWorkflowStage;
    onFilterChange({ ...filters, stage });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Stage Filter */}
        <div className="flex items-center gap-2">
          <Select
            value={filters.stage || 'all'}
            onValueChange={handleStageChange}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  All Stages
                  <Badge variant="outline" className="ml-1">
                    {totalCount}
                  </Badge>
                </div>
              </SelectItem>
              {stages.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  <div className="flex items-center gap-2">
                    {getStageLabel(stage)}
                    <Badge variant="outline" className="ml-1">
                      {metrics.byStage[stage]}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredCount} of {totalCount} clients
        {filters.stage && (
          <span className="ml-2">
            • Filtered by: <span className="font-medium">{getStageLabel(filters.stage)}</span>
          </span>
        )}
        {filters.search && (
          <span className="ml-2">
            • Search: <span className="font-medium">"{filters.search}"</span>
          </span>
        )}
      </div>
    </div>
  );
}