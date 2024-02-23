import { MongoClient, MongoClientOptions } from 'mongodb';

// src/components/component/mongo/mongodb.tsx

const uri = process.env.MONGODB_URI as string;

const options: MongoClientOptions = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, use a dedicated instance
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
