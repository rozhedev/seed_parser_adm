import { MongoClient } from "mongodb";
import { DB_URI } from "./env";

export const client: MongoClient = new MongoClient(DB_URI);

async function connectToDatabase() {
    try {
        await client.connect();
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}

connectToDatabase();