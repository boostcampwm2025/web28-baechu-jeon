import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    ten_users_start_once: {
      executor: 'per-vu-iterations',
      vus: 80,
      iterations: 1,
      maxDuration: '3m',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const PROJECT_ID = __ENV.PROJECT_ID || '';

export default function () {
  sleep(Math.random() * 10); // 0~10초 랜덤 대기 후 요청
  if (!PROJECT_ID) {
    console.warn(
      'Set PROJECT_ID to run this test. Example: PROJECT_ID=... k6 run ...',
    );
    sleep(1);
    return;
  }

  const startRes = http.post(`${BASE_URL}/api/analyses/${PROJECT_ID}`);
  const startOk = check(startRes, {
    'analysis accepted (202)': (r) => r.status === 202,
  });

  // 0~3초 사이 랜덤 대기
  sleep(Math.random() * 3);
}
