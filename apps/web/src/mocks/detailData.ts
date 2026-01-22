// 시각화 노드 데이터 Mock
export const mockNodes = [
  {
    id: "1",
    label: "routing_control_modules",
    groups: "",
    contents:
      "API 및 페이지 경로를 정의하는 Express 라우터 모듈들이 모여 있는 곳입니다.",
    type: "group",
  },
  {
    id: "2",
    label: "API Router",
    groups: ["routing_control_modules"],
    contents:
      "API 엔드포인트와 페이지 경로를 분리하여 관리하며, 비즈니스 로직과 데이터 접근을 연결하는 컨트롤러 역할을 수행함",
    type: "folder",
  },
];

// 프로젝트 목적 데이터 Mock (Step 3 JSON 기반)
export const mockProjectDetails = {
  overview:
    "Node.js와 Express를 기반으로 구축된 '코드스타그램(Codestagram)'이라는 이름의 소셜 미디어 웹 애플리케이션 학습 및 구현 프로젝트입니다.",
  purpose:
    "전통적인 서버 사이드 렌더링(SSR) 방식에서 현대적인 클라이언트 사이드 렌더링(CSR) 및 비동기 통신 방식으로의 전환 과정을 학습하고, REST API 설계 및 세션 기반 인증 시스템을 직접 구현하는 데 목적이 있습니다.",
  key_features: [
    "EJS를 이용한 서버 사이드 렌더링 페이지 구성",
    "fetch API를 활용한 비동기 데이터 갱신 (댓글, 좋아요 등)",
    "Express-session을 이용한 로그인/로그아웃 및 세션 관리",
    "LowDB 및 JSON 파일을 활용한 게시글 및 유저 데이터 CRUD",
    "이벤트 위임(Event Delegation)을 통한 클라이언트 성능 최적화",
  ],
  technology_stack: {
    backend: ["Node.js", "Express.js", "LowDB (JSON Database)"],
    frontend: ["HTML5/CSS3", "Vanilla JavaScript", "EJS Template Engine"],
    infrastructure: ["Nodemon", "GitHub Actions (CI/CD)"],
  },
  architectural_tendencies:
    "초기에는 Express와 EJS를 활용한 전형적인 MVC(Model-View-Controller) 패턴의 SSR 구조로 시작하였으나, 프로젝트가 진행됨에 따라 API 라우터를 분리하고 fetch API를 사용하는 하이브리드 형태(SSR+CSR)의 아키텍처를 지향하고 있습니다. 데이터 레이어는 복잡한 DBMS 대신 LowDB를 사용한 파일 기반 데이터 영속성 구조를 채택하여 학습의 직관성을 높였습니다.",
};
