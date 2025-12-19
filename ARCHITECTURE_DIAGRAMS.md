# 🏗️ BAYMAK SERVICE MANAGEMENT SYSTEM - MİMARİ DİYAGRAMLARI

## 📊 BACKEND MİMARİSİ

### 1. Genel Mimari Akış (Request Flow)

```mermaid
graph TB
    A[Client Request] --> B[Nginx Reverse Proxy]
    B --> C{Path?}
    C -->|/api/*| D[Spring Boot Backend :8080]
    C -->|/| E[Thymeleaf Landing Page]
    C -->|/dashboard/*| F[React Frontend Static Files]
    
    D --> G[Security Filter Chain]
    G --> H{JWT Token Valid?}
    H -->|No| I[401 Unauthorized]
    H -->|Yes| J[Controller Layer]
    
    J --> K[Service Layer]
    K --> L[Repository Layer]
    L --> M[(MySQL Database)]
    
    M --> L
    L --> K
    K --> N[DTO Mapping]
    N --> J
    J --> O[JSON Response]
    O --> B
    B --> A
```

### 2. Backend Layer Mimarisi

```mermaid
graph TD
    A[HTTP Request] --> B[Controller Layer]
    B --> C[Service Interface]
    C --> D[Service Implementation]
    D --> E[Repository Interface]
    E --> F[JPA/Hibernate]
    F --> G[(MySQL Database)]
    
    D --> H[DTO Layer]
    H --> I[Response DTO]
    I --> B
    
    B --> J[Exception Handler]
    J --> K[Error Response]
    
    L[Security Filter] --> B
    M[JWT Token] --> L
    
    style B fill:#e1f5ff
    style D fill:#fff4e1
    style E fill:#e8f5e9
    style G fill:#fce4ec
```

### 3. Backend Package Yapısı

```
com.baymak.backend
│
├── config/
│   ├── SecurityConfig.java          # Spring Security, CORS, PasswordEncoder
│   └── OpenApiConfig.java           # Swagger/OpenAPI configuration
│
├── controller/                      # REST API Endpoints
│   ├── AuthController.java          # /api/auth/**
│   ├── AppointmentController.java  # /api/appointments/**
│   ├── UserController.java         # /api/users/**
│   ├── TechnicianController.java   # /api/technicians/**
│   ├── DeviceController.java       # /api/devices/**
│   ├── ServiceReportController.java # /api/service-reports/**
│   ├── ServiceRequestController.java # /api/requests/**
│   └── PageController.java         # / (Thymeleaf)
│
├── service/                         # Business Logic Interface
│   ├── AuthService.java
│   ├── AppointmentService.java
│   ├── UserService.java
│   └── ...
│
├── service/impl/                    # Business Logic Implementation
│   ├── AuthServiceImpl.java
│   ├── AppointmentServiceImpl.java
│   ├── UserServiceImpl.java
│   └── ...
│
├── repository/                      # Data Access Layer
│   ├── UserRepository.java          # extends JpaRepository<User, Long>
│   ├── AppointmentRepository.java
│   ├── DeviceRepository.java
│   └── ...
│
├── model/                           # JPA Entities
│   ├── User.java
│   ├── Technician.java
│   ├── Device.java
│   ├── Appointment.java
│   ├── ServiceReport.java
│   └── ServiceRequest.java
│
├── dto/                             # Data Transfer Objects
│   ├── Request DTOs:
│   │   ├── AppointmentRequestDto.java
│   │   ├── UserRequestDto.java
│   │   └── ...
│   └── Response DTOs:
│       ├── AppointmentResponseDto.java
│       ├── UserResponseDto.java
│       └── ...
│
├── security/                        # Security Components
│   ├── JwtTokenProvider.java        # Token generation & validation
│   ├── JwtAuthenticationFilter.java # JWT filter
│   └── CustomUserDetailsService.java # UserDetailsService
│
└── exception/                       # Exception Handling
    ├── GlobalExceptionHandler.java
    ├── NotFoundException.java
    ├── BadRequestException.java
    └── ...
```

### 4. Security Flow (Authentication & Authorization)

```mermaid
sequenceDiagram
    participant C as Client
    participant N as Nginx
    participant F as JWT Filter
    participant S as SecurityConfig
    participant A as AuthController
    participant J as JwtTokenProvider
    participant U as UserService
    
    C->>N: POST /api/auth/login
    N->>F: Forward to Backend
    F->>S: Check if public endpoint
    S->>A: Allow (public endpoint)
    A->>U: authenticate(email, password)
    U->>J: generateToken(user)
    J->>J: Create JWT (HMAC-SHA256)
    J->>A: Return token
    A->>C: 200 OK + {token, role, email}
    
    Note over C: Store token in localStorage
    
    C->>N: GET /api/appointments/my (with Bearer token)
    N->>F: Forward with Authorization header
    F->>J: validateToken(token)
    J->>J: Extract email & role
    J->>F: Token valid
    F->>S: Set Authentication in SecurityContext
    S->>A: Check role (hasRole("CUSTOMER"))
    A->>C: 200 OK + appointments
```

### 5. Database Entity Relationships

```mermaid
erDiagram
    USER ||--o{ DEVICE : "has"
    USER ||--o{ APPOINTMENT : "creates"
    USER ||--o{ SERVICE_REQUEST : "creates"
    
    DEVICE ||--o{ APPOINTMENT : "has"
    
    TECHNICIAN ||--o{ APPOINTMENT : "assigned_to"
    TECHNICIAN ||--o{ SERVICE_REPORT : "creates"
    
    APPOINTMENT ||--|| SERVICE_REPORT : "has"
    
    USER {
        bigint id PK
        string name
        string email UK
        string phone
        string address
        string password
        enum role
        datetime createdAt
    }
    
    TECHNICIAN {
        bigint id PK
        string name
        string email UK
        string phone
        string specialization
        string password
        enum role
        datetime createdAt
    }
    
    DEVICE {
        bigint id PK
        bigint user_id FK
        string deviceType
        string model
        string serialNumber
        datetime createdAt
    }
    
    APPOINTMENT {
        bigint id PK
        bigint user_id FK
        bigint device_id FK
        bigint technician_id FK
        date date
        time time
        enum status
        text problemDescription
        datetime createdAt
    }
    
    SERVICE_REPORT {
        bigint id PK
        bigint appointment_id FK
        bigint technician_id FK
        text description
        text partsUsed
        double price
        datetime createdAt
    }
    
    SERVICE_REQUEST {
        bigint id PK
        bigint user_id FK
        string title
        text description
        string deviceType
        enum status
        datetime createdAt
    }
```

---

## 🎨 FRONTEND MİMARİSİ

### 1. Frontend Genel Mimari

```mermaid
graph TB
    A[Browser] --> B[React App]
    B --> C[React Router]
    C --> D{Route Type?}
    
    D -->|Public| E[Login/Register Pages]
    D -->|Protected| F[ProtectedRoute Component]
    
    F --> G{Token Valid?}
    G -->|No| H[Redirect to /login]
    G -->|Yes| I[Layout Component]
    
    I --> J[Sidebar Navigation]
    I --> K[Page Components]
    
    K --> L[API Client axiosClient]
    L --> M[Request Interceptor]
    M --> N[Add JWT Token]
    N --> O[Backend API]
    
    O --> P[Response Interceptor]
    P --> Q{Status?}
    Q -->|401| R[Clear Token, Redirect Login]
    Q -->|200| S[Update State]
    S --> K
    
    style B fill:#e1f5ff
    style F fill:#fff4e1
    style L fill:#e8f5e9
    style O fill:#fce4ec
```

### 2. Frontend Component Hierarchy

```mermaid
graph TD
    A[App.jsx] --> B[Routes]
    B --> C[Public Routes]
    B --> D[Protected Routes]
    
    C --> E[LoginPage]
    C --> F[RegisterPage]
    C --> G[ForgotPasswordPage]
    
    D --> H[ProtectedRoute]
    H --> I[Layout]
    
    I --> J[Sidebar]
    I --> K[Outlet - Child Routes]
    
    K --> L[DashboardPage]
    K --> M[AppointmentsPage]
    K --> N[DevicesPage]
    K --> O[UsersPage]
    K --> P[TechniciansPage]
    K --> Q[ServiceReportsPage]
    K --> R[ProfilePage]
    
    M --> S[axiosClient]
    N --> S
    O --> S
    P --> S
    Q --> S
    R --> S
    
    S --> T[Backend API]
    
    style A fill:#e1f5ff
    style H fill:#fff4e1
    style I fill:#e8f5e9
    style S fill:#fce4ec
```

### 3. Frontend Folder Structure

```
src/
│
├── main.jsx                        # React entry point
├── App.jsx                         # Main routing component
├── App.css
│
├── api/
│   └── axiosClient.js             # Axios configuration, interceptors
│
├── components/
│   ├── Layout.jsx                  # Main layout with sidebar
│   └── ProtectedRoute.jsx         # Route protection component
│
├── pages/
│   ├── LoginPage.jsx               # Authentication
│   ├── RegisterPage.jsx           # User registration
│   ├── ForgotPasswordPage.jsx      # Password reset
│   ├── DashboardPage.jsx           # Role-based dashboard
│   ├── AppointmentsPage.jsx        # Appointment management
│   ├── DevicesPage.jsx            # Device CRUD (Customer)
│   ├── UsersPage.jsx              # User management (Admin)
│   ├── TechniciansPage.jsx        # Technician management (Admin)
│   ├── ServiceReportsPage.jsx     # Service reports (Tech/Admin)
│   └── ProfilePage.jsx            # User profile
│
└── assets/
    └── react.svg
```

### 4. React Router Yapısı

```mermaid
graph LR
    A[/] --> B[Thymeleaf Landing Page<br/>Backend'den serve]
    
    C[/login] --> D[LoginPage]
    E[/register] --> F[RegisterPage]
    G[/forgot-password] --> H[ForgotPasswordPage]
    
    I[/dashboard] --> J[ProtectedRoute]
    J --> K[Layout]
    
    K --> L[/dashboard<br/>DashboardPage]
    K --> M[/dashboard/appointments<br/>AppointmentsPage]
    K --> N[/dashboard/devices<br/>DevicesPage]
    K --> O[/dashboard/users<br/>UsersPage]
    K --> P[/dashboard/technicians<br/>TechniciansPage]
    K --> Q[/dashboard/reports<br/>ServiceReportsPage]
    K --> R[/dashboard/profile<br/>ProfilePage]
    
    style B fill:#e1f5ff
    style J fill:#fff4e1
    style K fill:#e8f5e9
```

### 5. API Client Flow (Request/Response)

```mermaid
sequenceDiagram
    participant U as User Action
    participant P as Page Component
    participant A as axiosClient
    participant RI as Request Interceptor
    participant B as Backend API
    participant RI2 as Response Interceptor
    participant S as State Update
    
    U->>P: Click button (e.g., Create Appointment)
    P->>A: axiosClient.post("/api/appointments", data)
    A->>RI: Intercept request
    RI->>RI: Get token from localStorage
    RI->>RI: Add Authorization: Bearer {token}
    RI->>B: Send request with token
    B->>B: Validate token, process request
    B->>RI2: Return response
    RI2->>RI2: Check status code
    alt Status 401
        RI2->>P: Clear localStorage
        RI2->>P: Redirect to /login
    else Status 200
        RI2->>S: Update component state
        S->>P: Re-render UI
    end
```

### 6. State Management Flow

```mermaid
graph TD
    A[User Action] --> B[Event Handler]
    B --> C[API Call via axiosClient]
    C --> D[Backend Response]
    D --> E{Success?}
    
    E -->|Yes| F[Update useState]
    E -->|No| G[Show Error Message]
    
    F --> H[Component Re-render]
    H --> I[Updated UI]
    
    J[localStorage] --> K[Token Storage]
    J --> L[User Info Storage]
    J --> M[Role Storage]
    
    K --> C
    L --> N[Profile Display]
    M --> O[Role-based UI]
    
    style F fill:#e8f5e9
    style H fill:#e1f5ff
    style J fill:#fff4e1
```

---

## 🔄 FULL STACK FLOW (End-to-End)

### Complete Request Flow

```mermaid
sequenceDiagram
    participant U as User Browser
    participant N as Nginx :80
    participant R as React Frontend
    participant B as Spring Boot :8080
    participant S as Security Filter
    participant C as Controller
    participant SV as Service
    participant REPO as Repository
    participant DB as MySQL
    
    U->>N: GET http://3.238.235.255/dashboard/appointments
    N->>R: Serve React static files
    R->>U: Render AppointmentsPage
    
    U->>R: Click "View Details"
    R->>R: Check localStorage for token
    R->>N: GET /api/appointments/my<br/>Authorization: Bearer {token}
    N->>B: Proxy to :8080/api/appointments/my
    B->>S: JWT Authentication Filter
    S->>S: Validate token
    S->>C: AppointmentController
    C->>SV: AppointmentService.getMyAppointments()
    SV->>REPO: AppointmentRepository.findByUser()
    REPO->>DB: SELECT * FROM appointments WHERE user_id = ?
    DB->>REPO: Return appointments
    REPO->>SV: List<Appointment>
    SV->>SV: mapToDto() - Convert to DTO
    SV->>C: List<AppointmentResponseDto>
    C->>B: ResponseEntity.ok(appointments)
    B->>N: JSON response
    N->>R: JSON response
    R->>R: Update state with appointments
    R->>U: Display appointments in UI
```

---

## 📋 MİMARİ ÖZET TABLOSU

### Backend Layers

| Layer | Responsibility | Example Files |
|-------|---------------|---------------|
| **Controller** | HTTP request handling, routing | `AppointmentController.java` |
| **Service** | Business logic, validation | `AppointmentServiceImpl.java` |
| **Repository** | Data access, database queries | `AppointmentRepository.java` |
| **Model** | Entity classes, database schema | `Appointment.java` |
| **DTO** | Data transfer, API contracts | `AppointmentResponseDto.java` |
| **Security** | Authentication, authorization | `SecurityConfig.java`, `JwtTokenProvider.java` |
| **Exception** | Error handling | `GlobalExceptionHandler.java` |

### Frontend Layers

| Layer | Responsibility | Example Files |
|-------|---------------|---------------|
| **Pages** | Page components, UI | `AppointmentsPage.jsx` |
| **Components** | Reusable UI components | `Layout.jsx`, `ProtectedRoute.jsx` |
| **API Client** | HTTP requests, interceptors | `axiosClient.js` |
| **Router** | Client-side routing | `App.jsx` |
| **State** | Component state, localStorage | `useState`, `localStorage` |

### Deployment Architecture

```
Internet
    ↓
AWS EC2 Instance (3.238.235.255)
    ↓
Nginx (Port 80)
    ├── / → Spring Boot :8080 (Thymeleaf)
    ├── /api/* → Spring Boot :8080 (REST API)
    └── /dashboard/* → React Static Files (/var/www/html)
    ↓
Spring Boot Application (:8080)
    ├── Controllers
    ├── Services
    ├── Repositories
    └── Security
    ↓
MySQL Database (:3306)
    └── baymak database
```

---

## 🎯 ÖNEMLİ NOTLAR

### Backend:
- **Layered Architecture**: Controller → Service → Repository → Database
- **Separation of Concerns**: Her layer kendi sorumluluğuna odaklanır
- **Security First**: Tüm endpoint'ler SecurityConfig ile korunur
- **DTO Pattern**: Entity'ler direkt expose edilmez

### Frontend:
- **Component-Based**: Her sayfa bir component
- **Protected Routes**: Token kontrolü ile route koruması
- **API Abstraction**: axiosClient ile merkezi API yönetimi
- **State Management**: Local state (useState) + localStorage

### Deployment:
- **Nginx Reverse Proxy**: Traffic routing
- **Static Files**: React build output
- **Systemd Service**: Backend otomatik başlatma
- **All-in-One**: Backend + Frontend + Database aynı instance'da

---

**Bu diyagramları sunumda kullanabilirsiniz!** 📊

