import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    eighty_users_once: {
      executor: 'per-vu-iterations',
      vus: 80, // 동시 사용자 80명
      iterations: 1, // 1명당 1번만 요청
      maxDuration: '2m',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // 실패율 1% 미만
    http_req_duration: ['p(95)<30000'], // POST 응답 30초 이내 (사실상 바로 와야 정상)
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const PROJECT_ID = __ENV.PROJECT_ID;

export default function () {
  const res = http.post(`${BASE_URL}/api/analyses/${PROJECT_ID}`, null, {
    timeout: '60s',
  });

  check(res, {
    'status is 202': (r) => r.status === 202,
  });

  sleep(1);
}
