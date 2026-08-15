import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { env } from './env.js';

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Upload a Buffer to Cloudinary
 */
export const uploadToCloudinary = (
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'compliance_documents'
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    // If Cloudinary is not configured in dev, generate mock response
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY) {
      const mockPublicId = `${folder}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const mockUrl = `https://res.cloudinary.com/demo/image/upload/v1700000000/${mockPublicId}.pdf`;
      return resolve({ url: mockUrl, publicId: mockPublicId });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        filename_override: fileName,
        use_filename: true,
      },
      (error: unknown, result?: UploadApiResponse) => {
        if (error || !result) {
          return reject(error || new Error('Failed to upload attachment to Cloudinary'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete a file from Cloudinary by Public ID
 */
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  if (!publicId) return true;

  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY) {
    console.log(`[Cloudinary Mock] Deleting publicId: ${publicId}`);
    return true;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });
    return result.result === 'ok' || result.result === 'not found';
  } catch (error) {
    console.error(`Failed to delete asset from Cloudinary (${publicId}):`, error);
    return false;
  }
};

export default cloudinary;
