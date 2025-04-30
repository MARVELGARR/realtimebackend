import multer from "multer";

// Configure Multer storage (temporary, before uploading to Cloudinary)
const storage = multer.memoryStorage(); // Use memory storage for buffer uploads

// Filter allowed file types (optional)
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"));
    }
};

// Create Multer instance
export const upload = multer({ storage, fileFilter });