# 📚 BAYMAK SERVICE MANAGEMENT SYSTEM - ÇALIŞMA PROGRAMI

## 🎯 HEDEF: Sözlü Sınav İçin Projeyi Baştan Sona Anlamak

**Değerlendirme Kriterleri:**
- Database Design (10 puan)
- Backend Spring Boot (20 puan)
- Frontend Hybrid (20 puan)
- API Integration (15 puan)
- Security & Auth (15 puan)
- Deployment Cloud (15 puan)
- Git & Code Quality (5 puan)
- Q&A Performance (0-1 çarpan)

---

## 📅 GÜN 1: PROJE GENEL BAKIŞ VE MİMARİ

### 1.1 Proje Amacı ve Kapsamı (30 dk)
- [ ] Projenin ne yaptığını anla: Baymak klima servis yönetim sistemi
- [ ] 3 rolü anla: CUSTOMER, TECHNICIAN, ADMIN
- [ ] Her rolün yetkilerini öğren
- [ ] Ana özellikleri listele:
  - Randevu yönetimi
  - Cihaz yönetimi
  - Teknisyen yönetimi
  - Servis raporları
  - Kullanıcı yönetimi

**Soru Hazırlığı:**
- "Projeniz ne yapıyor?" → Kısa ve net açıkla
- "Hangi rolleri destekliyor?" → 3 rolü ve yetkilerini say

### 1.2 Teknoloji Stack Genel Bakış (30 dk)
- [ ] Backend: Spring Boot 3.5.7, Java 17
- [ ] Frontend: React 19.2.0 + Thymeleaf
- [ ] Database: MySQL 8.0
- [ ] Build Tools: Maven, Vite
- [ ] Deployment: AWS EC2, Nginx

**Dosyalar:**
- `pom.xml` - Backend dependencies
- `package.json` - Frontend dependencies

**Soru Hazırlığı:**
- "Neden Spring Boot 3.x kullandınız?" → En güncel, Java 17 desteği
- "Neden React + Thymeleaf?" → Hybrid yaklaşım, SSR + SPA

### 1.3 Proje Mimarisi (1 saat)
- [ ] Backend mimarisi: Controller → Service → Repository → Model
- [ ] Frontend mimarisi: Pages → Components → API Client
- [ ] Deployment mimarisi: Nginx → Backend (8080) → Frontend (static) → MySQL

**Dosyalar:**
- `baymak-backend1/src/main/java/com/baymak/backend/` - Backend yapısı
- `src/` - Frontend yapısı

**Soru Hazırlığı:**
- "Projenizin mimarisi nasıl?" → Layer'ları açıkla
- "Nginx'in rolü nedir?" → Reverse proxy, static file serving

---

## 📅 GÜN 2: DATABASE TASARIMI (10 PUAN)

### 2.1 Entity Modelleri (2 saat)
- [ ] **User Entity** (`model/User.java`)
  - Alanlar: id, name, email, phone, address, password, role, createdAt
  - Role enum: CUSTOMER, TECHNICIAN, ADMIN
  - Validation: @Email, @NotBlank, @Pattern
  
- [ ] **Technician Entity** (`model/Technician.java`)
  - Alanlar: id, name, email, phone, specialization, password, role, createdAt
  - Role: TECHNICIAN
  
- [ ] **Device Entity** (`model/Device.java`)
  - Alanlar: id, user (ManyToOne), deviceType, model, serialNumber, createdAt
  - İlişki: User ile ManyToOne
  
- [ ] **Appointment Entity** (`model/Appointment.java`)
  - Alanlar: id, user, device, technician, date, time, status, problemDescription, createdAt
  - İlişkiler: User (ManyToOne), Device (ManyToOne), Technician (ManyToOne, nullable)
  - Status enum: PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
  
- [ ] **ServiceReport Entity** (`model/ServiceReport.java`)
  - Alanlar: id, appointment (ManyToOne), technician (ManyToOne), description, partsUsed, price, createdAt
  - İlişkiler: Appointment, Technician
  
- [ ] **ServiceRequest Entity** (`model/ServiceRequest.java`)
  - Alanlar: id, user (ManyToOne), title, description, deviceType, status, createdAt
  - Status enum: OPEN, IN_PROGRESS, COMPLETED

**Toplam: 6 Entity (5'ten fazla ✅)**

**Soru Hazırlığı:**
- "Kaç tablo var?" → 6 tablo: users, technicians, devices, appointments, services, service_requests
- "Entity'ler arası ilişkiler neler?" → ManyToOne, OneToOne açıkla

### 2.2 Database İlişkileri (1 saat)
- [ ] **User → Device**: OneToMany (Bir kullanıcının birden fazla cihazı)
- [ ] **User → Appointment**: OneToMany (Bir kullanıcının birden fazla randevusu)
- [ ] **Device → Appointment**: OneToMany (Bir cihazın birden fazla randevusu)
- [ ] **Technician → Appointment**: OneToMany (Bir teknisyenin birden fazla randevusu)
- [ ] **Appointment → ServiceReport**: OneToOne (Bir randevunun bir servis raporu)
- [ ] **Technician → ServiceReport**: OneToMany (Bir teknisyenin birden fazla raporu)

**Dosyalar:**
- Tüm `model/*.java` dosyalarını oku

**Soru Hazırlığı:**
- "Appointment ve User arasındaki ilişki nedir?" → ManyToOne, bir randevu bir kullanıcıya ait
- "Lazy loading nedir?" → FetchType.LAZY, performans için

### 2.3 Repository Katmanı (1 saat)
- [ ] **UserRepository** - JpaRepository<User, Long>
- [ ] **TechnicianRepository** - findByEmail metodu
- [ ] **DeviceRepository** - findByUser metodu
- [ ] **AppointmentRepository** - findByUser, findByTechnician, findByStatus metodları
- [ ] **ServiceReportRepository** - findByTechnician, findByAppointment
- [ ] **ServiceRequestRepository** - findByUser

**Dosyalar:**
- `repository/*.java` - Tüm repository'leri oku

**Soru Hazırlığı:**
- "Spring Data JPA nedir?" → JpaRepository interface, otomatik query generation
- "Custom query nasıl yazıyorsunuz?" → @Query annotation veya method naming

---

## 📅 GÜN 3: BACKEND MİMARİSİ - SPRING BOOT (20 PUAN)

### 3.1 Controller Katmanı (2 saat)
- [ ] **AuthController** (`controller/AuthController.java`)
  - POST `/api/auth/register` - Müşteri kaydı
  - POST `/api/auth/register/technician` - Teknisyen kaydı
  - POST `/api/auth/login` - Giriş (JWT token döner)
  - POST `/api/auth/reset-password` - Şifre sıfırlama
  
- [ ] **AppointmentController** (`controller/AppointmentController.java`)
  - Customer endpoints: `/api/appointments`, `/api/appointments/my/**`
  - Technician endpoints: `/api/appointments/assigned`, `/api/appointments/{id}/status`
  - Admin endpoints: `/api/appointments/all`, `/api/appointments/{id}/assign`
  
- [ ] **UserController** (`controller/UserController.java`)
  - Admin only: CRUD operations
  
- [ ] **TechnicianController** (`controller/TechnicianController.java`)
  - Admin only: CRUD operations
  
- [ ] **DeviceController** (`controller/DeviceController.java`)
  - Customer only: CRUD operations
  
- [ ] **ServiceReportController** (`controller/ServiceReportController.java`)
  - Technician: Create, list own reports
  - Admin: List all reports
  
- [ ] **ServiceRequestController** (`controller/ServiceRequestController.java`)
  - Customer only: CRUD operations
  
- [ ] **PageController** (`controller/PageController.java`)
  - GET `/` - Thymeleaf landing page

**Dosyalar:**
- Tüm `controller/*.java` dosyalarını oku

**Soru Hazırlığı:**
- "Controller'ın görevi nedir?" → HTTP isteklerini karşılar, Service'e yönlendirir
- "RESTful API nedir?" → GET, POST, PUT, DELETE HTTP metodları

### 3.2 Service Katmanı (2 saat)
- [ ] **Service Interface Pattern**
  - Her Controller için bir Service interface
  - ServiceImpl sınıfları implement eder
  
- [ ] **AuthService** (`service/impl/AuthServiceImpl.java`)
  - register(), login(), resetPassword()
  - JWT token generation
  - BCrypt password hashing
  
- [ ] **AppointmentService** (`service/impl/AppointmentServiceImpl.java`)
  - Customer: createAppointment(), getMyAppointments(), cancelAppointment()
  - Technician: getAssignedAppointments(), updateAppointmentStatus()
  - Admin: getAllAppointments(), assignTechnician()
  - **mapToDto()** metodu - Entity'den DTO'ya dönüşüm
  
- [ ] **UserService, TechnicianService, DeviceService**
  - CRUD operations
  - Role-based business logic

**Dosyalar:**
- `service/*.java` - Interface'ler
- `service/impl/*.java` - Implementation'lar

**Soru Hazırlığı:**
- "Service katmanının amacı nedir?" → Business logic, Controller'dan ayrı
- "DTO pattern nedir?" → Data Transfer Object, Entity'yi expose etmemek için

### 3.3 DTO (Data Transfer Object) Pattern (1 saat)
- [ ] **Request DTOs**: AppointmentRequestDto, UserRequestDto, DeviceRequestDto
- [ ] **Response DTOs**: AppointmentResponseDto, UserResponseDto, DeviceResponseDto
- [ ] **Neden DTO?** → Entity'yi direkt expose etmemek, güvenlik ve esneklik

**Dosyalar:**
- `dto/*.java` - Tüm DTO'ları oku

**Soru Hazırlığı:**
- "Neden DTO kullanıyorsunuz?" → Entity'yi direkt döndürmemek, password gibi hassas bilgileri gizlemek

### 3.4 Exception Handling (30 dk)
- [ ] **GlobalExceptionHandler** (`exception/GlobalExceptionHandler.java`)
  - @ExceptionHandler annotation
  - Custom exceptions: NotFoundException, BadRequestException, AlreadyExistsException
  - ApiError response formatı

**Dosyalar:**
- `exception/*.java` - Tüm exception sınıfları

**Soru Hazırlığı:**
- "Exception handling nasıl yapıyorsunuz?" → GlobalExceptionHandler ile merkezi yönetim

---

## 📅 GÜN 4: SECURITY & AUTHENTICATION (15 PUAN)

### 4.1 Spring Security Yapılandırması (1.5 saat)
- [ ] **SecurityConfig** (`config/SecurityConfig.java`)
  - @EnableWebSecurity
  - SecurityFilterChain bean
  - CORS configuration
  - PasswordEncoder (BCrypt)
  - AuthenticationManager
  
- [ ] **Endpoint Authorization**
  - Public: `/api/auth/**`, `/`, `/v3/api-docs/**`
  - Role-based: ADMIN, TECHNICIAN, CUSTOMER
  - `.hasRole()`, `.hasAnyRole()`, `.authenticated()`
  
- [ ] **CORS Configuration**
  - Allowed origins: localhost, EC2 IP
  - Allowed methods: GET, POST, PUT, DELETE, OPTIONS
  - Allow credentials: true

**Dosyalar:**
- `config/SecurityConfig.java` - Detaylı oku

**Soru Hazırlığı:**
- "Spring Security nasıl çalışıyor?" → Filter chain, authentication, authorization
- "CORS nedir?" → Cross-Origin Resource Sharing, farklı domain'lerden istek

### 4.2 JWT (JSON Web Token) Authentication (2 saat)
- [ ] **JwtTokenProvider** (`security/JwtTokenProvider.java`)
  - generateToken() - Token oluşturma
  - validateToken() - Token doğrulama
  - getEmailFromToken() - Token'dan email çıkarma
  - getRoleFromToken() - Token'dan rol çıkarma
  - HMAC-SHA256 algoritması
  - Secret key: application.properties'den
  
- [ ] **JwtAuthenticationFilter** (`security/JwtAuthenticationFilter.java`)
  - OncePerRequestFilter extends
  - Token'ı header'dan alır (Authorization: Bearer <token>)
  - Token'ı validate eder
  - Authentication object oluşturur
  - SecurityContext'e set eder
  
- [ ] **CustomUserDetailsService** (`security/CustomUserDetailsService.java`)
  - UserDetailsService implement
  - loadUserByUsername() - Email ile kullanıcı bulur
  - UserDetails döner

**Dosyalar:**
- `security/*.java` - Tüm security dosyaları
- `application.properties` - jwt.secret, jwt.expiration

**Soru Hazırlığı:**
- "JWT nedir?" → JSON Web Token, stateless authentication
- "Token nasıl oluşturuluyor?" → HMAC-SHA256 ile imzalanır, email ve role içerir
- "Token expiration nedir?" → 24 saat (86400000 ms)

### 4.3 Password Hashing (30 dk)
- [ ] **BCrypt** - Spring Security'de varsayılan
- [ ] Password encode: `passwordEncoder.encode(password)`
- [ ] Password verify: `passwordEncoder.matches(rawPassword, encodedPassword)`

**Soru Hazırlığı:**
- "Şifreler nasıl saklanıyor?" → BCrypt ile hash'lenir, plain text değil

---

## 📅 GÜN 5: FRONTEND MİMARİSİ - REACT (20 PUAN)

### 5.1 React Yapısı (1 saat)
- [ ] **App.jsx** - Ana routing yapısı
  - Public routes: /login, /register, /forgot-password
  - Protected routes: /dashboard/* (ProtectedRoute ile korunur)
  - React Router DOM 7.10.1
  
- [ ] **ProtectedRoute** (`components/ProtectedRoute.jsx`)
  - Token kontrolü (localStorage)
  - Token yoksa /login'e yönlendirir
  - <Outlet /> ile child route'ları render eder
  
- [ ] **Layout** (`components/Layout.jsx`)
  - Sidebar navigation
  - Role-based menu items
  - Logout functionality

**Dosyalar:**
- `src/App.jsx`
- `src/components/*.jsx`

**Soru Hazırlığı:**
- "React Router nasıl çalışıyor?" → Client-side routing, SPA
- "ProtectedRoute nedir?" → Token kontrolü ile route koruması

### 5.2 Pages (Sayfalar) (2 saat)
- [ ] **LoginPage** (`pages/LoginPage.jsx`)
  - Form state: email, password
  - handleSubmit() - API'ye POST isteği
  - Token'ı localStorage'a kaydet
  - navigate("/dashboard")
  
- [ ] **RegisterPage** (`pages/RegisterPage.jsx`)
  - Form state: name, email, phone, address, password
  - Auto-login after registration
  
- [ ] **DashboardPage** (`pages/DashboardPage.jsx`)
  - Role-based content
  - Statistics gösterimi
  
- [ ] **AppointmentsPage** (`pages/AppointmentsPage.jsx`)
  - Role-based endpoint: /api/appointments/my, /assigned, /all
  - CRUD operations
  - Status update (Technician)
  - Assign technician (Admin)
  - **Customer info display** (Admin & Technician)
  
- [ ] **DevicesPage, UsersPage, TechniciansPage**
  - CRUD operations
  - Role-based access
  
- [ ] **ServiceReportsPage** (`pages/ServiceReportsPage.jsx`)
  - Technician: Create, list own reports
  - Admin: List all reports

**Dosyalar:**
- Tüm `pages/*.jsx` dosyalarını oku

**Soru Hazırlığı:**
- "React hooks kullanıyor musunuz?" → useState, useEffect
- "State management nasıl?" → Local state (useState), localStorage

### 5.3 API Client (1 saat)
- [ ] **axiosClient** (`api/axiosClient.js`)
  - baseURL: "http://3.238.235.255"
  - Request interceptor: Token'ı header'a ekler
  - Response interceptor: 401 durumunda logout
  
- [ ] **Token Management**
  - localStorage.setItem("token", token)
  - localStorage.getItem("token")
  - Authorization header: `Bearer ${token}`

**Dosyalar:**
- `src/api/axiosClient.js`

**Soru Hazırlığı:**
- "Axios interceptor nedir?" → Request/response'u yakalayıp işleme
- "Token nasıl gönderiliyor?" → Authorization header'da Bearer token

### 5.4 Thymeleaf Landing Page (30 dk)
- [ ] **PageController** - GET `/` → `index.html`
- [ ] **Thymeleaf Template** (`templates/index.html`)
  - Static HTML + Thymeleaf syntax
  - Sign In, Sign Up linkleri → React frontend'e yönlendirir
  - Backend'den serve edilir

**Dosyalar:**
- `baymak-backend1/src/main/resources/templates/index.html`
- `controller/PageController.java`

**Soru Hazırlığı:**
- "Thymeleaf nedir?" → Server-side rendering template engine
- "Neden Thymeleaf kullandınız?" → Landing page için SSR, React için SPA

---

## 📅 GÜN 6: API INTEGRATION (15 PUAN)

### 6.1 Backend API Endpoints (1 saat)
- [ ] **Authentication Endpoints**
  - POST `/api/auth/register` → 201 Created, AuthResponseDto
  - POST `/api/auth/login` → 200 OK, AuthResponseDto (token içerir)
  
- [ ] **Appointment Endpoints**
  - POST `/api/appointments` → Create (Customer)
  - GET `/api/appointments/my` → List (Customer)
  - GET `/api/appointments/assigned` → List (Technician)
  - GET `/api/appointments/all` → List (Admin)
  - PUT `/api/appointments/{id}/status` → Update status (Technician)
  - PUT `/api/appointments/{id}/assign` → Assign technician (Admin)
  
- [ ] **Diğer Endpoints**
  - Users, Technicians, Devices, ServiceReports, ServiceRequests

**Dosyalar:**
- Tüm Controller'ları tekrar gözden geçir

**Soru Hazırlığı:**
- "API endpoint'leriniz neler?" → Her controller için endpoint'leri say
- "Response formatı nedir?" → JSON, DTO'lar

### 6.2 Frontend-Backend İletişimi (1.5 saat)
- [ ] **Request Flow**
  1. User action (button click)
  2. Frontend: axiosClient.post/get/put/delete
  3. Request interceptor: Token ekle
  4. Backend: Controller → Service → Repository
  5. Response: DTO
  6. Frontend: State update, UI refresh
  
- [ ] **Error Handling**
  - try-catch blocks
  - Error messages gösterimi
  - 401 → Logout, /login'e yönlendir

**Soru Hazırlığı:**
- "Frontend ve Backend nasıl iletişim kuruyor?" → RESTful API, JSON
- "CORS sorunu yaşadınız mı?" → SecurityConfig'de CORS ayarları

### 6.3 OpenAPI/Swagger Documentation (30 dk)
- [ ] **OpenApiConfig** (`config/OpenApiConfig.java`)
  - Swagger UI: `/swagger-ui.html`
  - API Docs: `/v3/api-docs`
  - @Operation annotations

**Dosyalar:**
- `config/OpenApiConfig.java`
- Controller'lardaki @Operation annotations

**Soru Hazırlığı:**
- "API dokümantasyonu var mı?" → Swagger UI ile otomatik

---

## 📅 GÜN 7: DEPLOYMENT - AWS EC2 (15 PUAN)

### 7.1 EC2 Instance Setup (1 saat)
- [ ] **Instance Details**
  - Type: t3.small veya üzeri
  - AMI: Ubuntu 22.04 LTS / Amazon Linux
  - Storage: 30 GB
  - Security Groups: SSH (22), HTTP (80), HTTPS (443)
  
- [ ] **Yazılımlar**
  - Java 17 (Amazon Corretto)
  - Maven
  - Node.js 20 (NVM ile)
  - MySQL 8.0
  - Nginx
  - Git

**Soru Hazırlığı:**
- "EC2'de hangi yazılımlar var?" → Java, Maven, Node.js, MySQL, Nginx
- "Instance type nedir?" → t3.small (RAM yeterli)

### 7.2 Nginx Configuration (1.5 saat)
- [ ] **Nginx Reverse Proxy**
  - Port 80'den gelen istekleri yönetir
  - `/` → Backend'e proxy (Thymeleaf landing page)
  - `/api/*` → Backend API'ye proxy (Port 8080)
  - Diğer path'ler → React frontend static files
  
- [ ] **React Router Support**
  - `try_files $uri $uri/ /index.html;` → SPA routing
  
- [ ] **Static Files**
  - Frontend build output: `/var/www/html/` veya `/usr/share/nginx/html/`
  - Cache headers

**Dosyalar:**
- EC2'deki `/etc/nginx/sites-available/baymak`

**Soru Hazırlığı:**
- "Nginx'in rolü nedir?" → Reverse proxy, static file serving
- "Thymeleaf ve React nasıl birlikte çalışıyor?" → Nginx routing ile

### 7.3 Backend Deployment (1 saat)
- [ ] **Systemd Service**
  - Service file: `/etc/systemd/system/baymak-backend.service`
  - Auto-restart on crash
  - Start after MySQL
  
- [ ] **Build & Deploy Process**
  ```bash
  git pull origin main
  mvn clean package -DskipTests
  sudo systemctl restart baymak-backend
  ```

**Soru Hazırlığı:**
- "Backend nasıl deploy ediliyor?" → Maven build, JAR file, systemd service
- "Otomatik restart var mı?" → systemd service ile

### 7.4 Frontend Deployment (30 dk)
- [ ] **Build Process**
  ```bash
  git pull origin main
  npm install
  npm run build
  sudo cp -r dist/* /var/www/html/
  ```

**Soru Hazırlığı:**
- "Frontend nasıl deploy ediliyor?" → Vite build, static files, Nginx serve

### 7.5 Database Setup (30 dk)
- [ ] **MySQL Configuration**
  - Database: `baymak`
  - User: `root` veya `baymak_user`
  - Localhost only (remote access yok)
  - Port: 3306
  
- [ ] **Connection**
  - `application.properties`: JDBC URL, username, password
  - Hibernate: `ddl-auto=update` (otomatik schema)

**Soru Hazırlığı:**
- "Database nasıl kuruldu?" → MySQL, Hibernate otomatik schema
- "Remote access var mı?" → Hayır, sadece localhost

---

## 📅 GÜN 8: GIT & CODE QUALITY (5 PUAN)

### 8.1 Git History (1 saat)
- [ ] **Commit Messages**
  - Meaningful commit messages
  - Feature-based commits
  - Bug fix commits
  
- [ ] **Branch Strategy**
  - main branch
  - Feature branches (opsiyonel)
  
- [ ] **Git Commands**
  - git add, commit, push, pull
  - git log, git status

**Soru Hazırlığı:**
- "Git kullanıyor musunuz?" → Evet, meaningful commits
- "Kaç commit var?" → 5'ten fazla olmalı

### 8.2 Code Structure (1 saat)
- [ ] **Backend Structure**
  - Package organization: controller, service, repository, model, dto
  - Separation of concerns
  - Clean code principles
  
- [ ] **Frontend Structure**
  - Component-based architecture
  - Pages, Components, API separation
  - Reusable components

**Soru Hazırlığı:**
- "Kod yapınız nasıl?" → Layer'lar, separation of concerns
- "Code quality nasıl sağlanıyor?" → Package structure, naming conventions

---

## 📅 GÜN 9: SORU-CEVAP HAZIRLIĞI

### 9.1 Teknik Sorular (2 saat)
- [ ] **Spring Boot Soruları**
  - "Spring Boot bean nedir?" → @Component, @Service, @Repository
  - "Dependency Injection nedir?" → @Autowired, constructor injection
  - "Spring Boot starter nedir?" → Pre-configured dependencies
  
- [ ] **React Soruları**
  - "React hooks nedir?" → useState, useEffect
  - "Component lifecycle nedir?" → useEffect ile simulate
  - "Props vs State?" → Props: parent'tan, State: component içinde
  
- [ ] **Database Soruları**
  - "JPA vs Hibernate?" → JPA spec, Hibernate implementation
  - "Lazy vs Eager loading?" → FetchType.LAZY, performans
  - "Transaction nedir?" → @Transactional annotation
  
- [ ] **Security Soruları**
  - "JWT vs Session?" → Stateless vs Stateful
  - "BCrypt nedir?" → Password hashing algorithm
  - "CORS nedir?" → Cross-Origin Resource Sharing

### 9.2 Mimari Sorular (1 saat)
- [ ] **Layered Architecture**
  - Controller → Service → Repository → Database
  - Her layer'ın sorumluluğu
  
- [ ] **Design Patterns**
  - DTO Pattern
  - Repository Pattern
  - Service Layer Pattern

### 9.3 Deployment Soruları (1 saat)
- [ ] **AWS EC2**
  - "Neden EC2?" → Cloud platform, scalability
  - "Instance type seçimi?" → RAM, CPU gereksinimleri
  
- [ ] **Nginx**
  - "Reverse proxy nedir?" → Client → Nginx → Backend
  - "Load balancing?" → Şu an yok, gelecekte eklenebilir

### 9.4 Proje-Specific Sorular (1 saat)
- [ ] **Her Feature İçin**
  - "Randevu nasıl oluşturuluyor?" → Customer → API → Service → Repository → DB
  - "Teknisyen nasıl atanıyor?" → Admin → API → Service → Appointment update
  - "Servis raporu nasıl oluşturuluyor?" → Technician → API → Service → Repository

---

## 📅 GÜN 10: FINAL REVIEW & DEMO HAZIRLIĞI

### 10.1 Proje Akışı Tekrarı (2 saat)
- [ ] **User Journey**
  1. Landing page (Thymeleaf) → Sign In/Sign Up
  2. Login → JWT token → Dashboard
  3. Customer: Device ekle → Appointment oluştur
  4. Admin: Appointment gör → Teknisyen ata
  5. Technician: Assigned appointments → Status update → Service report
  
- [ ] **API Flow**
  - Her action için API endpoint'leri
  - Request/Response formatları

### 10.2 Demo Senaryosu Hazırlığı (1 saat)
- [ ] **Demo Script**
  1. Landing page göster
  2. Login (Customer)
  3. Device ekle
  4. Appointment oluştur
  5. Logout → Admin login
  6. Appointment gör → Teknisyen ata
  7. Logout → Technician login
  8. Assigned appointment → Status update
  9. Service report oluştur
  
- [ ] **Test Data**
  - Test kullanıcıları hazırla
  - Test verileri oluştur

### 10.3 Kod İnceleme (1 saat)
- [ ] **Önemli Dosyalar Tekrar**
  - SecurityConfig.java
  - JwtTokenProvider.java
  - AppointmentServiceImpl.java
  - App.jsx
  - AppointmentsPage.jsx
  - axiosClient.js

### 10.4 Potansiyel Sorular ve Cevapları (1 saat)
- [ ] **Zor Sorular**
  - "Neden Thymeleaf + React?" → Hybrid yaklaşım, landing page SSR, app SPA
  - "Scalability nasıl?" → Şu an single instance, gelecekte load balancer
  - "Security iyileştirmeleri?" → HTTPS, rate limiting, input validation

---

## 📝 ÇALIŞMA İPUÇLARI

### ✅ Her Gün Yapılacaklar:
1. **Kod Oku** - İlgili dosyaları aç, satır satır oku
2. **Anla** - Her satırın ne yaptığını anla
3. **Soru Sor** - Kendine sorular sor, cevapla
4. **Not Al** - Önemli noktaları not al
5. **Tekrar Et** - Önceki günlerin konularını tekrar et

### 🎯 Sınav İçin Hazırlık:
- **10 dakika demo** - Her feature'ı hızlıca göster
- **Sorulara hazır ol** - Her teknoloji için 2-3 soru hazırla
- **Kod açıklama** - Her dosyanın ne yaptığını açıkla
- **Mimari açıklama** - Proje mimarisini çizerek açıkla

### ⚠️ Dikkat Edilmesi Gerekenler:
- **Runtime errors** → -10 puan! Demo öncesi test et
- **Deployment** → Mutlaka çalışır durumda olmalı
- **Git history** → 5'ten az commit → -10 puan
- **Q&A** → Sorulara cevap veremezsen → 0.2 çarpan (20 puan olur!)

---

## 🚀 BAŞARILAR!

Bu programı takip ederek projenizi baştan sona anlayacak ve sözlü sınavda başarılı olacaksınız!

**Son Kontrol Listesi:**
- [ ] Tüm entity'leri anladım
- [ ] Tüm controller'ları anladım
- [ ] Security yapısını anladım
- [ ] Frontend yapısını anladım
- [ ] API integration'ı anladım
- [ ] Deployment sürecini anladım
- [ ] Demo senaryosu hazır
- [ ] Sorulara hazırım

**GOOD LUCK! 🍀**

