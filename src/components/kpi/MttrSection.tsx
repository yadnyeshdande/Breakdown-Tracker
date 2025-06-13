
"use client";

import React, { useState, useMemo } from 'react';
import type { BreakdownPost } from '@/lib/types';
import { MachineSelector } from './MachineSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '../ui/scroll-area';

interface MttrSectionProps {
  breakdowns: BreakdownPost[];
  allMachines: string[]; // Expects already trimmed and unique machine names
}

export function MttrSection({ breakdowns, allMachines }: MttrSectionProps) {
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);

  const mttrData = useMemo(() => {
    if (selectedMachines.length === 0) return [];

    return selectedMachines.map(machineName => {
      // machineName from selectedMachines is already trimmed
      const machineBreakdowns = breakdowns.filter(b => b.machine.trim() === machineName);
      if (machineBreakdowns.length === 0) {
        return { machine: machineName, mttr: null, totalLossTime: 0, repairs: 0 };
      }
      const totalLossTime = machineBreakdowns.reduce((sum, b) => sum + b.lossTime, 0);
      const repairs = machineBreakdowns.length;
      const mttr = totalLossTime / repairs;
      return { machine: machineName, mttr, totalLossTime, repairs };
    }).sort((a,b) => (a.mttr ?? Infinity) - (b.mttr ?? Infinity)); // Lower MTTR is "better" or first
  }, [breakdowns, selectedMachines]);

  return (
    <div className="space-y-6">
      <MachineSelector
        allMachines={allMachines}
        selectedMachines={selectedMachines}
        onSelectedMachinesChange={setSelectedMachines}
        title="Select Machines for MTTR Calculation"
      />

      {selectedMachines.length === 0 && (
        <p className="text-muted-foreground text-center py-4">
          Select one or more machines to view MTTR data.
        </p>
      )}

      {selectedMachines.length > 0 && mttrData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>MTTR Results</CardTitle>
            <CardDescription>MTTR is shown in minutes. Lower values are better.MTTR (Mean Time To Repair) is shown in minutes. Lower values are better. 
              Calculated based on Total time spent on repairs Divided by Number of repairs. 
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Machine</TableHead>
                    <TableHead className="text-right">Total Repairs</TableHead>
                    <TableHead className="text-right">Total Loss Time (mins)</TableHead>
                    <TableHead className="text-right">MTTR (mins/repair)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mttrData.map(data => (
                    <TableRow key={data.machine}>
                      <TableCell className="font-medium">{data.machine}</TableCell>
                      <TableCell className="text-right">{data.repairs}</TableCell>
                      <TableCell className="text-right">{data.totalLossTime.toFixed(0)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {data.mttr !== null ? data.mttr.toFixed(2) : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
       {selectedMachines.length > 0 && mttrData.filter(d => d.repairs > 0).length === 0 && (
         <p className="text-muted-foreground text-center py-4">
          No breakdown data available for the selected machines with repairs.
        </p>
       )}
    </div>
  );
}
