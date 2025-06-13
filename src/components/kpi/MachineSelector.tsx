
"use client";

import React, { useState, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface MachineSelectorProps {
  allMachines: string[];
  selectedMachines: string[];
  onSelectedMachinesChange: (newSelection: string[]) => void;
  title?: string;
}

export function MachineSelector({
  allMachines,
  selectedMachines,
  onSelectedMachinesChange,
  title = "Select Machines for Analysis"
}: MachineSelectorProps) {
  const [isSelectAll, setIsSelectAll] = useState(false);

  useEffect(() => {
    setIsSelectAll(allMachines.length > 0 && selectedMachines.length === allMachines.length);
  }, [selectedMachines, allMachines]);

  const handleSelectAllChange = (checked: boolean) => {
    setIsSelectAll(checked);
    if (checked) {
      onSelectedMachinesChange([...allMachines]);
    } else {
      onSelectedMachinesChange([]);
    }
  };

  const handleMachineChange = (machine: string, checked: boolean) => {
    if (checked) {
      onSelectedMachinesChange([...selectedMachines, machine]);
    } else {
      onSelectedMachinesChange(selectedMachines.filter(m => m !== machine));
    }
  };

  if (allMachines.length === 0) {
    return <p className="text-muted-foreground">No machine data available to select.</p>;
  }

  return (
    <Card className="mb-6 border-dashed">
      <CardHeader className='pb-4'>
        <CardTitle className='text-lg'>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
            <Checkbox
                id="select-all-machines"
                checked={isSelectAll}
                onCheckedChange={handleSelectAllChange}
            />
            <Label htmlFor="select-all-machines" className="font-semibold">
                Select All / Deselect All
            </Label>
            </div>
            <ScrollArea className="h-40 w-full rounded-md border p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2">
                {allMachines.map(machine => (
                <div key={machine} className="flex items-center space-x-2">
                    <Checkbox
                    id={`machine-${machine.replace(/\s+/g, '-')}`} // Create a valid ID
                    checked={selectedMachines.includes(machine)}
                    onCheckedChange={(checked) => handleMachineChange(machine, !!checked)}
                    />
                    <Label htmlFor={`machine-${machine.replace(/\s+/g, '-')}`} className="text-sm">
                    {machine}
                    </Label>
                </div>
                ))}
            </div>
            </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
