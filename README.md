# Character DM

인스타그램 DM 스타일의 모바일 우선 캐릭터 채팅 페이지입니다.

## 구성
- \`index.html\`: GitHub Pages에 올릴 정적 웹사이트
- \`worker.js\`: OpenAI API 키를 안전하게 보관하는 Cloudflare Worker 백엔드

## 1. GitHub Pages 켜기
저장소 Settings → Pages → Build and deployment에서 Deploy from a branch 선택,
Branch는 \`main\`, 폴더는 \`/ (root)\`로 설정하고 Save를 누르세요.
배포 주소는 보통 \`https://Mystia1234.github.io/-/\` 형태입니다.

## 2. OpenAI 연결용 Worker 배포
GitHub Pages는 서버 코드를 실행하지 않으므로 \`worker.js\`를 별도 Cloudflare Worker로 배포해야 합니다.

1. Cloudflare 대시보드에서 Workers & Pages → Create → Worker를 만듭니다.
2. Worker 편집기에 이 저장소의 \`worker.js\` 내용을 붙여넣고 Deploy 합니다.
3. Worker Settings → Variables and Secrets에서 Secret \`OPENAI_API_KEY\`를 만들고 OpenAI API 키를 입력합니다.
4. 선택 사항으로 Text 변수 \`OPENAI_MODEL\`에 모델명을 설정할 수 있습니다. 기본값은 \`gpt-4o-mini\`입니다.
5. (선택) Text 변수 \`ALLOWED_ORIGIN\`에 GitHub Pages 주소를 입력하면 해당 사이트에서만 요청을 허용합니다. 예: \`https://Mystia1234.github.io\`
6. Worker 주소에 \`/chat\`을 붙인 주소를 복사합니다.

## 3. 웹사이트에서 연결
웹사이트 우측 상단의 ⓘ 버튼 → AI 서버 주소에 Worker 주소 + \`/chat\`을 입력하고 저장합니다.
같은 설정창에서 캐릭터 이름, 소개, 성격/말투/설정을 입력하면 됩니다.

## 참고
- OpenAI API 키를 \`index.html\`, GitHub 저장소, 브라우저에 절대 입력하지 마세요.
- 대화 기록은 현재 브라우저 기기의 localStorage에 저장됩니다. 다른 기기와 자동 동기화되지는 않습니다.
- API 사용료는 OpenAI 계정의 API 과금 정책에 따라 별도로 발생할 수 있습니다.
