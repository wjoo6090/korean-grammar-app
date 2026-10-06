# AI 품사 탐구 교실 — 실제 Gemini 피드백 연결 버전

학생 답안 → 서버의 문항별 기준 → Gemini 검토 → 기준별 판정·답안 인용·잘한 점·보완점·탐구 질문 → 답안 수정 흐름입니다. 고정 칭찬이나 키워드 채점으로 대체하지 않습니다. 실제 API 호출이 실패하면 오류를 표시합니다.

## 가장 간단한 배포: GitHub 저장소를 Vercel에 연결
1. ZIP을 풀고 **이 README와 같은 위치의 파일 및 폴더 전체**를 GitHub 저장소 최상위에 올립니다. public 폴더만 올리거나 ZIP 자체를 올리지 마세요.
2. Google AI Studio(https://aistudio.google.com/apikey)에서 Gemini API 키를 만듭니다. 키는 공개 코드나 채팅에 붙여 넣지 마세요.
3. Vercel(https://vercel.com) 로그인 → Add New → Project → 해당 GitHub 저장소 Import.
4. Framework Preset은 Other, Root Directory는 저장소 최상위. Build Command는 비워 두고 Output Directory는 public로 설정합니다(vercel.json에도 설정됨).
5. 배포 환경 변수(Environment Variables)에 아래 값을 추가합니다.

| 이름 | 값 |
|---|---|
| GEMINI_API_KEY | Google에서 발급한 API 키 |
| CLASS_CODE | 선생님이 정한 충분히 긴 수업 참여 코드 |
| GEMINI_MODEL | gemini-2.5-flash (생략하면 이 모델 사용) |

6. Deploy를 누릅니다. 나중에 환경 변수를 바꾸면 Redeploy합니다.
7. 배포된 https://프로젝트.vercel.app 주소에 접속하여 수업 참여 코드 입력 → 핵심 개념 정답 확인 → 서술형 답안 → AI 피드백 받기를 누릅니다.
8. 실제 수업 전, 올바른 답안·품사를 바꿔 쓴 답안·근거가 없는 답안으로 각각 확인합니다. 미리보기 배포의 로그인 보호가 걸려 있으면 학생에게는 접근 가능한 프로덕션 주소를 공유하세요.

GitHub는 코드 보관을 맡고 Vercel이 화면과 AI 평가 서버를 함께 실행합니다. 학생에게 Gemini 계정이나 개인 API 키를 요구하지 않습니다. API 사용량 및 비용은 선생님의 API 프로젝트에 귀속되며 한도에 도달하면 평가가 실패할 수 있습니다. 이 패키지는 계정을 만들거나 배포를 자동으로 완료하지 않습니다.

## 기존 GitHub Pages 주소를 유지하려면 (선택)
서버는 위 방법으로 Vercel에 먼저 배포합니다. public/config.js의 FEEDBACK_API_URL을 실제 https://프로젝트.vercel.app/api/evaluate 주소로 바꿉니다. Vercel의 ALLOWED_ORIGIN 환경 변수에는 https://깃허브아이디.github.io 를 입력합니다(저장소 경로와 끝 슬래시 제외). 다시 배포한 후 public/index.html과 public/config.js를 GitHub Pages 게시 폴더에 함께 올립니다. GitHub Pages만으로 api/evaluate.js는 실행되지 않습니다.

## 파일 구성
- public/index.html: 기존 세 문항, 답안 입력, 피드백 표시, 수정 및 다운로드
- public/config.js: AI 서버 주소만 지정. 비밀 키를 넣지 않음
- api/evaluate.js: 인증, 입력 검증, Gemini 요청, 결과 검증, 오류 처리
- lib/rubrics.js: 선생님이 수정할 문항별 평가 기준과 피드백 지시
- vercel.json: 정적 화면 및 서버 함수 배포 설정
- tests/evaluate.test.js: 외부 요청을 모의 응답으로 바꿔 검사하는 자동 테스트
- server.mjs: 선택적인 로컬 실행 서버

## 평가 방식
각 문항에 세 가지 기준을 적용하고 충족/부분 충족/미충족/판단 유보로 설명합니다. 실제 학생 답안에 존재하는 구절만 인용하도록 요청하고 서버에서도 인용의 존재를 검사합니다. 점수는 자동 부여하지 않습니다. AI의 문법 판단 자체가 항상 맞는 것은 아니므로 최종 평가는 교사가 확인합니다.
‘건강하세요’는 교과서의 일반적인 형용사 명령형 제약과 실제 인사말 사용을 구분하도록 지시했습니다. 실제 교과서·지도서의 상세 평가 기준과 맞추려면 lib/rubrics.js를 조정하세요.

## 기록과 데이터
답안과 문항 기준이 Google Gemini로 전달됩니다. 이름·학번을 수집하지 않습니다. 이 코드에는 답안 DB 저장이나 교사 일괄 수집 기능이 없습니다. 학생 화면의 최근 문항별 10회 기록은 메모리에만 있으며, 새로고침하면 사라집니다. 수업이 끝나기 전에 ‘내 답안·피드백 기록 다운로드’를 누릅니다. Google 및 호스팅 서비스의 데이터 처리는 해당 계정의 약관·설정에 따릅니다.
수업 참여 코드는 간단한 공용 접근 제한이며 학생별 로그인이나 엄격한 사용량 제한이 아닙니다. 수업 외 호출이 걱정되면 수업 후 코드를 변경하고, 서비스의 사용량 제한 설정을 함께 사용하세요.

## 로컬 실행 (선택, Node.js 22 이상)
.env.example을 .env로 복사한 후 실제 키와 참여 코드를 넣습니다.
`node --env-file=.env server.mjs`
브라우저에서 http://localhost:3000 접속. 로컬에서 index.html을 더블클릭하는 방식으로는 AI 평가가 되지 않습니다.
자동 테스트: `npm test`

## 검증 범위와 연결 확인
모의 Gemini 응답으로 서버의 세 문항 요청, 인증, 입력 길이, CORS, 응답 구조, 잘못된 인용, 시간 초과 및 API 오류 처리를 검증합니다. 실제 API 키가 제공되지 않아 Gemini 실호출과 교육적 피드백 품질 및 실배포는 검증하지 못했습니다. 브라우저 렌더링 검증도 수행하지 못했습니다.
- ‘서버 설정 필요’: 환경 변수 입력 후 재배포
- ‘참여 코드 확인’: CLASS_CODE와 학생 입력 일치 확인
- ‘요청 한도’: Gemini 사용량과 계정 한도 확인
- ‘서버 주소 확인’: Pages 게시 시 config.js와 ALLOWED_ORIGIN 확인
- ‘AI 서버 연결 실패’: 키의 모델 접근 권한과 GEMINI_MODEL 확인

공식 문서:
https://ai.google.dev/api/generate-content
https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash
https://vercel.com/docs/functions/runtimes/node-js
https://vercel.com/docs/environment-variables
