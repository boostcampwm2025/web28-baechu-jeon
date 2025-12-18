const multer = require('multer');
const path = require('path');

/**
 * Multer 스토리지 설정
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/temp/'));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

/**
 * 파일 필터 - ZIP 파일만 허용
 */
const fileFilter = (req, file, cb) => {
  if (path.extname(file.originalname).toLowerCase() === '.zip') {
    cb(null, true);
  } else {
    cb(new Error('Only .zip files are allowed'));
  }
};

/**
 * Multer 인스턴스 생성
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB 제한
  }
});

module.exports = upload;
