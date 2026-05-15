import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, ".env") });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI not found in .env");
  process.exit(1);
}

// Define minimal schema for update
const userSchema = new mongoose.Schema({
  appKey: { type: String, default: "edoc" }
}, { strict: false });

const User = mongoose.model("User", userSchema);

try {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const result = await User.updateMany(
    { appKey: { $exists: false } },
    { $set: { appKey: "edoc" } }
  );

  console.log(`Updated ${result.modifiedCount} users with appKey: "edoc"`);
  
  const total = await User.countDocuments();
  console.log(`Total users in database: ${total}`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
} catch (error) {
  console.error("Seed error:", error);
  process.exit(1);
}
