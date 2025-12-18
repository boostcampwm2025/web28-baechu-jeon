const fs = require('fs').promises;
const path = require('path');

/**
 * 파일 삭제 유틸리티
 * @param {string} filePath - 삭제할 파일 경로
 */
async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
    console.log(`[${new Date().toISOString()}] File deleted: ${filePath}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to delete file: ${filePath}`, error.message);
  }
}

/**
 * 임시 폴더 정리
 * @param {string} folderPath - 정리할 폴더 경로
 * @param {number} maxAge - 파일 최대 보관 시간 (밀리초, 기본 1시간)
 */
async function cleanupOldFiles(folderPath, maxAge = 3600000) {
  try {
    const files = await fs.readdir(folderPath);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = await fs.stat(filePath);

      if (now - stats.mtimeMs > maxAge) {
        await deleteFile(filePath);
      }
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Cleanup failed:`, error.message);
  }
}

module.exports = {
  deleteFile,
  cleanupOldFiles
};
