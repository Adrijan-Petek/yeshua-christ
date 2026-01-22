import { MongoClient } from "mongodb";

declare global {
  var __ycMongoClient: MongoClient | undefined;
  var __ycMongoClientPromise: Promise<MongoClient> | undefined;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export async function getMongoClient(): Promise<MongoClient> {
  if (global.__ycMongoClient) return global.__ycMongoClient;
  if (global.__ycMongoClientPromise) return global.__ycMongoClientPromise;

  const uri = requireEnv("MONGODB_URI");
  const client = new MongoClient(uri);

  global.__ycMongoClientPromise = client.connect().then((connected) => {
    global.__ycMongoClient = connected;
    return connected;
  });

  return global.__ycMongoClientPromise;
}

export async function getMongoDb() {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB || undefined;
  return dbName ? client.db(dbName) : client.db();
}
