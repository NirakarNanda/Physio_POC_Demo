import type { Db } from "../types";
import { JsonFileDb } from "./jsonRepo";
import { MongoDb } from "./mongoRepo";

let db: Db | null = null;
let mode: "mongo" | "json" = "json";

// Initialize the data layer. If MONGODB_URI is set and reachable we use
// MongoDB; otherwise we silently fall back to the JSON-file store so the
// demo always works offline.
export async function initDb(): Promise<Db> {
  if (db) return db;
  const uri = (process.env.MONGODB_URI ?? "").trim();
  if (uri) {
    try {
      const mongo = new MongoDb(uri);
      await mongo.connect();
      db = mongo;
      mode = "mongo";
      console.log("[db] connected to MongoDB");
      return db;
    } catch (err) {
      console.warn("[db] MongoDB connection failed, falling back to JSON-file store:", (err as Error).message);
    }
  } else {
    console.log("[db] no MONGODB_URI set, using JSON-file store (path logged below)");
  }
  db = new JsonFileDb();
  mode = "json";
  return db;
}

export function getDb(): Db {
  if (!db) throw new Error("DB not initialized. Call initDb() first.");
  return db;
}

export function getDbMode(): "mongo" | "json" {
  return mode;
}
