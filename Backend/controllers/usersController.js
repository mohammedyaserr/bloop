import { db } from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadProfilePhoto = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  return res.status(200).json({ success: true, avatar: fileUrl });
};

export const updateProfile = (req, res) => {
  const userId = req.body.userId || req.query.userId || req.headers['x-user-id'] || req.headers['user-id'];
  const { avatar } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required.' });
  }

  // 1. Get old avatar to delete it if it is a local file
  db.query('SELECT avatar FROM users WHERE id = ?', [userId], (err, results) => {
    if (!err && results && results[0] && results[0].avatar) {
      const oldAvatar = results[0].avatar;
      // Do not delete if the new avatar is the same as the old one
      if (oldAvatar !== avatar && oldAvatar.includes('/uploads/')) {
        const filename = oldAvatar.substring(oldAvatar.lastIndexOf('/') + 1);
        const filePath = path.join(__dirname, '../public/uploads', filename);
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.warn('Failed to delete old avatar:', unlinkErr.message);
        });
      }
    }

    // 2. Update DB
    db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatar, userId], (updateErr) => {
      if (updateErr) {
        console.error(updateErr);
        return res.status(500).json({ success: false, message: 'Database update failed.' });
      }
      return res.status(200).json({ success: true, message: 'Profile updated successfully.' });
    });
  });
};

export const removeProfilePhoto = (req, res) => {
  const userId = req.body.userId || req.query.userId || req.headers['x-user-id'] || req.headers['user-id'];

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required.' });
  }

  db.query('SELECT avatar FROM users WHERE id = ?', [userId], (err, results) => {
    if (!err && results && results[0] && results[0].avatar) {
      const oldAvatar = results[0].avatar;
      if (oldAvatar.includes('/uploads/')) {
        const filename = oldAvatar.substring(oldAvatar.lastIndexOf('/') + 1);
        const filePath = path.join(__dirname, '../public/uploads', filename);
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.warn('Failed to delete old avatar:', unlinkErr.message);
        });
      }
    }

    db.query('UPDATE users SET avatar = NULL WHERE id = ?', [userId], (updateErr) => {
      if (updateErr) {
        console.error(updateErr);
        return res.status(500).json({ success: false, message: 'Database update failed.' });
      }
      return res.status(200).json({ success: true });
    });
  });
};
