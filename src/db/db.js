import mongoose from "mongoose";
import { DB_NAME } from "../contants.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(` \n Mongo DB Connected !! DB_HOST: ${conn.connection.host}`);
  } catch (error) {
    console.error("Mongo DB FAILED" + error.message);
    process.exit(1);
  }
};

export default connectDB;
