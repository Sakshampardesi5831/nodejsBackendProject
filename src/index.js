import dotenv from "dotenv";
import connectDB from "./db/db.js";
import morgan from "morgan";
dotenv.config({
  path: "./.env",
});

connectDB();
