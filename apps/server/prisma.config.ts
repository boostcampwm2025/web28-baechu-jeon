import path from 'node:path';
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  // 'schema.prisma' 파일 대신 폴더 경로만 지정
  schema: path.join(__dirname, 'prisma'),

  datasource: {
    url: process.env.DATABASE_URL,
  },
});
