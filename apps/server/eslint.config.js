import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default defineConfig([
  // 특정 폴더 무시
  globalIgnores(['dist', 'node_modules']),

  {
    files: ['**/*.js'], // JS 파일만 lint
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node, // Node 글로벌
    },
    extends: [js.configs.recommended, prettierConfig],
    plugins: { prettier: prettierPlugin },
    rules: {
      'prettier/prettier': 'error',
      'no-console': 'off', // 서버 콘솔 허용
    },
  },
]);
