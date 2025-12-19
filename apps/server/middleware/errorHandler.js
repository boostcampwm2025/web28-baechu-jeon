const { deleteFile } = require('../utils/cleanup');

/**
 * 에러 핸들러 미들웨어
 */
function errorHandler(err, req, res, next) {
  // 업로드된 파일이 있으면 삭제
  if (req.file) {
    deleteFile(req.file.path);
  }

  console.error(`[${new Date().toISOString()}] Error:`, err.message);

  // 에러 코드별 처리
  const errorMap = {
    LIMIT_FILE_SIZE: {
      code: 'FILE_TOO_LARGE',
      message: '파일 크기는 250MB 이하여야 합니다.',
    },
    INVALID_ZIP: {
      code: 'INVALID_ZIP',
      message: '유효하지 않은 ZIP 파일입니다.',
    },
    AI_ERROR: {
      code: 'AI_ERROR',
      message: 'AI 분석 중 오류가 발생했습니다.',
    },
    PARSE_ERROR: {
      code: 'PARSE_ERROR',
      message: 'ZIP 파일 파싱 중 오류가 발생했습니다.',
    },
  };

  const error = errorMap[err.code] || {
    code: 'UNKNOWN_ERROR',
    message: err.message || '알 수 없는 오류가 발생했습니다.',
  };

  res.status(err.statusCode || 500).json({
    success: false,
    error,
  });
}

module.exports = errorHandler;
