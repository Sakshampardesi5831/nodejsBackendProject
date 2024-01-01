import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadOnCloudinary = async (filepath) => {
  try {
    if (!filepath) return null;
    const uplaodedFileResponse = await cloudinary.uploader.upload(filepath, {
      resource_type: "auto",
    });

    //FILE UPLOAD SUCCESSFULLY
    console.log("FILE UPLOAD SUCCESSFULLY ON CLOUDINARY"+uplaodedFileResponse.url);
     return uplaodedFileResponse
  } catch (error) {
     fs.unlinkSync(filepath); //remove the locally saved temporary file as operation got failed 
  }
};


export { uploadOnCloudinary };