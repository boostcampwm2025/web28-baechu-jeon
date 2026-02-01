import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    realistic_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 5 }, // 처음 30초에 5명
        { duration: '30s', target: 10 }, // 다음 30초에 10명
        { duration: '30s', target: 15 }, // 다음 30초에 15명
      ],
      gracefulStop: '30s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'], // AI 서비스면 5%까지 허용
    http_req_duration: ['p(95)<5000'], // POST는 5초 안엔 와야 함
  },
};

const BASE_URL = __ENV.BASE_URL;
const PROJECT_ID = __ENV.PROJECT_ID;

export default function () {
  const res = http.post(`${BASE_URL}/api/analyses/${PROJECT_ID}`);
  check(res, {
    '202 accepted': (r) => r.status === 202,
  });

  // 유저가 버튼 누르고 멍 때리는 시간
  sleep(3);
}
