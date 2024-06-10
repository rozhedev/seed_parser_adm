import dotenv = require("dotenv");
import path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// * Reexport with type assertion, for prevent typisation errors.
// * e.g: "string | undefined" with "string"
export const BOT_TOKEN = process.env.BOT_TOKEN as string;
export const DB_LOGIN = process.env.DB_LOGIN as string;
export const DB_PASS = process.env.DB_PASS as string;
export const DB_NAME = process.env.DB_NAME as string;
export const COLLECTION_NAME = process.env.COLLECTION_NAME as string;

export const DB_URI = `mongodb+srv://${DB_LOGIN}:${DB_PASS}@seedbot.uhd4vd5.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=SeedBot`;
