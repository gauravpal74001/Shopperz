import multer from "multer";
import {v4 as uuid} from "uuid";

const storage = multer.memoryStorage();

export const singleUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single("photo");

export const multipleUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).array("photos", 5);