.PHONY: dev setup lint format format-check test test-e2e test-all build check help

# 기본 타겟
.DEFAULT_GOAL := help

# 개발 환경
dev: ## 개발 서버 실행
	npm run dev

setup: ## 초기 설정 (의존성 설치 + Playwright 브라우저)
	npm install
	npx playwright install

# 코드 품질
lint: ## ESLint 검사
	npm run lint

format: ## Prettier 포맷팅 적용
	npx prettier --write .

format-check: ## Prettier 포맷팅 확인
	npx prettier --check .

# 테스트
test: ## 단위 테스트 (Vitest)
	npm run test

test-e2e: ## E2E 테스트 (Playwright)
	npm run test:e2e

test-all: test test-e2e ## 전체 테스트 (단위 + E2E)

# 빌드
build: ## 프로덕션 빌드
	npm run build

# 통합 검증
check: lint format-check test build ## 전체 품질 게이트 (린트 + 포맷 + 테스트 + 빌드)

# 도움말
help: ## 사용 가능한 명령어 목록
	@echo "사용 가능한 명령어:"
	@echo ""
	@awk '/^[a-zA-Z0-9_-]+:.*## / {split($$0, a, "## "); split(a[1], b, ":"); printf "  \033[36m%-15s\033[0m %s\n", b[1], a[2]}' $(MAKEFILE_LIST)
