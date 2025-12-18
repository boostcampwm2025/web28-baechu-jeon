const express = require('express');
const upload = require('../middleware/upload');
const { handleUpload } = require('../controllers/uploadController');

const router = express.Router();

/**
 * POST /api/upload
 * ZIP 파일 업로드 및 분석
 */
router.post('/', upload.single('file'), handleUpload);

module.exports = router;
