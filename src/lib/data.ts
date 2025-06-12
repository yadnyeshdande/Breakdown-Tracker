import type { BreakdownPost, SparePart, SparePartInput, BreakdownPostInput, SpareConsumption } from './types';

let breakdowns: BreakdownPost[] = [];
let spareParts: SparePart[] = [];

// --- Spare Parts ---

export async function getSpareParts(): Promise<SparePart[]> {
  return JSON.parse(JSON.stringify(spareParts)); // Deep copy
}

export async function getSparePartById(id: string): Promise<SparePart | undefined> {
  return JSON.parse(JSON.stringify(spareParts.find(sp => sp.id === id)));
}

export async function addSparePart(sparePartInput: SparePartInput): Promise<SparePart> {
  const now = new Date().toISOString();
  const newSparePart: SparePart = {
    id: crypto.randomUUID(),
    ...sparePartInput,
    createdAt: now,
    updatedAt: now,
  };
  spareParts.push(newSparePart);
  return JSON.parse(JSON.stringify(newSparePart));
}

export async function updateSparePart(id: string, updates: Partial<SparePartInput> & { quantity?: number }): Promise<SparePart | undefined> {
  const sparePartIndex = spareParts.findIndex(sp => sp.id === id);
  if (sparePartIndex === -1) return undefined;

  spareParts[sparePartIndex] = {
    ...spareParts[sparePartIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return JSON.parse(JSON.stringify(spareParts[sparePartIndex]));
}

export async function deleteSparePart(id: string): Promise<boolean> {
  const initialLength = spareParts.length;
  spareParts = spareParts.filter(sp => sp.id !== id);
  return spareParts.length < initialLength;
}

// --- Breakdowns ---

export async function getBreakdownPosts(): Promise<BreakdownPost[]> {
  return JSON.parse(JSON.stringify(breakdowns));
}

export async function getBreakdownPostById(id: string): Promise<BreakdownPost | undefined> {
  return JSON.parse(JSON.stringify(breakdowns.find(b => b.id === id)));
}

export async function addBreakdownPost(breakdownInput: BreakdownPostInput): Promise<BreakdownPost> {
  const now = new Date().toISOString();
  
  const detailedSparesConsumed: SpareConsumption[] = [];
  for (const consumed of breakdownInput.sparesConsumed) {
    const spare = await getSparePartById(consumed.sparePartId);
    if (spare) {
      detailedSparesConsumed.push({
        sparePartId: spare.id,
        partNumber: spare.partNumber,
        description: spare.description,
        quantityConsumed: consumed.quantityConsumed,
      });
      // Actual inventory reduction happens in server action
    }
  }

  const newBreakdownPost: BreakdownPost = {
    id: crypto.randomUUID(),
    lossTime: breakdownInput.lossTime,
    line: breakdownInput.line,
    machine: breakdownInput.machine,
    description: breakdownInput.description,
    category: breakdownInput.category,
    sparesConsumed: detailedSparesConsumed,
    createdAt: now,
    updatedAt: now,
  };
  breakdowns.unshift(newBreakdownPost); // Add to the beginning of the list
  return JSON.parse(JSON.stringify(newBreakdownPost));
}

// Mock some initial data for demonstration
function initializeMockData() {
  if (spareParts.length === 0) {
    const mockSpares: SparePartInput[] = [
      { partNumber: 'SP-001', description: 'Motor 5HP', quantity: 10, location: 'Shelf A1' },
      { partNumber: 'SP-002', description: 'Bearing XYZ', quantity: 25, location: 'Bin B3' },
      { partNumber: 'SP-003', description: 'Sensor ABC', quantity: 5, location: 'Cabinet C2' },
    ];
    mockSpares.forEach(async (sp) => {
      const addedSpare = await addSparePart(sp);
      // Add some breakdowns if spares were added successfully
      if (breakdowns.length === 0 && addedSpare.id === 'mock-id-1') { // Ensure IDs are consistent if needed, or use partNumber
         // This logic of adding breakdown here is a bit convoluted due to async nature and UUIDs.
         // For simplicity, let's just assume the first spare is added.
      }
    });
  }

  // Check if first spare is added to add sample breakdown, using a timeout to ensure spares are populated.
  // This is a hack for in-memory store. A real DB would be simpler.
  setTimeout(() => {
    if (breakdowns.length === 0 && spareParts.length > 0) {
        const firstSpare = spareParts[0];
        const secondSpare = spareParts.length > 1 ? spareParts[1] : null;

        const mockBreakdowns: BreakdownPostInput[] = [
          { 
            lossTime: 120, line: 'Packaging Line 1', machine: 'Filler Machine', 
            description: 'Motor failed, replaced.', category: 'Electrical',
            sparesConsumed: firstSpare ? [{ sparePartId: firstSpare.id, quantityConsumed: 1 }] : []
          },
          { 
            lossTime: 45, line: 'Assembly Line 2', machine: 'Robot Arm B', 
            description: 'Sensor malfunction.', category: 'Instrumentation',
            sparesConsumed: secondSpare ? [{ sparePartId: secondSpare.id, quantityConsumed: 2 }] : []
          },
        ];
        mockBreakdowns.forEach(b => addBreakdownPost(b));
      }
  }, 100); // Small delay to allow spares to be added.
}

initializeMockData();
