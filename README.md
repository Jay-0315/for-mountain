<details>
<summary><strong>Korean Version (Click to Expand)</strong></summary>

# For Mountain

  Spring Boot 기반의 RESTful API 서버 프로젝트입니다. 계산기 기능과 환율 조회 기능을 제공합니다.

  ## 기술 스택
- Java: 17
- Spring Boot: 3.4.0 
- Build Tool: Gradle
- Database: 
- MySQL 8.0 (개발 환경)
- H2 (운영 환경)
- ORM: Spring Data JPA
- API Documentation: SpringDoc OpenAPI (Swagger) 2.8.0
- Container: Docker, Docker Compose 
- Validation: Spring Boot Validation
- Lombok: 코드 간소화

  ## 도메인

  현재 스웨거로 API를 테스트 할 수 있습니다.

  https://for-mountain-service-505197475308.asia-northeast3.run.app/swagger-ui/index.html#/Exchange%20API/getExchangeRates

  ## 주요 기능

  ## 1. 계산기 API 
  기본 사칙연산 (덧셈, 뺄셈, 곱셈, 나눗셈) 지원
  계산 이력 자동 저장 (MySQL/H2 데이터베이스)
  0으로 나누기 예외 처리
  잘못된 연산자 예외 처리

  ### 2. 환율 조회 API
  실시간 환율 정보 조회
  Frankfurter API 연동 (https://api.frankfurter.app)
  기준 통화 설정 가능 (기본값: KRW)
  다양한 통화 환율 정보 제공

  ### 3. 공통 기능
  전역 예외 처리 (GlobalExceptionHandler)
  커스텀 예외 처리
  에러 코드 관리
  Swagger API 문서 자동 생성

  ### 배포 플랫폼

  이 프로젝트는 Google Cloud Run에 자동 배포됩니다.

  - 플랫폼: Google Cloud Platform (GCP)
  - 서비스: Cloud Run
  - 리전: asia-northeast3 (서울)
  - CI/CD: GitHub Actions
  - 컨테이너 레지스트리: Artifact Registry

  ### 자동 배포 프로세스

  GitHub Actions를 통해 main 브랜치에 푸시되면 자동으로 배포가 진행됩니다.

  ### 필요한 GitHub Secrets

  배포를 위해서는 다음 GitHub Secrets가 설정되어 있어야 합니다:

  - GCP_PROJECT_ID: GCP 프로젝트 ID
  - GCP_SA_KEY: GCP 서비스 계정 키 (JSON 형식)


  ### 배포 확인

  배포가 완료되면 Cloud Run 콘솔에서 서비스 URL을 확인할 수 있습니다:

  - Cloud Run 콘솔: https://console.cloud.google.com/run
  - 서비스 URL: 배포 완료 후 제공되는 HTTPS URL

  ### 환경 변수

  운영 환경에서는 다음 환경 변수가 설정됩니다:

  - SPRING_PROFILES_ACTIVE=prod: 운영 프로파일 활성화

  추가 환경 변수가 필요한 경우 deploy.yml의 env_vars 섹션에 추가할 수 있습니다.

### 시작하기

### 사전 요구사항

- Java 17 이상
- Gradle 7.x 이상 (또는 Gradle Wrapper 사용)
- MySQL 8.0 (개발 환경, 선택사항)
- Docker & Docker Compose (컨테이너 실행 시)

### 로컬 환경 실행

1. 저장소 클론

   git clone <repository-url>
   cd for-mountain

2. 데이터베이스 설정
   
   개발 환경에서는 MySQL을 사용합니다. 다음 중 하나를 선택하세요:
   
   - Docker Compose 사용:
     
     docker-compose up -d mysql-db
     
     MySQL이 `localhost:3308`에서 실행됩니다.
   
   - 로컬 MySQL 사용:
     MySQL 8.0 설치 및 실행
     mountain_db 데이터베이스 생성
     application-dev.yml의 데이터베이스 연결 정보 확인 및 수정

3. 애플리케이션 빌드

   ./gradlew build

   
   Windows의 경우:

   gradlew.bat build


4. 애플리케이션 실행

   ./gradlew bootRun

   
   또는 빌드된 JAR 파일 실행:
  
   java -jar build/libs/for-mountain-0.0.1-SNAPSHOT.jar
  

5. 애플리케이션 접속 확인
   - 서버가 `http://localhost:8080`에서 실행됩니다.
   - Swagger UI: http://localhost:8080/swagger-ui.html


### 주요 API 엔드포인트

#### 1. 계산기 API

/api/v1/calculator/calculate

계산을 수행하고 결과를 데이터베이스에 저장합니다.

## 지원 연산자: 
## + (덧셈)
## - (뺄셈)
## * (곱셈)
## / (나눗셈)


#### 2. 환율 조회 API

/api/v1/exchange?base=KRW

실시간 환율 정보를 조회합니다.

  - base: 기준 통화 (기본값: KRW)
    - 예: USD, EUR, JPY, KRW 등


## 환경 설정

## 프로파일 설정

애플리케이션은 다음 프로파일을 지원합니다:

- dev: 개발 환경 (기본값)
  - MySQL 데이터베이스 사용
  - SQL 로깅 활성화
  - Hibernate DDL 자동 업데이트

- prod: 운영 환경
  - H2 인메모리 데이터베이스 사용
  - H2 Console 활성화 (http://localhost:8080/h2-console)


### Docker Compose로 전체 스택 실행

- docker-compose up -d

#### MySQL만 실행

- docker-compose up -d mysql-db

#### 애플리케이션만 빌드 및 실행

- ./gradlew build
docker-compose up -d backend

### 컨테이너 상태 확인

- docker-compose ps

### 컨테이너 로그 확인

- docker-compose logs -f backend
- docker-compose logs -f mysql-db

### 컨테이너 중지 및 제거

- docker-compose down

### 완전히 제거

- docker-compose down -v

### 테스트 실행

./gradlew test

### 테스트 리포트 확인

- HTML 리포트: `build/reports/tests/test/index.html`

### 테스트 커버리지

- `CalculatorServiceTest`: 계산기 서비스 로직 테스트
- `ForMountainApplicationTests`: 애플리케이션 컨텍스트 로드 테스트

## 에러 코드

애플리케이션에서 사용하는 에러 코드:

- INVALID_OPERATOR  400  Unknown operator. 
- DIVISION_BY_ZERO  400  Cannot divide by zero. 

### JAR 파일 빌드

./gradlew clean build

JAR 파일 위치:
- `build/libs/for-mountain-0.0.1-SNAPSHOT.jar`

### Docker 이미지 빌드

docker build -t for-mountain:latest .

### Docker 이미지 실행

docker run -p 8080:8080 for-mountain:latest

## 작성자

Jaehoon Choi


---

NOTICE: 
- 개발 환경에서는 MySQL을 사용하며, 로컬 MySQL이 실행 중이어야 합니다.
- 운영 환경에서는 H2 인메모리 데이터베이스를 사용합니다.
- Docker Compose를 사용하면 MySQL 컨테이너가 자동으로 실행됩니다.

</details>

<br>

<details>
<summary><strong>English Version (Click to Expand)</strong></summary>

# For Mountain

A Spring Boot-based RESTful API server project. Provides calculator functions and exchange rate lookup functions.

## Tech Stack
- Java: 17
- Spring Boot: 3.4.0
- Build Tool: Gradle
- Database:
- MySQL 8.0 (Development Environment)
- H2 (Production Environment)
- ORM: Spring Data JPA
- API Documentation: SpringDoc OpenAPI (Swagger) 2.8.0
- Container: Docker, Docker Compose
- Validation: Spring Boot Validation
- Lombok: Code simplification

## Domain

Currently, you can test the API via Swagger.

https://for-mountain-service-505197475308.asia-northeast3.run.app/swagger-ui/index.html#/Exchange%20API/getExchangeRates

## Key Features

### 1. Calculator API
Supports basic arithmetic operations (Addition, Subtraction, Multiplication, Division)
Automatically saves calculation history (MySQL/H2 Database)
Exception handling for division by zero
Exception handling for invalid operators

### 2. Exchange Rate API
Real-time exchange rate lookup
Frankfurter API integration (https://api.frankfurter.app)
Base currency configuration available (Default: KRW)
Provides exchange rate information for various currencies

### 3. Common Features
Global Exception Handling (GlobalExceptionHandler)
Custom Exception Handling
Error Code Management
Automatic Swagger API documentation generation

### Deployment Platform

This project is automatically deployed to Google Cloud Run.

- Platform: Google Cloud Platform (GCP)
- Service: Cloud Run
- Region: asia-northeast3 (Seoul)
- CI/CD: GitHub Actions
- Container Registry: Artifact Registry

### Auto Deployment Process

Deployment proceeds automatically when pushed to the main branch via GitHub Actions.

### Required GitHub Secrets

The following GitHub Secrets must be set for deployment:

- GCP_PROJECT_ID: GCP Project ID
- GCP_SA_KEY: GCP Service Account Key (JSON format)

### Deployment Verification

Once deployment is complete, you can check the service URL in the Cloud Run Console:

- Cloud Run Console: https://console.cloud.google.com/run
- Service URL: HTTPS URL provided after deployment completion

### Environment Variables

The following environment variables are set in the production environment:

- SPRING_PROFILES_ACTIVE=prod: Activate production profile

If additional environment variables are required, they can be added to the env_vars section of deploy.yml.

### Getting Started

### Prerequisites

- Java 17 or higher
- Gradle 7.x or higher (or use Gradle Wrapper)
- MySQL 8.0 (Development environment, optional)
- Docker & Docker Compose (For container execution)

### Local Execution

1. Clone Repository

   git clone <repository-url>
   cd for-mountain

2. Database Setup

   MySQL is used in the development environment. Choose one of the following:

    - Using Docker Compose:

      docker-compose up -d mysql-db

      MySQL will run at `localhost:3308`.

    - Using Local MySQL:
      Install and run MySQL 8.0
      Create `mountain_db` database
      Check and modify database connection info in `application-dev.yml`

3. Build Application

   ./gradlew build


For Windows:

gradlew.bat build


4. Run Application

   ./gradlew bootRun


Or run the built JAR file:

java -jar build/libs/for-mountain-0.0.1-SNAPSHOT.jar


5. Verify Application Connection
    - Server runs at `http://localhost:8080`
    - Swagger UI: http://localhost:8080/swagger-ui.html

### Key API Endpoints

#### 1. Calculator API

/api/v1/calculator/calculate

Performs a calculation and saves the result to the database.

## Supported Operators:
## + (Addition)
## - (Subtraction)
## * (Multiplication)
## / (Division)


#### 2. Exchange Rate API

/api/v1/exchange?base=KRW

Retrieves real-time exchange rate information.

- base: Base currency (Default: KRW)
    - e.g.: USD, EUR, JPY, KRW, etc.


## Configuration

## Profile Configuration

The application supports the following profiles:

- dev: Development Environment (Default)
    - Uses MySQL Database
    - SQL Logging enabled
    - Hibernate DDL auto-update

- prod: Production Environment
    - Uses H2 In-memory Database
    - H2 Console enabled (http://localhost:8080/h2-console)


### Run Full Stack with Docker Compose

- docker-compose up -d

#### Run Only MySQL

- docker-compose up -d mysql-db

#### Build and Run Application Only

- ./gradlew build
  docker-compose up -d backend

### Check Container Status

- docker-compose ps

### Check Container Logs

- docker-compose logs -f backend
- docker-compose logs -f mysql-db

### Stop and Remove Containers

- docker-compose down

### Completely Remove

- docker-compose down -v

### Run Tests

./gradlew test

### Check Test Report

- HTML Report: `build/reports/tests/test/index.html`

### Test Coverage

- `CalculatorServiceTest`: Calculator service logic tests
- `ForMountainApplicationTests`: Application context load tests

## Error Codes

Error codes used in the application:

- INVALID_OPERATOR  400  Unknown operator.
- DIVISION_BY_ZERO  400  Cannot divide by zero.

### Build JAR File

./gradlew clean build

JAR File Location:
- `build/libs/for-mountain-0.0.1-SNAPSHOT.jar`

### Build Docker Image

docker build -t for-mountain:latest .

### Run Docker Image

docker run -p 8080:8080 for-mountain:latest

## Author

Jaehoon Choi


---

NOTICE:
- The Development environment uses MySQL, and a local MySQL instance must be running.
- The Production environment uses H2 in-memory database.
- Using Docker Compose will automatically start the MySQL container.

</details>


<br>

<details>
<summary><strong> Japanese Version (Click to Expand)</strong></summary>

# For Mountain

Spring BootベースのRESTful APIサーバープロジェクトです。計算機機能と為替レート照会機能を提供します。

## 技術スタック
- Java: 17
- Spring Boot: 3.4.0
- Build Tool: Gradle
- Database:
- MySQL 8.0 (開発環境)
- H2 (運営環境)
- ORM: Spring Data JPA
- API Documentation: SpringDoc OpenAPI (Swagger) 2.8.0
- Container: Docker, Docker Compose
- Validation: Spring Boot Validation
- Lombok: コード簡素化

## ドメイン

現在、SwaggerでAPIをテストすることができます。

https://for-mountain-service-505197475308.asia-northeast3.run.app/swagger-ui/index.html#/Exchange%20API/getExchangeRates

## 主な機能

### 1. 計算機 API
基本四則演算（加算、減算、乗算、除算）をサポート
計算履歴の自動保存（MySQL/H2 データベース）
0除算の例外処理
不正な演算子の例外処理

### 2. 為替レート照会 API
リアルタイム為替レート情報の照会
Frankfurter API連携 (https://api.frankfurter.app)
基準通貨の設定が可能（デフォルト：KRW）
多様な通貨の為替レート情報を提供

### 3. 共通機能
グローバル例外処理 (GlobalExceptionHandler)
カスタム例外処理
エラーコード管理
Swagger APIドキュメントの自動生成

### デプロイプラットフォーム

このプロジェクトはGoogle Cloud Runに自動デプロイされます。

- プラットフォーム: Google Cloud Platform (GCP)
- サービス: Cloud Run
- リージョン: asia-northeast3 (ソウル)
- CI/CD: GitHub Actions
- コンテナレジストリ: Artifact Registry

### 自動デプロイプロセス

GitHub Actionsを通じてmainブランチにプッシュされると、自動的にデプロイが行われます。

### 必要な GitHub Secrets

デプロイのためには、以下のGitHub Secretsが設定されている必要があります：

- GCP_PROJECT_ID: GCP プロジェクトID
- GCP_SA_KEY: GCP サービスアカウントキー (JSON形式)

### デプロイ確認

デプロイが完了すると、Cloud RunコンソールでサービスURLを確認できます：

- Cloud Run コンソール: https://console.cloud.google.com/run
- サービス URL: デプロイ完了後に提供されるHTTPS URL

### 環境変数

運営環境では以下の環境変数が設定されます：

- SPRING_PROFILES_ACTIVE=prod: 運営プロファイルを有効化

追加の環境変数が必要な場合は、deploy.ymlのenv_varsセクションに追加できます。


### 開始方法 (Getting Started)

### 前提条件

- Java 17 以上
- Gradle 7.x 以上 (または Gradle Wrapper 使用)
- MySQL 8.0 (開発環境、任意)
- Docker & Docker Compose (コンテナ実行時)

### ローカル環境での実行

1. リポジトリのクローン

   git clone <repository-url>
   cd for-mountain

2. データベース設定

   開発環境ではMySQLを使用します。以下のいずれかを選択してください：

    - Docker Compose 使用:

      docker-compose up -d mysql-db

      MySQLが `localhost:3308` で実行されます。

    - ローカル MySQL 使用:
      MySQL 8.0 インストールおよび実行
      `mountain_db` データベース作成
      `application-dev.yml` のデータベース接続情報を確認および修正

3. アプリケーションのビルド

   ./gradlew build


Windowsの場合:

gradlew.bat build


4. アプリケーションの実行

   ./gradlew bootRun


またはビルドされたJARファイルの実行:

java -jar build/libs/for-mountain-0.0.1-SNAPSHOT.jar


5. アプリケーション接続確認
    - サーバーは `http://localhost:8080` で実行されます。
    - Swagger UI: http://localhost:8080/swagger-ui.html

### 主な API エンドポイント

#### 1. 計算機 API

/api/v1/calculator/calculate

計算を実行し、結果をデータベースに保存します。

## サポートする演算子:
## + (加算)
## - (減算)
## * (乗算)
## / (除算)


#### 2. 為替レート照会 API

/api/v1/exchange?base=KRW

リアルタイムの為替レート情報を照会します。

- base: 基準通貨 (デフォルト: KRW)
    - 例: USD, EUR, JPY, KRW など


## 環境設定

## プロファイル設定

アプリケーションは以下のプロファイルをサポートします：

- dev: 開発環境 (デフォルト)
    - MySQL データベース使用
    - SQL ロギング有効化
    - Hibernate DDL 自動更新

- prod: 本番環境
    - H2 インメモリデータベース使用
    - H2 Console 有効化 (http://localhost:8080/h2-console)


### Docker Composeでフルスタック実行

- docker-compose up -d

#### MySQLのみ実行

- docker-compose up -d mysql-db

#### アプリケーションのみビルドして実行

- ./gradlew build
  docker-compose up -d backend

### コンテナ状態確認

- docker-compose ps

### コンテナログ確認

- docker-compose logs -f backend
- docker-compose logs -f mysql-db

### コンテナ停止および削除

- docker-compose down

### 完全削除

- docker-compose down -v

### テスト実行

./gradlew test

### テストリポート確認

- HTML リポート: `build/reports/tests/test/index.html`

### テストカバレッジ

- `CalculatorServiceTest`: 計算機サービスロジックのテスト
- `ForMountainApplicationTests`: アプリケーションコンテキストロードのテスト

## エラーコード

アプリケーションで使用されるエラーコード：

- INVALID_OPERATOR  400  Unknown operator.
- DIVISION_BY_ZERO  400  Cannot divide by zero.

### JAR ファイルビルド

./gradlew clean build

JAR ファイルの場所:
- `build/libs/for-mountain-0.0.1-SNAPSHOT.jar`

### Docker イメージビルド

docker build -t for-mountain:latest .

### Docker イメージ実行

docker run -p 8080:8080 for-mountain:latest

## 作成者

Jaehoon Choi


---

NOTICE:
- 開発環境ではMySQLを使用するため、ローカルでMySQLが実行されている必要があります。
- 本番環境ではH2インメモリデータベースを使用します。
- Docker Composeを使用すると、MySQLコンテナが自動的に実行されます。

</details>