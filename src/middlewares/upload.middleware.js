import multer from "multer";
import multerS3 from "multer-s3";
import { s3Client } from "../config/s3.config.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}-${uuidv4()}${ext}`;
      cb(null, `verifications/${filename}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG and PDF are allowed."), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const uploadSingle = (fieldName) => upload.single(fieldName);
