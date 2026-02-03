import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as path from 'path';

const logsDir = path.join(process.cwd(), 'logs');

/**
 * Gemini API 메트릭 전용 로그 포맷
 * CSV 형식으로 저장하여 나중에 분석하기 쉽게
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

    // 전체 로그 파일
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),

    // 에러 로그 파일
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
};

/**
 * Gemini 메트릭 전용 로거 (CSV 형식)
 * 사용: geminiMetricsLogger.info('step,inputTokens,outputTokens,totalTokens,responseTimeMs')
 */
export const geminiMetricsLogger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'gemini-metrics.csv'),
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        geminiMetricsFormat,
      ),
    }),
  ],
});

// CSV 헤더 추가 (파일이 새로 생성될 때)
geminiMetricsLogger.info(
  'step,inputTokens,outputTokens,totalTokens,responseTimeMs,model,success',
);

/**
 * 분석 Job 메트릭 전용 로거 (CSV 형식)
 */
export const analysisMetricsLogger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'analysis-metrics.csv'),
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        geminiMetricsFormat,
      ),
    }),
  ],
});

// CSV 헤더 추가
analysisMetricsLogger.info(
  'analysisId,projectId,step,durationMs,geminiCalls,success',
);
