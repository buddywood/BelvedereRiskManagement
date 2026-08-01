import type { PipelineClient, PipelineFilters } from "./types";
import { pipelineClientSortSearchLabel } from "./client-display";
import { getStageOrder } from "./status";

/** Pure client-side filter + sort for the advisor pipeline table. */
export function applyPipelineFilters(
  clients: PipelineClient[],
  filters: PipelineFilters,
): PipelineClient[] {
  let filtered = clients.slice();

  if (filters.stage) {
    filtered = filtered.filter((client) => client.stage === filters.stage);
  }

  if (filters.stalled) {
    filtered = filtered.filter((client) => client.stalled);
  }

  if (filters.awaitingIntakeReview) {
    filtered = filtered.filter((client) => client.awaitingIntakeReview);
  }

  if (filters.assessmentInProgress) {
    filtered = filtered.filter(
      (client) => client.stage === "ASSESSMENT_IN_PROGRESS",
    );
  }

  if (filters.documentsNeeded) {
    filtered = filtered.filter((client) => client.documentsNeeded);
  }

  if (filters.assignedAdvisorId) {
    filtered = filtered.filter(
      (client) => client.assignedAdvisorProfileId === filters.assignedAdvisorId,
    );
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter((client) =>
      pipelineClientSortSearchLabel(client).toLowerCase().includes(searchLower),
    );
  }

  if (filters.sortBy) {
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (filters.sortBy) {
        case "name":
          aValue = pipelineClientSortSearchLabel(a);
          bValue = pipelineClientSortSearchLabel(b);
          break;
        case "stage":
          aValue = getStageOrder(a.stage);
          bValue = getStageOrder(b.stage);
          break;
        case "progress":
          aValue = a.progress;
          bValue = b.progress;
          break;
        case "lastActivity":
          aValue = a.lastActivity.getTime();
          bValue = b.lastActivity.getTime();
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return filters.sortDir === "desc" ? -comparison : comparison;
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return filters.sortDir === "desc" ? -comparison : comparison;
    });
  }

  return filtered;
}
