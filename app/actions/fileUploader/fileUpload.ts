import { Response, Request, RequestHandler } from "express";
import cloudinary from "../../configs/cloudinary";

const singleFileUpload: RequestHandler = async (req: Request, res: Response) => {
  try {
    // Check if file is present
    if (!req.file) {
       res.status(400).json({ error: "No file uploaded" });
       return
    }
    console.log(req.file)

    // Convert buffer to base64 for Cloudinary
    const base64String = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder: "uploads", // Cloudinary folder
      resource_type: "auto", // Auto-detect file type
    });

    // Return the uploaded file URL
    if(result){

      res
        .status(200)
        .json({ message: "File uploaded successfully", url: result.secure_url });
        return
    }
    else{
      res
        .status(404)
        .json({ error: "File not uploaded "});
        return
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Upload failed" });
    return
  }
};

export default singleFileUpload;