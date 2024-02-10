import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
function uploadToCloudinaryAndDelete(file) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file.path,
      { folder: "samples" },
      (error, result) => {
        console.log(result);
        if (error) {
          console.log(error);
          reject(error);
        } else {
          // Delete the file from disk
          fs.unlink(file.path, (err) => {
            if (err) {
              console.error("Error deleting file:", err);
            } else {
              console.log("File deleted successfully");
            }
          });
          resolve(result.url);
        }
      }
    );
  });
}
export { uploadToCloudinaryAndDelete };
