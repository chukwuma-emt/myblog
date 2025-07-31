const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'images'; // default

    if (file.mimetype.startsWith('video/')) {
      folder = 'videos';
    } else if (file.mimetype.startsWith('audio/')) {
      folder = 'audio';
    }

    const uploadPath = path.join(__dirname, '..', 'public', 'uploads', folder);

    // Create the folder if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// File filter for image, video, audio
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'video/mp4',
    'video/mov',
    'video/avi',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/m4a'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images, videos (mp4, mov, avi), and audio (mp3, wav, m4a) files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
