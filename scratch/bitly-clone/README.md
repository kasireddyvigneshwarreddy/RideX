# Premium Bitly Clone (Shorty)

A production-ready URL Shortener and click analytics engine built with a Spring Boot 3 Java backend and a React 19 Vite frontend.

---

## 🚀 Features
* **User Management**: Authentication & Registration using Spring Security, BCrypt password hashing, and stateless JWT tokens.
* **Forgot Password Flow**: Verification code generation printed directly to backend logs for easy retrieval.
* **Bijective Base62 Shortening**: Encodes auto-incremented database IDs to create short codes (e.g., `1000` -> `"g8"`).
* **Custom Aliases**: Users can supply a unique custom path for their shortened links.
* **Link Expiration**: Support for an optional expiration date to automatically deactivate links.
* **Visitor Analytics**: Live parsing of User-Agent strings (Browser, OS, Device) and IP addresses to generate graphs and tables.
* **Aesthetic Dashboard**: Custom styled UI with dark/light themes, inline expandable analytics, copy success tooltips, and dynamic QR Code generation with downloads.

---

## 🛠️ Tech Stack

### Backend
* **Language**: Java 21
* **Framework**: Spring Boot 3.3.1 (Spring Security, Spring Data JPA)
* **Database**: MySQL 8.0
* **Dependencies**: Lombok, JJWT (JWT), Jakarta Validation, Hibernate

### Frontend
* **Framework**: React 19, TypeScript, Vite
* **Routing**: React Router DOM 6
* **Client**: Axios (with authorization interceptors)
* **Icons**: Lucide React
* **Styling**: Premium responsive Vanilla CSS (support for Dark/Light mode theme contexts)

---

## 📂 Project Directory Structure
```text
bitly-clone
├── pom.xml
├── backend.Dockerfile
├── frontend.Dockerfile
├── docker-compose.yml
├── README.md
├── src
│   └── main
│       ├── java/com/bitlyclone
│       │   ├── BitlyCloneApplication.java
│       │   ├── config/SecurityConfig.java
│       │   ├── controller/
│       │   │   ├── AuthenticationController.java
│       │   │   ├── UserController.java
│       │   │   ├── UrlController.java
│       │   │   ├── RedirectController.java
│       │   │   └── AnalyticsController.java
│       │   ├── dto/
│       │   │   ├── AuthResponse.java
│       │   │   ├── LoginRequest.java
│       │   │   ├── RegisterRequest.java
│       │   │   ├── ForgotPasswordRequest.java
│       │   │   ├── ResetPasswordRequest.java
│       │   │   ├── ChangePasswordRequest.java
│       │   │   ├── UrlRequest.java
│       │   │   ├── UrlResponse.java
│       │   │   ├── UrlDetails.java
│       │   │   └── AnalyticsResponse.java
│       │   ├── entity/
│       │   │   ├── Role.java
│       │   │   ├── User.java
│       │   │   ├── Url.java
│       │   │   └── Click.java
│       │   ├── repository/
│       │   │   ├── UserRepository.java
│       │   │   ├── UrlRepository.java
│       │   │   └── ClickRepository.java
│       │   └── service/
│       │       ├── AuthenticationService.java
│       │       ├── UserService.java
│       │       ├── UrlService.java
│       │       └── AnalyticsService.java
│       └── resources/
│           ├── application.properties
│           ├── schema.sql
│           └── data.sql
└── frontend
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── api/axios.ts
        ├── components/
        │   ├── Navbar.tsx
        │   ├── ProtectedRoute.tsx
        │   ├── UrlShortenerForm.tsx
        │   ├── AnalyticsCards.tsx
        │   └── QrCodeModal.tsx
        ├── context/
        │   ├── AuthContext.tsx
        │   ├── ThemeContext.tsx
        │   └── ToastContext.tsx
        └── pages/
            ├── Login.tsx
            ├── Register.tsx
            ├── ForgotPassword.tsx
            ├── ResetPassword.tsx
            ├── Dashboard.tsx
            └── Profile.tsx
```

---

## ⚙️ Running Locally (Without Docker)

### 1. Database Setup
* No separate database is required for local development. The backend uses a persistent H2 database by default.
* To use MySQL instead, set `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD` before starting the backend.

### 2. Launch the Backend
```bash
# Clean and run the Maven project
mvn spring-boot:run
```
* The backend will run on `http://localhost:8080` and seed initial database tables.

### 3. Launch the Frontend
```bash
# Navigate to the frontend directory
cd frontend

# Install package dependencies
npm install

# Start the Vite development server
npm run dev
```
* The application will open on `http://localhost:3000`. All api requests are automatically proxied to the backend at port `8080`.

---

## 🐳 Running with Docker (MySQL)

To spin up all services (MySQL, Backend, Frontend) with a single command:
```bash
docker-compose up --build
```
* **Frontend Access**: `http://localhost:3000`
* **Backend API Access**: `http://localhost:8080`
* **Database Connection**: `localhost:3306` (`bitly_db` / `root` / `root`)

---

## 📖 REST API Documentation

### 1. Authentication Endpoints

#### Register User
* **Endpoint**: `POST /api/auth/register`
* **Body**:
  ```json
  {
    "name": "Jane",
    "email": "jane@gmail.com",
    "password": "Password@123"
  }
  ```
* **Response (201 Created)**:
  ```json
  { "message": "Registration Successful" }
  ```

#### Login User
* **Endpoint**: `POST /api/auth/login`
* **Body**:
  ```json
  {
    "email": "jane@gmail.com",
    "password": "Password@123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "token": "JWT_TOKEN",
    "name": "Jane",
    "email": "jane@gmail.com"
  }
  ```

#### Forgot Password (Code Generation)
* **Endpoint**: `POST /api/auth/forgot-password`
* **Body**: `{ "email": "jane@gmail.com" }`
* **Note**: The code is generated and printed directly to the backend terminal logs.

#### Reset Password
* **Endpoint**: `POST /api/auth/reset-password`
* **Body**:
  ```json
  {
    "token": "6_DIGIT_CODE_FROM_LOGS",
    "password": "NewPassword@123"
  }
  ```

---

### 2. URL Management (Requires Authorization Header: `Bearer <JWT_TOKEN>`)

#### Shorten URL
* **Endpoint**: `POST /api/url/shorten`
* **Body**:
  ```json
  {
    "longUrl": "https://www.google.com",
    "title": "Google Link"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "id": 1,
    "shortCode": "1",
    "shortUrl": "http://localhost:8080/1",
    "clickCount": 0
  }
  ```

#### Custom Alias Shortening
* **Endpoint**: `POST /api/url/custom`
* **Body**:
  ```json
  {
    "longUrl": "https://github.com",
    "customAlias": "my-github",
    "title": "GitHub Profile"
  }
  ```

#### Fetch Logged-in User Links
* **Endpoint**: `GET /api/url/my-links`

#### Update Destination Link
* **Endpoint**: `PUT /api/url/{id}`
* **Body**: `{ "longUrl": "https://newdestination.com" }`

#### Delete Link
* **Endpoint**: `DELETE /api/url/{id}`

---

### 3. Analytics & Redirection

#### Redirect Path (Public)
* **Endpoint**: `GET /{shortCode}`
* *Resolves short code, logs visitor browser, operating system, device, IP address, and redirects user to target destination.*

#### Fetch Link Analytics (Requires Authorization Header)
* **Endpoint**: `GET /api/analytics/{shortCode}`
* **Response (200 OK)**:
  ```json
  {
    "clickCount": 24,
    "browserStats": { "Chrome": 15, "Firefox": 9 },
    "deviceStats": { "Desktop": 20, "Mobile": 4 },
    "countryStats": { "Local Loopback": 24 },
    "creationDate": "2026-07-22T10:00:00",
    "expiryDate": null,
    "lastClicked": "2026-07-22T10:30:00"
  }
  ```
