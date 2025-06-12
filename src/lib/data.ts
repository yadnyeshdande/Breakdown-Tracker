import type { Collection, Db } from 'mongodb';
import clientPromise from './mongodb';
import type { BreakdownPost, SparePart, SparePartInput, BreakdownPostInput, SpareConsumption } from './types';

let db: Db;
let sparePartsCollection: Collection<Omit<SparePart, 'id'>>;
let breakdownsCollection: Collection<Omit<BreakdownPost, 'id'>>;


async function getDb() {
  if (db) return db;
  const client = await clientPromise;
  db = client.db("AdminEase1"); // Use the database name from your connection string or specify here
  sparePartsCollection = db.collection<Omit<SparePart, 'id'>>('spareParts');
  breakdownsCollection = db.collection<Omit<BreakdownPost, 'id'>>('breakdowns');
  return db;
}

// Helper to map MongoDB document to our type (especially _id to id and date conversions)
function mapMongoDocToSparePart(doc: any): SparePart {
  if (!doc) return doc;
  const { _id, createdAt, updatedAt, ...rest } = doc;
  return {
    id: _id.toString(),
    createdAt: createdAt instanceof Date ? createdAt.toISOString() : createdAt,
    updatedAt: updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt,
    ...rest
  } as SparePart;
}

function mapMongoDocToBreakdownPost(doc: any): BreakdownPost {
  if (!doc) return doc;
  const { _id, createdAt, updatedAt, ...rest } = doc;
  return {
    id: _id.toString(),
    createdAt: createdAt instanceof Date ? createdAt.toISOString() : createdAt,
    updatedAt: updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt,
    ...rest
  } as BreakdownPost;
}


// --- Spare Parts ---

export async function getSpareParts(): Promise<SparePart[]> {
  await getDb();
  const sparesFromDb = await sparePartsCollection.find({}).sort({ createdAt: -1 }).toArray();
  return sparesFromDb.map(mapMongoDocToSparePart);
}

export async function getSparePartById(id: string): Promise<SparePart | undefined> {
  await getDb();
  const spareFromDb = await sparePartsCollection.findOne({ _id: id as any }); // Use `id` as `_id`
  return spareFromDb ? mapMongoDocToSparePart(spareFromDb) : undefined;
}

export async function addSparePart(sparePartInput: SparePartInput): Promise<SparePart> {
  await getDb();
  const now = new Date();
  const newSparePartId = crypto.randomUUID();
  const newSparePartDoc = {
    _id: newSparePartId, // Use generated UUID as _id
    ...sparePartInput,
    createdAt: now,
    updatedAt: now,
  };
  await sparePartsCollection.insertOne(newSparePartDoc as any);
  return mapMongoDocToSparePart(newSparePartDoc); // Return the mapped object
}

export async function updateSparePart(id: string, updates: Partial<Omit<SparePartInput, 'createdAt' | 'updatedAt'>> & { quantity?: number }): Promise<SparePart | undefined> {
  await getDb();
  const updateDoc = {
    $set: {
      ...updates,
      updatedAt: new Date(),
    },
  };
  const result = await sparePartsCollection.findOneAndUpdate(
    { _id: id as any },
    updateDoc,
    { returnDocument: 'after' }
  );
  return result ? mapMongoDocToSparePart(result) : undefined;
}

export async function deleteSparePart(id: string): Promise<boolean> {
  await getDb();
  const result = await sparePartsCollection.deleteOne({ _id: id as any });
  return result.deletedCount === 1;
}

// --- Breakdowns ---

export async function getBreakdownPosts(): Promise<BreakdownPost[]> {
  await getDb();
  const breakdownsFromDb = await breakdownsCollection.find({}).sort({ createdAt: -1 }).toArray();
  return breakdownsFromDb.map(mapMongoDocToBreakdownPost);
}

export async function getBreakdownPostById(id: string): Promise<BreakdownPost | undefined> {
  await getDb();
  const breakdownFromDb = await breakdownsCollection.findOne({ _id: id as any });
  return breakdownFromDb ? mapMongoDocToBreakdownPost(breakdownFromDb) : undefined;
}

export async function addBreakdownPost(breakdownInput: BreakdownPostInput): Promise<BreakdownPost> {
  await getDb();
  const now = new Date();
  
  const detailedSparesConsumed: SpareConsumption[] = [];
  if (breakdownInput.sparesConsumed && breakdownInput.sparesConsumed.length > 0) {
    for (const consumed of breakdownInput.sparesConsumed) {
      const spare = await getSparePartById(consumed.sparePartId); // This now hits MongoDB
      if (spare) {
        detailedSparesConsumed.push({
          sparePartId: spare.id,
          partNumber: spare.partNumber,
          description: spare.description,
          quantityConsumed: consumed.quantityConsumed,
        });
      } else {
        console.warn(`Spare part with id ${consumed.sparePartId} not found during breakdown creation.`);
        // Potentially throw an error here or handle as per business logic
      }
    }
  }
  
  const newBreakdownId = crypto.randomUUID();
  const newBreakdownPostDoc = {
    _id: newBreakdownId, // Use generated UUID as _id
    lossTime: breakdownInput.lossTime,
    line: breakdownInput.line,
    machine: breakdownInput.machine,
    description: breakdownInput.description,
    category: breakdownInput.category,
    sparesConsumed: detailedSparesConsumed, // Store the detailed, denormalized list
    createdAt: now,
    updatedAt: now,
  };

  await breakdownsCollection.insertOne(newBreakdownPostDoc as any);
  return mapMongoDocToBreakdownPost(newBreakdownPostDoc);
}
