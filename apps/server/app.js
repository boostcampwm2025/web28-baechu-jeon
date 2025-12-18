require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// 라우터 및 미들웨어
const uploadRouter = require('./routes/upload');
const errorHandler = require('./middleware/errorHandler');

// Express 앱 생성
const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 설정
app.use(cors()); // CORS 허용
app.use(morgan('dev')); // 로깅
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: false })); // URL 인코딩

// uploads 디렉토리 확인 및 생성
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads', 'temp');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads/temp directory');
}

// 라우트 설정
app.use('/api/upload', uploadRouter);

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 루트 경로
app.get('/', (req, res) => {
  res.json({
    message: 'Project Structure Analyzer API',
    version: '1.0.0',
    endpoints: {
      upload: 'POST /api/upload',
      health: 'GET /health'
    }
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

// 에러 핸들러 (반드시 마지막에 위치)
app.use(errorHandler);

// 서버 시작
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  Server is running on port ${PORT}       ║
║  Environment: ${process.env.NODE_ENV || 'development'}              ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
