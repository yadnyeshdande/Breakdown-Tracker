
"use client";

import React, { useState, useMemo } from 'react';
import type { BreakdownPost } from '@/lib/types';
import { MachineSelector } from './MachineSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { ScrollArea } from '@/components/ui/scroll-area';


interface ParetoSectionProps {
  breakdowns: BreakdownPost[];
  allMachines: string[]; // Expects already trimmed and unique machine names
}

const chartConfig = {
  totalLossTime: {
    label: "Total Loss Time (mins)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


export function ParetoSection({ breakdowns, allMachines }: ParetoSectionProps) {
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);

  const paretoData = useMemo(() => {
    if (selectedMachines.length === 0) return [];

    const lossTimeByMachine: { [key: string]: number } = {};

    selectedMachines.forEach(machineName => {
      lossTimeByMachine[machineName] = 0; // Initialize for all selected machines
    });

    breakdowns.forEach(b => {
      const trimmedMachineName = b.machine.trim();
      if (selectedMachines.includes(trimmedMachineName)) { // Ensure comparison with trimmed name if selectedMachines are trimmed
        lossTimeByMachine[trimmedMachineName] = (lossTimeByMachine[trimmedMachineName] || 0) + b.lossTime;
      }
    });
    
    return Object.entries(lossTimeByMachine)
      .map(([name, totalLossTime]) => ({ name, totalLossTime }))
      .filter(item => item.totalLossTime > 0) // Only show machines with actual loss time
      .sort((a, b) => b.totalLossTime - a.totalLossTime);

  }, [breakdowns, selectedMachines]);

  return (
    <div className="space-y-6">
      <MachineSelector
        allMachines={allMachines}
        selectedMachines={selectedMachines}
        onSelectedMachinesChange={setSelectedMachines}
        title="Select Machines for Pareto Analysis"
      />

      {selectedMachines.length === 0 && (
        <p className="text-muted-foreground text-center py-4">
          Select one or more machines to view Pareto analysis.
        </p>
      )}

      {selectedMachines.length > 0 && paretoData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Loss Time by Machine</CardTitle>
            <CardDescription>
              Machines are sorted by their total contribution to downtime.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
               {/* Adjust width based on number of items to prevent squishing, ensure minWidth for few items */}
              <div style={{ width: paretoData.length > 5 ? `${paretoData.length * Math.max(60, 800/paretoData.length)}px` : '100%', minWidth: '300px' }}> 
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={paretoData} margin={{ top: 5, right: 20, left: 0, bottom: paretoData.length > 5 ? 70 : 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="name" 
                        angle={paretoData.length > 5 ? -45 : 0}
                        textAnchor={paretoData.length > 5 ? "end" : "middle"}
                        height={paretoData.length > 5 ? 60 : 30}
                        interval={0}
                        tick={{ fontSize: 12 }} 
                    />
                    <YAxis 
                        label={{ value: 'Total Loss Time (mins)', angle: -90, position: 'insideLeft', style: {textAnchor: 'middle', fontSize: '14px'}, dy: 40 }} 
                        allowDecimals={false}
                    />
                    <Tooltip
                        contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                        labelStyle={{color: 'hsl(var(--foreground))', fontWeight: 'bold'}}
                        formatter={(value: number) => [`${value.toFixed(0)} mins`, "Loss Time"]}
                    />
                    <Legend wrapperStyle={{paddingTop: '20px'}} />
                    <Bar dataKey="totalLossTime" fill={chartConfig.totalLossTime.color} radius={[4, 4, 0, 0]} name="Total Loss Time (mins)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      {selectedMachines.length > 0 && paretoData.length === 0 && (
         <p className="text-muted-foreground text-center py-4">
          No breakdown data with loss time available for the selected machines.
        </p>
       )}
    </div>
  );
}
