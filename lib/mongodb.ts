import { MongoClient, Db, MongoClientOptions } from "mongodb";

/**
 * Server-only MongoDB connection with global caching.
 * This file is NEVER bundled into client code — it's only used in:
 *   - app/api/* (API routes)
 *   - lib/data.ts (called from Server Components & generateStaticParams)
 */

const MONGODB_URI = process.env.MONGODB_URI || "";
const DATABASE_NAME = process.env.MONGODB_DATABASE || "portfolio_db";

const globalWithMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

function getClientPromise(): Promise<MongoClient> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set.");
  }

  if (globalWithMongo._mongoClientPromise) {
    return globalWithMongo._mongoClientPromise;
  }

  const options: MongoClientOptions = {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    retryWrites: true,
  };

  const client = new MongoClient(MONGODB_URI, options);
  const promise = client.connect().then((c) => {
    console.log("✅ Connected to MongoDB.");
    return c;
  });

  if (process.env.NODE_ENV === "development") {
    globalWithMongo._mongoClientPromise = promise;
  }

  return promise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(DATABASE_NAME);
}

export const COLLECTION_NAME = process.env.MONGODB_COLLECTION || "portfolio";
export const DOC_ID = "main_portfolio_content";