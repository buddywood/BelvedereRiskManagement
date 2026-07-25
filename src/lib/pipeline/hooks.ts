"use client";

import { useState, useEffect, useMemo } from "react";
import type { PipelineClient, PipelineFilters } from './types';
import { applyPipelineFilters } from './apply-pipeline-filters';

export function usePipelineUpdates(initialClients: PipelineClient[]) {
  const [clients, setClients] = useState<PipelineClient[]>(initialClients);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setLastUpdated(new Date());

    const eventSource = new EventSource('/api/advisor/status-stream');

    eventSource.onopen = () => {
      setConnected(true);
    };

    const applyPipelineUpdate = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data);
        if (!data.clients) return;
        const updatedClients = data.clients.map((client: Record<string, unknown>) => ({
          ...(client as PipelineClient),
          assignedAt: new Date(client.assignedAt as string | Date),
          lastActivity: new Date(client.lastActivity as string | Date),
          invitation: client.invitation
            ? {
                ...(client.invitation as Record<string, unknown>),
                sentAt: new Date(
                  (client.invitation as { sentAt: string | Date }).sentAt,
                ),
              }
            : null,
          intake: client.intake
            ? {
                ...(client.intake as Record<string, unknown>),
                submittedAt: (client.intake as { submittedAt?: string | Date | null })
                  .submittedAt
                  ? new Date(
                      (client.intake as { submittedAt: string | Date }).submittedAt,
                    )
                  : null,
              }
            : null,
          assessment: client.assessment
            ? {
                ...(client.assessment as Record<string, unknown>),
                completedAt: (client.assessment as { completedAt?: string | Date | null })
                  .completedAt
                  ? new Date(
                      (client.assessment as { completedAt: string | Date }).completedAt,
                    )
                  : null,
              }
            : null,
        })) as PipelineClient[];
        setClients(updatedClients);
        setLastUpdated(new Date(data.timestamp));
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.addEventListener('pipeline_update', applyPipelineUpdate);

    eventSource.addEventListener('connected', () => {
      setConnected(true);
    });

    eventSource.addEventListener('error', () => {
      setConnected(false);
    });

    eventSource.onerror = () => {
      setConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { clients, connected, lastUpdated };
}

export function usePipelineFilters(
  clients: PipelineClient[],
  initialFilters?: PipelineFilters,
) {
  const [filters, setFilters] = useState<PipelineFilters>({
    sortBy: "lastActivity",
    sortDir: "desc",
    ...initialFilters,
  });

  const initialFiltersKey = JSON.stringify(initialFilters ?? {});

  useEffect(() => {
    setFilters({
      sortBy: "lastActivity",
      sortDir: "desc",
      ...(initialFilters ?? {}),
    });
  }, [initialFiltersKey]);

  const filteredClients = useMemo(
    () => applyPipelineFilters(clients, filters),
    [clients, filters],
  );

  const updateFilters = (newFilters: Partial<PipelineFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return { filters, filteredClients, updateFilters };
}