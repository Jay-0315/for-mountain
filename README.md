# For Mountain

한국어와 일본어 설명을 함께 포함한 프로젝트 안내 문서입니다.

This repository contains a public company website and an internal admin system built around a Spring Boot API and a Next.js frontend.

## Korean

### 프로젝트 개요

For Mountain은 회사 소개용 웹사이트와 사내 운영 기능을 함께 제공하는 웹 서비스입니다.

- 백엔드: Spring Boot REST API
- 프론트엔드: Next.js 기반 웹 애플리케이션
- 주요 영역: 회사 소개, 뉴스, 서비스 소개, 문의 접수, 관리자 로그인, 직원 관리, 그룹 관리, 휴가 관리, 공지 관리, 웹사이트 콘텐츠 관리

현재 저장소는 루트의 백엔드와 `frontend/` 프론트엔드로 나뉘어 있습니다.

### 기술 스택

- Java 17
- Spring Boot 3.4
- Spring Data JPA
- Spring Security
- JWT
- Redis
- MySQL
- AWS S3 Presigned Upload
- Spring Mail
- Swagger / SpringDoc OpenAPI
- Gradle
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- GSAP
- Docker / Docker Compose
- Caddy

### 주요 기능

#### 대외 웹사이트

- 메인 랜딩 페이지
- 회사 소개
- 서비스 소개
- 뉴스 목록 및 상세 조회
- 채용 정보 섹션
- 문의 폼 제출
- 파트너 소개

#### 관리자 기능

- 관리자 로그인
- 직원 관리
- 그룹 관리
- 휴가 신청 및 승인 관리
- 사내 공지 관리
- 부서 공지 관리
- 웹사이트 게시글 관리
- 서비스 카테고리 및 서비스 항목 관리
- 파트너 카드 관리
- 파일 업로드용 Presigned URL 발급

#### 공통 기능

- JWT 기반 인증/인가
- 역할 기반 접근 제어
- 전역 예외 처리
- Swagger API 문서 제공

### 디렉터리 구조

```text
.
├── src/                # Spring Boot 백엔드
├── frontend/           # Next.js 프론트엔드
├── docker/             # Caddy 등 배포 관련 파일
├── build.gradle        # 백엔드 빌드 설정
├── docker-compose.yml  # 통합 실행용 Compose
└── README.md
```

### 실행 환경

#### 백엔드 로컬 실행

사전 요구사항

- Java 17
- MySQL
- Redis

실행 순서

```bash
./gradlew bootRun
```

기본 프로파일은 `dev`이며, 로컬 개발에서는 MySQL과 Redis가 준비되어 있어야 합니다.

백엔드 기본 주소

- `http://localhost:8080`

Swagger UI

- `http://localhost:8080/swagger-ui/index.html`

#### 프론트엔드 로컬 실행

```bash
cd frontend
npm install
npm run dev
```

프론트엔드 기본 주소

- `http://localhost:3000`

개발 모드에서는 프론트가 로컬 백엔드 `http://localhost:8080`을 대상으로 프록시 요청을 보냅니다.

### Docker Compose 실행

프로덕션에 가까운 형태로 실행하려면 다음 명령을 사용합니다.

```bash
docker-compose up -d --build
```

구성 서비스

- `backend`
- `frontend`
- `mountain-redis`
- `caddy`

주의사항

- `backend`는 `prod` 프로파일로 실행됩니다.
- 운영용 데이터베이스는 외부 MySQL 접속 정보를 환경 변수로 받아 사용합니다.
- 실행 전에 `.env` 또는 셸 환경 변수로 필요한 값을 준비해야 합니다.

### 주요 환경 변수

백엔드

- `SPRING_PROFILES_ACTIVE`
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `SPRING_DATA_REDIS_HOST`
- `SPRING_DATA_REDIS_PORT`
- `JWT_SECRET`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_TO`
- `ADMIN_INIT_USERNAME`
- `ADMIN_INIT_PASSWORD`

프론트엔드

- `BACKEND_URL`
- `NODE_ENV`

배포

- `SITE_DOMAIN`
- `ACME_EMAIL`

### API 개요

대표 엔드포인트 예시

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/password/setup`
- `GET /api/v1/board`
- `GET /api/v1/board/{id}`
- `POST /api/v1/contact`
- `GET /api/v1/employees`
- `GET /api/v1/groups`
- `GET /api/v1/leaves`
- `GET /api/v1/announcements`
- `GET /api/v1/dept-notices`
- `GET /api/v1/service-categories`
- `GET /api/v1/service-items`
- `POST /api/v1/uploads/presign`

정확한 요청/응답 구조는 Swagger 문서를 기준으로 확인하는 것을 권장합니다.

### 권한 정책

- 대부분의 `GET /api/v1/**` 조회 API는 공개 접근 가능
- 로그인/비밀번호 설정은 공개 접근 가능
- 문의 접수는 공개 접근 가능
- 관리자 생성, 게시글 작성/수정/삭제, 업로드 URL 발급 등은 관리자 권한 필요
- 휴가 관련 일부 기능은 일반 사용자 권한으로도 사용 가능

### 테스트

```bash
./gradlew test
```

### 참고 사항

- 현재 프로젝트는 초기 계산기/환율 예제 수준을 넘어, 회사 사이트와 관리자 시스템까지 포함하도록 확장되어 있습니다.
- README는 현재 코드 구조를 기준으로 다시 정리했습니다.
- 민감한 정보는 설정 파일에 직접 두기보다 환경 변수로 관리하는 것을 권장합니다.

---

## Japanese

### プロジェクト概要

For Mountain は、会社紹介用の公開サイトと社内運用向けの管理システムをあわせて提供する Web サービスです。

- バックエンド: Spring Boot REST API
- フロントエンド: Next.js ベースの Web アプリケーション
- 主な対象機能: 会社紹介、ニュース、サービス紹介、お問い合わせ、管理者ログイン、社員管理、グループ管理、休暇管理、各種お知らせ管理、Web サイトコンテンツ管理

リポジトリは、ルート配下のバックエンドと `frontend/` 配下のフロントエンドに分かれています。

### 技術スタック

- Java 17
- Spring Boot 3.4
- Spring Data JPA
- Spring Security
- JWT
- Redis
- MySQL
- AWS S3 Presigned Upload
- Spring Mail
- Swagger / SpringDoc OpenAPI
- Gradle
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- GSAP
- Docker / Docker Compose
- Caddy

### 主な機能

#### 公開サイト

- トップページ
- 会社紹介
- サービス紹介
- ニュース一覧・詳細表示
- 採用情報セクション
- お問い合わせフォーム
- パートナー紹介

#### 管理機能

- 管理者ログイン
- 社員管理
- グループ管理
- 休暇申請・承認管理
- 社内お知らせ管理
- 部署別お知らせ管理
- Web サイト記事管理
- サービスカテゴリ・サービス項目管理
- パートナーカード管理
- Presigned URL の発行によるファイルアップロード

#### 共通機能

- JWT ベースの認証・認可
- ロールベースのアクセス制御
- グローバル例外処理
- Swagger API ドキュメント

### ディレクトリ構成

```text
.
├── src/                # Spring Boot バックエンド
├── frontend/           # Next.js フロントエンド
├── docker/             # Caddy などのデプロイ関連ファイル
├── build.gradle        # バックエンドのビルド設定
├── docker-compose.yml  # 全体起動用 Compose
└── README.md
```

### ローカル実行

#### バックエンド

前提条件

- Java 17
- MySQL
- Redis

起動コマンド

```bash
./gradlew bootRun
```

デフォルトプロファイルは `dev` です。ローカル開発時は MySQL と Redis が必要です。

バックエンド URL

- `http://localhost:8080`

Swagger UI

- `http://localhost:8080/swagger-ui/index.html`

#### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

フロントエンド URL

- `http://localhost:3000`

開発モードでは、フロントエンドはローカルのバックエンド `http://localhost:8080` にプロキシします。

### Docker Compose での起動

本番に近い構成で起動する場合は、次のコマンドを使用します。

```bash
docker-compose up -d --build
```

構成サービス

- `backend`
- `frontend`
- `mountain-redis`
- `caddy`

注意事項

- `backend` は `prod` プロファイルで起動します。
- 本番用データベースは外部 MySQL 接続を前提としています。
- 起動前に `.env` または環境変数で必要な値を設定してください。

### 主な環境変数

バックエンド

- `SPRING_PROFILES_ACTIVE`
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `SPRING_DATA_REDIS_HOST`
- `SPRING_DATA_REDIS_PORT`
- `JWT_SECRET`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_TO`
- `ADMIN_INIT_USERNAME`
- `ADMIN_INIT_PASSWORD`

フロントエンド

- `BACKEND_URL`
- `NODE_ENV`

デプロイ

- `SITE_DOMAIN`
- `ACME_EMAIL`

### API 概要

代表的なエンドポイント

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/password/setup`
- `GET /api/v1/board`
- `GET /api/v1/board/{id}`
- `POST /api/v1/contact`
- `GET /api/v1/employees`
- `GET /api/v1/groups`
- `GET /api/v1/leaves`
- `GET /api/v1/announcements`
- `GET /api/v1/dept-notices`
- `GET /api/v1/service-categories`
- `GET /api/v1/service-items`
- `POST /api/v1/uploads/presign`

詳細なリクエストおよびレスポンス仕様は Swagger を参照してください。

### 権限方針

- 多くの `GET /api/v1/**` 読み取り API は公開
- ログインと初期パスワード設定は公開
- お問い合わせ送信は公開
- 管理者アカウント作成、記事作成・更新・削除、アップロード URL 発行などは管理者権限が必要
- 休暇関連の一部機能は一般ユーザーでも利用可能

### テスト

```bash
./gradlew test
```

### 補足

- このプロジェクトは、初期のサンプル API 構成から拡張され、会社サイトと管理システムを含む形になっています。
- README は現在のコードベースに合わせて整理し直しています。
- 機密情報は設定ファイルに直接書かず、環境変数で管理する運用を推奨します。
