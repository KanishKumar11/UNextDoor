import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/index.js';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create audio directory if it doesn't exist
const audioDir = path.join(uploadsDir, 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

/**
 * Upload audio file to storage
 * @param {Buffer} buffer - Audio file buffer
 * @param {string} fileName - File name
 * @returns {Promise<string>} URL of the uploaded file
 */
export const uploadAudio = async (buffer, fileName) => {
  try {
    // Generate unique file name
    const uniqueFileName = `${uuidv4()}-${fileName}`;
    const filePath = path.join(audioDir, uniqueFileName);
    
    // Write file to disk
    await fs.promises.writeFile(filePath, buffer);
    
    // Return URL
    const baseUrl = config.baseUrl || `http://localhost:${config.port}`;
    return `${baseUrl}/uploads/audio/${uniqueFileName}`;
  } catch (error) {
    console.error('Error uploading audio:', error);
    throw new Error('Failed to upload audio');
  }
};

/**
 * Get audio file URL
 * @param {string} fileName - File name
 * @returns {string} URL of the file
 */
export const getAudioUrl = (fileName) => {
  const baseUrl = config.baseUrl || `http://localhost:${config.port}`;
  return `${baseUrl}/uploads/audio/${fileName}`;
};

/**
 * Delete audio file
 * @param {string} url - URL of the file to delete
 * @returns {Promise<boolean>} True if deleted successfully
 */
export const deleteAudio = async (url) => {
  try {
    // Extract file name from URL
    const fileName = url.split('/').pop();
    const filePath = path.join(audioDir, fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return false;
    }
    
    // Delete file
    await fs.promises.unlink(filePath);
    return true;
  } catch (error) {
    console.error('Error deleting audio:', error);
    return false;
  }
};
