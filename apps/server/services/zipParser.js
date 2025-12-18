const yauzl = require('yauzl');
const { isTargetFile, shouldExclude } = require('../utils/fileExtractor');

/**
 * 트리 구조에 경로 추가
 * @param {Array} tree - 파일 트리
 * @param {string} path - 파일 경로
 * @param {string} type - 'file' 또는 'folder'
 */
function addToTree(tree, path, type) {
  const parts = path.split('/').filter(p => p);
  let current = tree;

  parts.forEach((part, index) => {
    const isLast = index === parts.length - 1;
    const existingNode = current.find(node => node.name === part);

    if (existingNode) {
      if (!isLast && existingNode.children) {
        current = existingNode.children;
      }
    } else {
      const newNode = {
        name: part,
        type: isLast ? type : 'folder',
        path: parts.slice(0, index + 1).join('/')
      };

      if (newNode.type === 'folder') {
        newNode.children = [];
      }

      current.push(newNode);

      if (!isLast && newNode.children) {
        current = newNode.children;
      }
    }
  });
}

/**
 * ZIP 파일 파싱
 * @param {string} zipPath - ZIP 파일 경로
 * @returns {Promise<{tree: Array, contents: Object}>}
 */
async function parseZip(zipPath) {
  return new Promise((resolve, reject) => {
    const tree = [];
    const contents = {};
    let fileCount = 0;
    let folderCount = 0;

    console.log(`[${new Date().toISOString()}] Starting ZIP parsing: ${zipPath}`);

    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        const error = new Error('Invalid ZIP file');
        error.code = 'INVALID_ZIP';
        return reject(error);
      }

      zipfile.readEntry();

      zipfile.on('entry', (entry) => {
        const fileName = entry.fileName;

        // 제외 폴더 스킵
        if (shouldExclude(fileName)) {
          zipfile.readEntry();
          return;
        }

        // 디렉토리 처리
        if (/\/$/.test(fileName)) {
          addToTree(tree, fileName, 'folder');
          folderCount++;
          zipfile.readEntry();
          return;
        }

        // 파일 처리
        addToTree(tree, fileName, 'file');
        fileCount++;

        // 타겟 파일이면 내용 추출
        if (isTargetFile(fileName)) {
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) {
              console.error(`Failed to read ${fileName}:`, err.message);
              zipfile.readEntry();
              return;
            }

            let content = '';
            readStream.on('data', (chunk) => {
              content += chunk.toString('utf8');
            });

            readStream.on('end', () => {
              // 너무 긴 파일은 자르기 (5000자)
              contents[fileName] = content.length > 5000
                ? content.substring(0, 5000) + '\n... (truncated)'
                : content;
              zipfile.readEntry();
            });

            readStream.on('error', (err) => {
              console.error(`Error reading stream for ${fileName}:`, err.message);
              zipfile.readEntry();
            });
          });
        } else {
          zipfile.readEntry();
        }
      });

      zipfile.on('end', () => {
        console.log(`[${new Date().toISOString()}] ZIP parsing completed: ${fileCount} files, ${folderCount} folders`);
        resolve({ tree, contents, fileCount, folderCount });
      });

      zipfile.on('error', (err) => {
        const error = new Error('ZIP parsing failed');
        error.code = 'PARSE_ERROR';
        reject(error);
      });
    });
  });
}

module.exports = {
  parseZip
};
