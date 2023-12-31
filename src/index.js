import dotenv from "dotenv";
import connectDB from "./db/db.js";
import app from "./app.js";
import morgan from "morgan";
dotenv.config({
  path: "./.env",
});
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is running${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongo db connection failed" + err);
  });
