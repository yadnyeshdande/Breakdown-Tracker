export type BreakdownCategory = 'Electrical' | 'Mechanical' | 'Instrumentation' | 'Other';

export const breakdownCategories: BreakdownCategory[] = ['Electrical', 'Mechanical', 'Instrumentation', 'Other'];

export type SpareConsumption = {
  sparePartId: string;
  partNumber: string; // Denormalized for display in breakdown details
  description: string; // Denormalized for display
  quantityConsumed: number;
};

export type BreakdownPost = {
  id: string; // Should map to MongoDB _id (string UUID)
  lossTime: number; // in minutes
  line: string;
  machine: string;
  description: string;
  category: BreakdownCategory;
  sparesConsumed: SpareConsumption[];
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
};

export type SparePart = {
  id:string; // Should map to MongoDB _id (string UUID)
  partNumber: string;
  description: string;
  quantity: number;
  location: string;
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
};

// For forms - input types should not contain DB-generated fields like id, createdAt, updatedAt
export type BreakdownPostInput = Omit<BreakdownPost, 'id' | 'createdAt' | 'updatedAt' | 'sparesConsumed'> & {
  sparesConsumed: Array<{ sparePartId: string; quantityConsumed: number }>;
};

export type SparePartInput = Omit<SparePart, 'id' | 'createdAt' | 'updatedAt'>;
