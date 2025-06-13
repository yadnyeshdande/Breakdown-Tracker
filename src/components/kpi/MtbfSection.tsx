
"use client";

import React, { useState, useMemo } from 'react';
import type { BreakdownPost } from '@/lib/types';
import { MachineSelector } from './MachineSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '../ui/scroll-area';

interface MtbfSectionProps {
  breakdowns: BreakdownPost[];
  allMachines: string[]; // Expects already trimmed and unique machine names
}

export function MtbfSection({ breakdowns, allMachines }: MtbfSectionProps) {
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);

  const mtbfData = useMemo(() => {
    if (selectedMachines.length === 0) return [];

    return selectedMachines.map(machineName => {
      // machineName from selectedMachines is already trimmed
      const machineBreakdowns = breakdowns
        .filter(b => b.machine.trim() === machineName)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      if (machineBreakdowns.length < 1) {
        return { machine: machineName, mtbf: null, operatingTime: 0, failures: 0 };
      }

      const numFailures = machineBreakdowns.length;
      
      // Estimate total observed period: from first failure start to last repair end.
      // This is a simplification. A more accurate MTBF often needs defined operational periods.
      const firstFailureTime = new Date(machineBreakdowns[0].createdAt).getTime();
      const lastBreakdown = machineBreakdowns[numFailures - 1];
      // Consider the end of the last repair as the end of the observation for that repair cycle
      const endOfLastRepairTime = new Date(lastBreakdown.createdAt).getTime() + (lastBreakdown.lossTime * 60000);
      
      // Total period from the start of the first failure to the end of the last repair
      const totalObservedPeriodMs = endOfLastRepairTime - firstFailureTime;
      
      const totalDowntimeMs = machineBreakdowns.reduce((sum, b) => sum + b.lossTime * 60000, 0);
      
      let effectiveOperatingTimeMs = totalObservedPeriodMs - totalDowntimeMs;

      // If only one failure, effective operating time might be negative or zero if observed period is just the downtime.
      // MTBF is typically calculated over a longer operational period with multiple failures.
      // For a single failure, MTBF is often considered "infinite" until the next failure or not calculated.
      // Let's adjust to ensure operating time is not negative.
      if (effectiveOperatingTimeMs < 0) effectiveOperatingTimeMs = 0; 

      // MTBF = Total Operating Time / Number of Failures
      // If numFailures = 1, this can give a value, but it's uptime before that single failure (if known) or since observation started.
      // If using numFailures (for >1 failures, it's usually numFailures - 1 intervals, or total op time / numFailures)
      // Let's use total effective operating time / number of failures.
      const mtbfInMinutes = numFailures > 0 && effectiveOperatingTimeMs > 0 ? (effectiveOperatingTimeMs / 60000) / numFailures : null;
      // If there's only one failure, MTBF is technically undefined or very large.
      // If numFailures is 1, it means operating time until that one failure.
      // The current calculation can result in 0 or small MTBF if only one failure exists and observation period is short.


      return { 
        machine: machineName, 
        mtbf: mtbfInMinutes, 
        operatingTime: effectiveOperatingTimeMs / 60000, 
        failures: numFailures
      };
    }).sort((a,b) => (b.mtbf ?? -1) - (a.mtbf ?? -1)); // Higher MTBF is better
  }, [breakdowns, selectedMachines]);

  return (
    <div className="space-y-6">
      <MachineSelector
        allMachines={allMachines}
        selectedMachines={selectedMachines}
        onSelectedMachinesChange={setSelectedMachines}
        title="Select Machines for MTBF Calculation"
      />

      {selectedMachines.length === 0 && (
        <p className="text-muted-foreground text-center py-4">
          Select one or more machines to view MTBF data.
        </p>
      )}

      {selectedMachines.length > 0 && mtbfData.length > 0 && (
         <Card>
          <CardHeader>
            <CardTitle>MTBF Results</CardTitle>
            <CardDescription>
              MTBF (Mean Time Between Failures) is shown in minutes. Higher values are better. 
              Calculated based on total effective operating time divided by the number of failures.
              Operating time is estimated from the first failure to the end of the last repair, minus total downtime.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Machine</TableHead>
                    <TableHead className="text-right">Total Failures</TableHead>
                    <TableHead className="text-right">Effective Operating Time (mins)</TableHead>
                    <TableHead className="text-right">MTBF (mins/failure)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mtbfData.map(data => (
                    <TableRow key={data.machine}>
                      <TableCell className="font-medium">{data.machine}</TableCell>
                      <TableCell className="text-right">{data.failures}</TableCell>
                      <TableCell className="text-right">{data.operatingTime.toFixed(0)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {data.mtbf !== null ? data.mtbf.toFixed(2) : 'N/A (needs >0 op. time & failures)'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      {selectedMachines.length > 0 && mtbfData.filter(d => d.failures > 0).length === 0 && (
         <p className="text-muted-foreground text-center py-4">
          No breakdown data available for the selected machines to calculate MTBF.
        </p>
       )}
    </div>
  );
}
