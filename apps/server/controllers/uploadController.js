const { parseZip } = require('../services/zipParser');
const { analyzeArchitecture } = require('../services/aiAnalyzer');
const { formatResponse } = require('../services/responseFormatter');
const { deleteFile } = require('../utils/cleanup');

/**
 * ZIP 파일 업로드 및 분석 컨트롤러
 */
async function handleUpload(req, res, next) {
  const filePath = req.file?.path;

  try {
    if (!req.file) {
      const error = new Error('No file uploaded');
      error.code = 'NO_FILE';
      throw error;
    }

    console.log(`[${new Date().toISOString()}] Upload received: ${req.file.originalname}`);

    // 1. ZIP 파싱
    const parsedData = await parseZip(filePath);

    // 2. 2단계 AI 분석
    const aiResult = await analyzeArchitecture(parsedData);

    // 3. 응답 포매팅
    const response = formatResponse(aiResult, parsedData);

    // 4. ZIP 파일 삭제
    await deleteFile(filePath);

    // 5. 응답 전송
    console.log(`[${new Date().toISOString()}] Analysis completed successfully`);
    res.json(response);

  } catch (error) {
    // 에러 발생 시 파일 삭제
    if (filePath) {
      await deleteFile(filePath);
    }
    next(error);
  }
}

module.exports = {
  handleUpload
};
