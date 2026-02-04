import * as fs from 'fs';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as path from 'path';
import 'winston-daily-rotate-file';

const logsDir = path.join(process.cwd(), 'logs');

// logsDir이 없으면 자동 생성
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Gemini API 메트릭 전용 로그 포맷
 * CSV 형식으로 저장
 */
const geminiMetricsFormat = winston.format.printf(({ message, timestamp }) => {
  return `${String(timestamp)},${String(message)}`;
});

/**
 * Winston 로거 설정
 */
export const winstonConfig: winston.LoggerOptions = {
  transports: [
    // 콘솔 출력 (개발용)
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('Server', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),

    // 전체 로그 파일 (일별 로테이션)
    new winston.transports.DailyRotateFile({
      dirname: logsDir,
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '10m',
      maxFiles: '14d',
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),

    // 에러 로그 파일 (일별 로테이션)
    new winston.transports.DailyRotateFile({
      dirname: logsDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '10m',
      maxFiles: '14d',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
};

/**
 * Gemini 메트릭 전용 로거 (CSV)
 */
const geminiMetricsTransport = new winston.transports.DailyRotateFile({
  dirname: logsDir,
  filename: 'gemini-metrics-%DATE%.csv',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    geminiMetricsFormat,
  ),
});

export const geminiMetricsLogger = winston.createLogger({
  transports: [geminiMetricsTransport],
});

// CSV 헤더 추가 (파일이 새로 생성될 때만)
geminiMetricsTransport.on('new', () => {
  geminiMetricsLogger.info(
    'step,inputTokens,outputTokens,totalTokens,responseTimeMs,model,success',
  );
});

/**
 * 분석 Job 메트릭 전용 로거 (CSV)
 */
const analysisMetricsTransport = new winston.transports.DailyRotateFile({
  dirname: logsDir,
  filename: 'analysis-metrics-%DATE%.csv',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    geminiMetricsFormat,
  ),
});

export const analysisMetricsLogger = winston.createLogger({
  transports: [analysisMetricsTransport],
});

// CSV 헤더 추가
analysisMetricsTransport.on('new', () => {
  analysisMetricsLogger.info(
    'analysisId,projectId,step,durationMs,geminiCalls,success',
  );
});
