/**
 * @module server/services
 */

import { v2 as cloudinary, UploadApiOptions } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";

// Cloudinary configuration
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

/**
 * Creates a new CloudinaryStorage instance with the specified folder and allowed formats.
 *
 * @param {string} folder - The folder where the files will be stored.
 * @returns {CloudinaryStorage} A new CloudinaryStorage instance configured with the specified folder and allowed formats.
 */
export const storage = (folder: string) =>
  new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      allowed_formats: ["jpg", "png", "jpeg", "gif"],
      folder: folder,
    } as any,
  });

/**
 * Uploads files to a specified folder using multer.
 *
 * @param {string} folder - The folder where the files will be uploaded.
 * @returns {Function} - A multer middleware configured with the specified storage.
 */
const upload = (folder: string) => multer({ storage: storage(folder) });

/**
 * Uploads an image to Cloudinary.
 *
 * @param {string} path - The local path to the image file to be uploaded.
 * @param {string} [folder='issues'] - The folder in Cloudinary where the image will be stored.
 * @returns {Promise<string>} - A promise that resolves to the URL of the uploaded image.
 * @throws {Error} - Throws an error if the upload fails.
 */
export const uploadImageToCloudinary = async (
  path: string,
  folder: string = "issues"
) => {
  try {
    const result = await cloudinary.uploader.upload(path, {
      folder: folder, // Dynamic folder for Cloudinary upload
      format: "auto",
    });
    return result.secure_url; // Return the URL of the uploaded image
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};
