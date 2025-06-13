
"use client";

import React, { useState, useMemo } from 'react';
import type { BreakdownPost } from '@/lib/types';
import { MachineSelector } from './MachineSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '../ui/scroll-area';

interface MtbfSectionProps {
  breakdowns: BreakdownPost[];
  allMachines: string[];
}

export function MtbfSection({ breakdowns, allMachines }: MtbfSectionProps) {
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);

  const mtbfData = useMemo(() => {
    if (selectedMachines.length === 0) return [];

    return selectedMachines.map(machineName => {
      const machineBreakdowns = breakdowns
        .filter(b => b.machine === machineName)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      if (machineBreakdowns.length < 1) { // Or < 2 for MTBF between failures
        return { machine: machineName, mtbf: null, operatingTime: 0, failures: 0 };
      }

      const numFailures = machineBreakdowns.length;
      const firstFailureTime = new Date(machineBreakdowns[0].createdAt).getTime();
      const lastBreakdown = machineBreakdowns[numFailures - 1];
      const endOfLastRepairTime = new Date(lastBreakdown.createdAt).getTime() + (lastBreakdown.lossTime * 60000);
      
      const totalObservedPeriodMs = endOfLastRepairTime - firstFailureTime;
      
      const totalDowntimeMs = machineBreakdowns.reduce((sum, b) => sum + b.lossTime * 60000, 0);
      
      let effectiveOperatingTimeMs = totalObservedPeriodMs - totalDowntimeMs;
      if (effectiveOperatingTimeMs < 0) effectiveOperatingTimeMs = 0; // Cannot be negative

      // MTBF = Total Operating Time / Number of Failures
      // If numFailures is 0, mtbf is undefined. If 1, this can be very large if operating time is since install.
      // For this simple calculation, if only 1 failure, "totalObservedPeriodMs" would be just its loss time,
      // making operating time 0. Let's define MTBF for >= 1 failure.
      const mtbfInMinutes = numFailures > 0 ? (effectiveOperatingTimeMs / 60000) / numFailures : null;

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
              MTBF is shown in minutes. Higher values are better. Calculated based on time from first failure to end of last repair.
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
                        {data.mtbf !== null ? data.mtbf.toFixed(2) : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      {selectedMachines.length > 0 && mtbfData.length === 0 && (
         <p className="text-muted-foreground text-center py-4">
          No breakdown data available for the selected machines to calculate MTBF.
        </p>
       )}
    </div>
  );
}
