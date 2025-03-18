
import { Response, Request } from "express";
import  Cloudinary  from "../../configs/cloudinary";
import { upload } from '../../middleware/multer';


  const fileUpload = (req:Request, res: Response) => {
    const fileUpload = async (req: Request, res: Response) => {
      try {
          // Check if file is present
          if (!req.file) {
              return res.status(400).json({ error: "No file uploaded" });
          }
  
          // Convert buffer to base64 for Cloudinary
          const base64String = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  
          // Upload file to Cloudinary
          const result = await Cloudinary.uploader.upload(base64String, {
              folder: "uploads", // Cloudinary folder
              resource_type: "auto", // Auto-detect file type
          });
  
          // Return the uploaded file URL
          res.status(200).json({ message: "File uploaded successfully", url: result.secure_url });
      } catch (error) {
          res.status(500).json({ error: "Upload failed" });
      }
  };
  }
   
  export default fileUpload;