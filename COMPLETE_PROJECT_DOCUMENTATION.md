# 📚 BAYMAK SERVICE MANAGEMENT SYSTEM - COMPLETE PROJECT DOCUMENTATION

## 📁 FILE MAP

### BACKEND - Controllers (REST API Endpoints)

#### `AuthController.java`
- **Purpose**: Handles authentication endpoints (register, login, password reset)
- **Interacts with**: `AuthService`, returns `AuthResponseDto`, `UserResponseDto`, `TechnicianResponseDto`
- **Endpoints**: `/api/auth/register`, `/api/auth/register/technician`, `/api/auth/login`, `/api/auth/reset-password`

#### `AppointmentController.java`
- **Purpose**: Manages appointment CRUD operations with role-based access
- **Interacts with**: `AppointmentService`, uses `Authentication` to get user email
- **Endpoints**: 
  - Customer: `POST /api/appointments`, `GET /api/appointments/my`, `PUT /api/appointments/my/{id}/cancel`
  - Technician: `GET /api/appointments/assigned`, `PUT /api/appointments/{id}/status`
  - Admin: `GET /api/appointments/all`, `PUT /api/appointments/{id}/assign`, `GET /api/appointments/status/{status}`

#### `UserController.java`
- **Purpose**: Admin-only user management (CRUD operations)
- **Interacts with**: `UserService`, requires `hasRole("ADMIN")`
- **Endpoints**: `/api/users/**` (GET, POST, PUT, DELETE)

#### `TechnicianController.java`
- **Purpose**: Admin-only technician management (CRUD operations)
- **Interacts with**: `TechnicianService`, requires `hasRole("ADMIN")`
- **Endpoints**: `/api/technicians/**` (GET, POST, PUT, DELETE)

#### `DeviceController.java`
- **Purpose**: Customer-only device management (CRUD operations)
- **Interacts with**: `DeviceService`, requires `hasRole("CUSTOMER")`
- **Endpoints**: `/api/devices/**` (GET, POST, PUT, DELETE)

#### `ServiceReportController.java`
- **Purpose**: Service report management (Technician creates, Admin views all)
- **Interacts with**: `ServiceReportService`
- **Endpoints**: `POST /api/service-reports`, `GET /api/service-reports/my`, `GET /api/service-reports/all`

#### `ServiceRequestController.java`
- **Purpose**: Customer service request management
- **Interacts with**: `ServiceRequestService`, requires `hasRole("CUSTOMER")`
- **Endpoints**: `/api/requests/**`

#### `PageController.java`
- **Purpose**: Serves Thymeleaf landing page at root path `/`
- **Interacts with**: Returns `index` template (Thymeleaf)
- **Endpoint**: `GET /` → `templates/index.html`

---

### BACKEND - Services (Business Logic)

#### `AuthService.java` (Interface)
- **Purpose**: Defines authentication service contract
- **Interacts with**: Implemented by `AuthServiceImpl`

#### `AuthServiceImpl.java`
- **Purpose**: Implements authentication logic (register, login, password reset)
- **Interacts with**: `UserRepository`, `TechnicianRepository`, `PasswordEncoder`, `JwtTokenProvider`
- **Key Methods**: 
  - `register()`: Creates user, hashes password with BCrypt, sets role to CUSTOMER
  - `registerTechnician()`: Creates both User and Technician entities
  - `login()`: Validates credentials, generates JWT token via `JwtTokenProvider.generateToken()`
  - `resetPassword()`: Updates password in both User and Technician tables if applicable

#### `AppointmentService.java` (Interface)
- **Purpose**: Defines appointment service contract
- **Interacts with**: Implemented by `AppointmentServiceImpl`

#### `AppointmentServiceImpl.java`
- **Purpose**: Implements appointment business logic
- **Interacts with**: `AppointmentRepository`, `UserRepository`, `DeviceRepository`, `TechnicianRepository`
- **Key Methods**:
  - `createAppointment()`: Validates device ownership, creates appointment with PENDING status
  - `getMyAppointments()`: Returns customer's appointments via `findByUser()`
  - `getAssignedAppointments()`: Returns technician's appointments via `findByTechnician()`
  - `assignTechnician()`: Sets technician and status to ASSIGNED
  - `updateAppointmentStatus()`: Updates status (Technician only)
  - `mapToDto()`: Converts Appointment entity to AppointmentResponseDto (includes customer info)

#### `ServiceReportServiceImpl.java`
- **Purpose**: Implements service report business logic
- **Interacts with**: `ServiceReportRepository`, `AppointmentRepository`, `TechnicianRepository`
- **Key Methods**:
  - `createServiceReport()`: Validates appointment is assigned to technician, sets appointment status to COMPLETED
  - `getMyServiceReports()`: Returns technician's reports via `findByTechnician()`

#### `UserServiceImpl.java`, `TechnicianServiceImpl.java`, `DeviceServiceImpl.java`
- **Purpose**: CRUD operations for respective entities
- **Interacts with**: Corresponding repositories

---

### BACKEND - Repositories (Data Access)

#### `UserRepository.java`
- **Purpose**: JPA repository for User entity
- **Interacts with**: `User` entity, MySQL `users` table
- **Methods**: `findByEmail()`, `existsByEmail()` (custom queries), inherits JpaRepository methods

#### `TechnicianRepository.java`
- **Purpose**: JPA repository for Technician entity
- **Interacts with**: `Technician` entity, MySQL `technicians` table
- **Methods**: `findByEmail()`, `existsByEmail()`

#### `AppointmentRepository.java`
- **Purpose**: JPA repository for Appointment entity
- **Interacts with**: `Appointment` entity, MySQL `appointments` table
- **Methods**: `findByUser()`, `findByTechnician()`, `findByStatus()`, `findByIdAndUser()`, `findByIdAndTechnician()`

#### `DeviceRepository.java`
- **Purpose**: JPA repository for Device entity
- **Interacts with**: `Device` entity, MySQL `devices` table
- **Methods**: `findByUser()` (custom query)

#### `ServiceReportRepository.java`
- **Purpose**: JPA repository for ServiceReport entity
- **Interacts with**: `ServiceReport` entity, MySQL `services` table
- **Methods**: `findByTechnician()`, `findByAppointment()`

#### `ServiceRequestRepository.java`
- **Purpose**: JPA repository for ServiceRequest entity
- **Interacts with**: `ServiceRequest` entity, MySQL `service_requests` table

---

### BACKEND - Models (JPA Entities)

#### `User.java`
- **Purpose**: Represents customer/user entity
- **Interacts with**: `users` table, has relationships with `Device`, `Appointment`, `ServiceRequest`
- **Fields**: id, name, email (unique), phone, address, password (BCrypt hashed), role (enum: CUSTOMER, TECHNICIAN, ADMIN), createdAt
- **Relationships**: OneToMany with Device, Appointment, ServiceRequest

#### `Technician.java`
- **Purpose**: Represents technician entity
- **Interacts with**: `technicians` table, has relationships with `Appointment`, `ServiceReport`
- **Fields**: id, name, email (unique), phone, password, specialization, createdAt
- **Relationships**: OneToMany with Appointment, ServiceReport

#### `Appointment.java`
- **Purpose**: Represents appointment entity
- **Interacts with**: `appointments` table
- **Fields**: id, user (ManyToOne), device (ManyToOne), technician (ManyToOne, nullable), date, time, status (enum), problemDescription, createdAt
- **Relationships**: ManyToOne with User, Device, Technician

#### `Device.java`
- **Purpose**: Represents customer device entity
- **Interacts with**: `devices` table
- **Fields**: id, user (ManyToOne), deviceType, model, serialNumber, createdAt
- **Relationships**: ManyToOne with User

#### `ServiceReport.java`
- **Purpose**: Represents service report entity
- **Interacts with**: `services` table
- **Fields**: id, appointment (ManyToOne), technician (ManyToOne), description, partsUsed, price, createdAt
- **Relationships**: ManyToOne with Appointment, Technician

#### `ServiceRequest.java`
- **Purpose**: Represents service request entity
- **Interacts with**: `service_requests` table
- **Fields**: id, user (ManyToOne), title, description, deviceType, status (enum), createdAt
- **Relationships**: ManyToOne with User

---

### BACKEND - DTOs (Data Transfer Objects)

#### Request DTOs:
- `AuthRequestDto.java`: Login request (email, password)
- `UserRequestDto.java`: User registration (name, email, phone, address, password)
- `TechnicianRequestDto.java`: Technician registration (name, email, phone, specialization, password)
- `AppointmentRequestDto.java`: Create appointment (deviceId, date, time, problemDescription)
- `AppointmentAssignDto.java`: Assign technician (technicianId)
- `AppointmentStatusUpdateDto.java`: Update status (status enum)
- `DeviceRequestDto.java`: Create/update device (deviceType, model, serialNumber)
- `ServiceReportRequestDto.java`: Create report (appointmentId, description, partsUsed, price)
- `PasswordResetRequestDto.java`: Reset password (email, newPassword)

#### Response DTOs:
- `AuthResponseDto.java`: Login response (token, email, role, id, name, phone, address, message)
- `UserResponseDto.java`: User data (id, name, email, phone, address, role, createdAt)
- `AppointmentResponseDto.java`: Appointment data (includes customer info: customerName, customerEmail, customerPhone, customerAddress)
- `DeviceResponseDto.java`: Device data
- `TechnicianResponseDto.java`: Technician data
- `ServiceReportResponseDto.java`: Service report data

---

### BACKEND - Security

#### `SecurityConfig.java`
- **Purpose**: Configures Spring Security (CORS, password encoder, security filter chain, endpoint authorization)
- **Interacts with**: `JwtAuthenticationFilter`, `CorsConfigurationSource`
- **Key Configurations**:
  - `PasswordEncoder`: BCryptPasswordEncoder bean
  - `CorsConfigurationSource`: Allows origins (localhost, EC2 IP), methods (GET, POST, PUT, DELETE, OPTIONS)
  - `SecurityFilterChain`: Defines public/protected endpoints, role-based access rules

#### `JwtTokenProvider.java`
- **Purpose**: Generates and validates JWT tokens
- **Interacts with**: Uses `jwt.secret` and `jwt.expiration` from `application.properties`
- **Key Methods**:
  - `generateToken()`: Creates JWT with email as subject, role as claim, HMAC-SHA256 signature
  - `validateToken()`: Verifies token signature and expiration
  - `getEmailFromToken()`: Extracts email from token subject
  - `getRoleFromToken()`: Extracts role from token claims

#### `JwtAuthenticationFilter.java`
- **Purpose**: Intercepts requests, extracts JWT token from Authorization header, validates and sets SecurityContext
- **Interacts with**: `JwtTokenProvider`, `CustomUserDetailsService`
- **Key Logic**: Extracts `Bearer <token>` from `Authorization` header, validates token, loads UserDetails, sets Authentication in SecurityContext

#### `CustomUserDetailsService.java`
- **Purpose**: Loads user details for Spring Security
- **Interacts with**: `UserRepository`
- **Key Method**: `loadUserByUsername()`: Finds user by email, returns UserDetails with authorities (ROLE_CUSTOMER, ROLE_TECHNICIAN, ROLE_ADMIN)

---

### BACKEND - Config

#### `OpenApiConfig.java`
- **Purpose**: Configures Swagger/OpenAPI documentation
- **Interacts with**: SpringDoc OpenAPI, generates docs at `/swagger-ui.html`

---

### BACKEND - Exception Handling

#### `GlobalExceptionHandler.java`
- **Purpose**: Centralized exception handling with @ExceptionHandler
- **Interacts with**: All custom exceptions, returns `ApiError` response
- **Handles**: `NotFoundException`, `BadRequestException`, `AlreadyExistsException`, validation errors

#### Custom Exceptions:
- `NotFoundException.java`: 404 errors
- `BadRequestException.java`: 400 errors
- `AlreadyExistsException.java`: 409 conflicts
- `ApiError.java`: Error response format

---

### FRONTEND - Pages

#### `LoginPage.jsx`
- **Purpose**: User login form
- **Interacts with**: `axiosClient.post("/api/auth/login")`, stores token in localStorage, navigates to `/dashboard`
- **State**: email, password, error

#### `RegisterPage.jsx`
- **Purpose**: User registration form
- **Interacts with**: `axiosClient.post("/api/auth/register")`, auto-login after registration
- **State**: name, email, phone, address, password, confirmPassword, error

#### `AppointmentsPage.jsx`
- **Purpose**: Appointment management (role-based views and actions)
- **Interacts with**: 
  - Customer: `GET /api/appointments/my`, `POST /api/appointments`
  - Technician: `GET /api/appointments/assigned`, `PUT /api/appointments/{id}/status`
  - Admin: `GET /api/appointments/all`, `PUT /api/appointments/{id}/assign`
- **State**: appointments, devices, technicians, modals, formData

#### `DevicesPage.jsx`
- **Purpose**: Device CRUD (Customer only)
- **Interacts with**: `/api/devices/**` endpoints

#### `UsersPage.jsx`
- **Purpose**: User management (Admin only)
- **Interacts with**: `/api/users/**` endpoints

#### `TechniciansPage.jsx`
- **Purpose**: Technician management (Admin only)
- **Interacts with**: `/api/technicians/**` endpoints

#### `ServiceReportsPage.jsx`
- **Purpose**: Service report management
- **Interacts with**: `/api/service-reports/**` endpoints

#### `DashboardPage.jsx`
- **Purpose**: Role-based dashboard with statistics
- **Interacts with**: Various endpoints based on role

#### `ProfilePage.jsx`
- **Purpose**: User profile management
- **Interacts with**: `GET /api/users/me`, `PUT /api/users/me`

#### `ForgotPasswordPage.jsx`
- **Purpose**: Password reset form
- **Interacts with**: `POST /api/auth/reset-password`

---

### FRONTEND - Components

#### `App.jsx`
- **Purpose**: Main routing component (React Router)
- **Interacts with**: Defines public routes (`/login`, `/register`) and protected routes (`/dashboard/*`)

#### `ProtectedRoute.jsx`
- **Purpose**: Route guard - checks for token in localStorage
- **Interacts with**: Redirects to `/login` if no token, renders `<Outlet />` if authenticated

#### `Layout.jsx`
- **Purpose**: Main layout with sidebar navigation
- **Interacts with**: Role-based menu items, logout functionality, renders child routes

---

### FRONTEND - API Client

#### `axiosClient.js`
- **Purpose**: Axios instance configuration with interceptors
- **Interacts with**: Backend API at `http://3.238.235.255`
- **Request Interceptor**: Adds `Authorization: Bearer <token>` header from localStorage
- **Response Interceptor**: Handles 401 errors (clears localStorage, redirects to `/login`)

---

### CONFIGURATION FILES

#### `application.properties`
- **Purpose**: Spring Boot configuration
- **Key Properties**:
  - `spring.datasource.url`: MySQL connection (jdbc:mysql://localhost:3306/baymak)
  - `spring.jpa.hibernate.ddl-auto=update`: Auto-create/update schema
  - `jwt.secret`: HMAC-SHA256 secret key (64+ bytes)
  - `jwt.expiration`: Token expiration (86400000 ms = 24 hours)
  - `server.port=8080`: Backend port

#### `package.json`
- **Purpose**: Frontend dependencies and scripts
- **Key Dependencies**: React 19.2.0, React Router DOM 7.10.1, Axios 1.13.2, Vite 7.2.4

#### `pom.xml`
- **Purpose**: Backend Maven dependencies
- **Key Dependencies**: Spring Boot 3.5.7, Spring Security, JWT (jjwt 0.12.3), MySQL Connector, Thymeleaf

---

## 🔄 STEP-BY-STEP FLOWS

### SCENARIO 1: Register + Login (JWT Creation)

#### Step 1: User Registration (Frontend)
**File**: `src/pages/RegisterPage.jsx`  
**Method**: `handleSubmit()`  
**Action**: 
- Validates password match and length
- Calls `axiosClient.post("/api/auth/register", registerData)`
- Sends: `{name, email, phone, address, password}`

#### Step 2: Registration Request (Backend Controller)
**File**: `baymak-backend1/src/main/java/com/baymak/backend/controller/AuthController.java`  
**Method**: `register(@Valid @RequestBody UserRequestDto userDto)`  
**Action**: 
- Receives `UserRequestDto`
- Calls `authService.register(userDto)`
- Returns `ResponseEntity.created()` with `UserResponseDto`

#### Step 3: Registration Business Logic
**File**: `baymak-backend1/src/main/java/com/baymak/backend/service/impl/AuthServiceImpl.java`  
**Method**: `register(UserRequestDto dto)`  
**Action**:
- Checks if email exists: `userRepository.existsByEmail(dto.getEmail())`
- Hashes password: `passwordEncoder.encode(dto.getPassword())` (BCrypt)
- Creates User entity: `User.builder().role(User.Role.CUSTOMER).build()`
- Saves: `userRepository.save(user)`
- Maps to DTO: `mapToDto(savedUser)`

#### Step 4: Auto-Login After Registration (Frontend)
**File**: `src/pages/RegisterPage.jsx`  
**Method**: `handleSubmit()` (after registration success)  
**Action**:
- Calls `axiosClient.post("/api/auth/login", {email, password})`

#### Step 5: Login Request (Backend Controller)
**File**: `baymak-backend1/src/main/java/com/baymak/backend/controller/AuthController.java`  
**Method**: `login(@Valid @RequestBody AuthRequestDto authDto)`  
**Action**:
- Receives `AuthRequestDto` (email, password)
- Calls `authService.login(authDto)`
- Returns `ResponseEntity.ok(AuthResponseDto)` with JWT token

#### Step 6: Login Business Logic
**File**: `baymak-backend1/src/main/java/com/baymak/backend/service/impl/AuthServiceImpl.java`  
**Method**: `login(AuthRequestDto dto)`  
**Action**:
- Finds user: `userRepository.findByEmail(dto.getEmail())`
- Validates password: `passwordEncoder.matches(dto.getPassword(), user.getPassword())`
- Generates JWT: `jwtTokenProvider.generateToken(user)`
- Returns `AuthResponseDto` with token, email, role, user info

#### Step 7: JWT Token Generation
**File**: `baymak-backend1/src/main/java/com/baymak/backend/security/JwtTokenProvider.java`  
**Method**: `generateToken(User user)`  
**Action**:
- Creates JWT: `Jwts.builder()`
  - `.subject(user.getEmail())` - Email as subject
  - `.claim("role", user.getRole().name())` - Role as claim
  - `.issuedAt(now)` - Current time
  - `.expiration(expiryDate)` - 24 hours from now
  - `.signWith(getSigningKey())` - HMAC-SHA256 signature
  - `.compact()` - Returns token string

#### Step 8: Token Storage (Frontend)
**File**: `src/pages/RegisterPage.jsx` / `src/pages/LoginPage.jsx`  
**Method**: After login response  
**Action**:
- `localStorage.setItem("token", res.data.token)`
- `localStorage.setItem("role", res.data.role)`
- `localStorage.setItem("email", res.data.email)`
- `localStorage.setItem("userInfo", JSON.stringify(userInfo))`
- Navigates: `navigate("/dashboard")`

---

### SCENARIO 2: Customer Creates Appointment (DB Write + DTO)

#### Step 1: Appointment Form Submission (Frontend)
**File**: `src/pages/AppointmentsPage.jsx`  
**Method**: `handleCreateAppointment(e)`  
**Action**:
- Validates form data (deviceId, date, time required)
- Validates date is not in past
- Calls `axiosClient.post("/api/appointments", formData)`
- Sends: `{deviceId, date, time, problemDescription}`

#### Step 2: Request Interceptor (Frontend)
**File**: `src/api/axiosClient.js`  
**Method**: Request interceptor  
**Action**:
- Gets token: `localStorage.getItem("token")`
- Adds header: `config.headers.Authorization = "Bearer ${token}"`

#### Step 3: Appointment Creation Request (Backend Controller)
**File**: `baymak-backend1/src/main/java/com/baymak/backend/controller/AppointmentController.java`  
**Method**: `createAppointment(@Valid @RequestBody AppointmentRequestDto dto, Authentication authentication)`  
**Action**:
- Receives `AppointmentRequestDto`
- Gets user email: `authentication.getName()` (from JWT token)
- Calls `appointmentService.createAppointment(dto, userEmail)`
- Returns `ResponseEntity.status(HttpStatus.CREATED)` with `AppointmentResponseDto`

#### Step 4: JWT Filter (Before Controller)
**File**: `baymak-backend1/src/main/java/com/baymak/backend/security/JwtAuthenticationFilter.java`  
**Method**: `doFilterInternal()`  
**Action**:
- Extracts token: `request.getHeader("Authorization").substring(7)` (removes "Bearer ")
- Validates: `jwtTokenProvider.validateToken(token)`
- Gets email: `jwtTokenProvider.getEmailFromToken(token)`
- Loads user: `customUserDetailsService.loadUserByUsername(email)`
- Sets authentication: `SecurityContextHolder.getContext().setAuthentication(authentication)`

#### Step 5: Security Config Authorization
**File**: `baymak-backend1/src/main/java/com/baymak/backend/config/SecurityConfig.java`  
**Method**: `securityFilterChain()`  
**Action**:
- Checks role: `.requestMatchers("/api/appointments").hasRole("CUSTOMER")`
- Allows request if user has ROLE_CUSTOMER

#### Step 6: Appointment Creation Business Logic
**File**: `baymak-backend1/src/main/java/com/baymak/backend/service/impl/AppointmentServiceImpl.java`  
**Method**: `createAppointment(AppointmentRequestDto dto, String userEmail)`  
**Action**:
- Finds user: `userRepository.findByEmail(userEmail)`
- Finds device: `deviceRepository.findById(dto.getDeviceId())`
- Validates ownership: `device.getUser().getId().equals(user.getId())`
- Creates appointment: `Appointment.builder()`
  - `.user(user)`
  - `.device(device)`
  - `.date(dto.getDate())`
  - `.time(dto.getTime())`
  - `.problemDescription(dto.getProblemDescription())`
  - `.status(AppointmentStatus.PENDING)` - Default status
- Saves: `appointmentRepository.save(appointment)` - **DB WRITE**
- Maps to DTO: `mapToDto(saved)` - **DTO CONVERSION**

#### Step 7: Entity to DTO Mapping
**File**: `baymak-backend1/src/main/java/com/baymak/backend/service/impl/AppointmentServiceImpl.java`  
**Method**: `mapToDto(Appointment appointment)`  
**Action**:
- Extracts user: `User user = appointment.getUser()`
- Builds DTO: `AppointmentResponseDto.builder()`
  - `.id(appointment.getId())`
  - `.userId(user.getId())`
  - `.customerName(user.getName())` - Customer info included
  - `.customerEmail(user.getEmail())`
  - `.customerPhone(user.getPhone())`
  - `.customerAddress(user.getAddress())`
  - `.deviceId(appointment.getDevice().getId())`
  - `.deviceType(appointment.getDevice().getDeviceType())`
  - `.deviceModel(appointment.getDevice().getModel())`
  - `.date(appointment.getDate())`
  - `.time(appointment.getTime())`
  - `.status(appointment.getStatus())`
  - `.problemDescription(appointment.getProblemDescription())`
  - `.createdAt(appointment.getCreatedAt())`
- Returns `AppointmentResponseDto`

#### Step 8: Response (Frontend)
**File**: `src/pages/AppointmentsPage.jsx`  
**Method**: `handleCreateAppointment()` (after API call)  
**Action**:
- Receives `AppointmentResponseDto`
- Closes modal: `setShowCreateModal(false)`
- Refreshes list: `fetchAppointments()`
- Updates UI with new appointment

---

### SCENARIO 3: Admin Assigns Technician → Technician Updates Status → Creates Service Report

#### PART A: Admin Assigns Technician

##### Step 1: Assign Action (Frontend)
**File**: `src/pages/AppointmentsPage.jsx`  
**Method**: `handleAssignTechnician(e)`  
**Action**:
- Validates technician selected
- Calls `axiosClient.put(`/api/appointments/${id}/assign`, {technicianId})`
- Sends: `{technicianId: selectedTechnicianId}`

##### Step 2: Assign Request (Backend Controller)
**File**: `baymak-backend1/src/main/java/com/baymak/backend/controller/AppointmentController.java`  
**Method**: `assignTechnician(@PathVariable Long id, @Valid @RequestBody AppointmentAssignDto dto)`  
**Action**:
- Receives appointment ID and `AppointmentAssignDto` (technicianId)
- Calls `appointmentService.assignTechnician(id, dto)`
- Returns `ResponseEntity.ok(AppointmentResponseDto)`

##### Step 3: Security Check
**File**: `baymak-backend1/src/main/java/com/baymak/backend/config/SecurityConfig.java`  
**Action**:
- Checks: `.requestMatchers("/api/appointments/*/assign").hasRole("ADMIN")`
- Allows only ADMIN role

##### Step 4: Assign Business Logic
**File**: `baymak-backend1/src/main/java/com/baymak/backend/service/impl/AppointmentServiceImpl.java`  
**Method**: `assignTechnician(Long id, AppointmentAssignDto dto)`  
**Action**:
- Finds appointment: `appointmentRepository.findById(id)`
- Finds technician: `technicianRepository.findById(dto.getTechnicianId())`
- Sets technician: `appointment.setTechnician(technician)`
- Sets status: `appointment.setStatus(AppointmentStatus.ASSIGNED)`
- Saves: `appointmentRepository.save(appointment)` - **DB WRITE**
- Returns: `mapToDto(updated)`

---

#### PART B: Technician Updates Status

##### Step 1: Status Update Action (Frontend)
**File**: `src/pages/AppointmentsPage.jsx`  
**Method**: `handleUpdateStatus(e)`  
**Action**:
- Validates status selected
- Calls `axiosClient.put(`/api/appointments/${id}/status`, {status})`
- Sends: `{status: selectedStatus}`

##### Step 2: Status Update Request (Backend Controller)
**File**: `baymak-backend1/src/main/java/com/baymak/backend/controller/AppointmentController.java`  
**Method**: `updateAppointmentStatus(@PathVariable Long id, @Valid @RequestBody AppointmentStatusUpdateDto dto, Authentication authentication)`  
**Action**:
- Gets technician email: `authentication.getName()`
- Calls `appointmentService.updateAppointmentStatus(id, dto, technicianEmail)`
- Returns `ResponseEntity.ok(AppointmentResponseDto)`

##### Step 3: Security Check
**File**: `baymak-backend1/src/main/java/com/baymak/backend/config/SecurityConfig.java`  
**Action**:
- Checks: `.requestMatchers("/api/appointments/*/status").hasRole("TECHNICIAN")`
- Allows only TECHNICIAN role

##### Step 4: Status Update Business Logic
**File**: `baymak-backend1/src/main/java/com/baymak/backend/service/impl/AppointmentServiceImpl.java`  
**Method**: `updateAppointmentStatus(Long id, AppointmentStatusUpdateDto dto, String technicianEmail)`  
**Action**:
- Finds technician: `technicianRepository.findByEmail(technicianEmail)`
- Finds appointment: `appointmentRepository.findByIdAndTechnician(id, technician)` - **Validates ownership**
- Updates status: `appointment.setStatus(dto.getStatus())` (e.g., IN_PROGRESS)
- Saves: `appointmentRepository.save(appointment)` - **DB WRITE**
- Returns: `mapToDto(updated)`

---

#### PART C: Technician Creates Service Report

##### Step 1: Create Report Action (Frontend)
**File**: `src/pages/ServiceReportsPage.jsx`  
**Method**: `handleCreateReport(e)`  
**Action**:
- Validates form data
- Calls `axiosClient.post("/api/service-reports", formData)`
- Sends: `{appointmentId, description, partsUsed, price}`

##### Step 2: Create Report Request (Backend Controller)
**File**: `baymak-backend1/src/main/java/com/baymak/backend/controller/ServiceReportController.java`  
**Method**: `createServiceReport(@Valid @RequestBody ServiceReportRequestDto dto, Authentication authentication)`  
**Action**:
- Gets technician email: `authentication.getName()`
- Calls `serviceReportService.createServiceReport(dto, technicianEmail)`
- Returns `ResponseEntity.status(HttpStatus.CREATED)` with `ServiceReportResponseDto`

##### Step 3: Security Check
**File**: `baymak-backend1/src/main/java/com/baymak/backend/config/SecurityConfig.java`  
**Action**:
- Checks: `.requestMatchers("/api/service-reports").hasRole("TECHNICIAN")` (POST)
- Allows only TECHNICIAN role

##### Step 4: Create Report Business Logic
**File**: `baymak-backend1/src/main/java/com/baymak/backend/service/impl/ServiceReportServiceImpl.java`  
**Method**: `createServiceReport(ServiceReportRequestDto dto, String technicianEmail)`  
**Action**:
- Finds technician: `technicianRepository.findByEmail(technicianEmail)`
- Finds appointment: `appointmentRepository.findById(dto.getAppointmentId())`
- Validates assignment: `appointment.getTechnician().getId().equals(technician.getId())`
- Validates status: `appointment.getStatus() == AppointmentStatus.IN_PROGRESS || ASSIGNED`
- Checks duplicate: `serviceReportRepository.findByAppointment(appointment).isPresent()`
- Creates report: `ServiceReport.builder()`
  - `.appointment(appointment)`
  - `.technician(technician)`
  - `.description(dto.getDescription())`
  - `.partsUsed(dto.getPartsUsed())`
  - `.price(dto.getPrice())`
- **Updates appointment status**: `appointment.setStatus(AppointmentStatus.COMPLETED)`
- Saves appointment: `appointmentRepository.save(appointment)` - **DB WRITE**
- Saves report: `serviceReportRepository.save(serviceReport)` - **DB WRITE**
- Returns: `mapToDto(saved)`

##### Step 5: Entity to DTO Mapping
**File**: `baymak-backend1/src/main/java/com/baymak/backend/service/impl/ServiceReportServiceImpl.java`  
**Method**: `mapToDto(ServiceReport serviceReport)`  
**Action**:
- Builds DTO: `ServiceReportResponseDto.builder()`
  - `.id(serviceReport.getId())`
  - `.appointmentId(serviceReport.getAppointment().getId())`
  - `.technicianId(serviceReport.getTechnician().getId())`
  - `.technicianName(serviceReport.getTechnician().getName())`
  - `.description(serviceReport.getDescription())`
  - `.partsUsed(serviceReport.getPartsUsed())`
  - `.price(serviceReport.getPrice())`
  - `.createdAt(serviceReport.getCreatedAt())`
- Returns `ServiceReportResponseDto`

---

## 🔒 SECURITY IMPLEMENTATION DETAILS

### 1. SecurityConfig - Endpoint Authorization

**File**: `baymak-backend1/src/main/java/com/baymak/backend/config/SecurityConfig.java`

#### Public Endpoints (No Authentication Required):
```java
.requestMatchers("/baymak.png").permitAll()
.requestMatchers("/").permitAll()  // Thymeleaf landing page
.requestMatchers("/error", "/error/**").permitAll()
.requestMatchers("/api/auth/**").permitAll()  // Register, login, reset password
.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
```

#### Role-Based Protected Endpoints:

**ADMIN Only:**
```java
.requestMatchers("/api/appointments/all").hasRole("ADMIN")
.requestMatchers("/api/appointments/status/**").hasRole("ADMIN")
.requestMatchers("/api/appointments/*/assign").hasRole("ADMIN")
.requestMatchers("/api/technicians/**").hasRole("ADMIN")
.requestMatchers("/api/users/**").hasRole("ADMIN")  // Except /api/users/me
.requestMatchers("/api/service-reports/all").hasRole("ADMIN")
```

**TECHNICIAN Only:**
```java
.requestMatchers("/api/appointments/assigned").hasRole("TECHNICIAN")
.requestMatchers("/api/appointments/*/status").hasRole("TECHNICIAN")
.requestMatchers("/api/service-reports/my").hasRole("TECHNICIAN")
.requestMatchers("/api/service-reports").hasRole("TECHNICIAN")  // POST - create
```

**CUSTOMER Only:**
```java
.requestMatchers("/api/appointments/my/**").hasRole("CUSTOMER")
.requestMatchers("/api/devices/**").hasRole("CUSTOMER")
.requestMatchers("/api/requests/**").hasRole("CUSTOMER")
.requestMatchers("/api/appointments").hasRole("CUSTOMER")  // POST - create
```

**Authenticated (Any Role):**
```java
.requestMatchers("/api/users/me").authenticated()  // Get/update own profile
.requestMatchers("/api/service-reports/{id}").hasAnyRole("ADMIN", "TECHNICIAN")
.requestMatchers("/api/service-reports/appointment/**").hasAnyRole("ADMIN", "TECHNICIAN")
```

#### Security Configuration:
```java
.cors(cors -> cors.configurationSource(corsConfigurationSource()))
.csrf(csrf -> csrf.disable())  // JWT is stateless, CSRF not needed
.httpBasic(httpBasic -> httpBasic.disable())
.formLogin(formLogin -> formLogin.disable())
.sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
```

#### CORS Configuration:
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:5173",
        "http://localhost:3000",
        "http://3.238.235.255",
        "http://3.238.235.255:80"
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    // ...
}
```

---

### 2. JwtAuthenticationFilter - Token Extraction & SecurityContext

**File**: `baymak-backend1/src/main/java/com/baymak/backend/security/JwtAuthenticationFilter.java`

#### Filter Chain Position:
- Extends `OncePerRequestFilter`
- Added before `UsernamePasswordAuthenticationFilter` in SecurityConfig
- Runs for every request (except `/api/auth/**` which is skipped)

#### Token Extraction Process:

**Step 1: Skip Auth Endpoints**
```java
if (request.getServletPath().startsWith("/api/auth")) {
    filterChain.doFilter(request, response);
    return;  // No JWT check for login/register
}
```

**Step 2: Extract Authorization Header**
```java
String authHeader = request.getHeader("Authorization");
// Expected format: "Bearer <token>"
```

**Step 3: Validate Header Format**
```java
if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
    filterChain.doFilter(request, response);
    return;  // No token, let SecurityConfig handle authorization
}
```

**Step 4: Extract Token**
```java
String token = authHeader.substring(7);  // Remove "Bearer " prefix
```

**Step 5: Validate Token**
```java
if (jwtTokenProvider.validateToken(token)) {
    // Token is valid, proceed
}
```

**Step 6: Extract Email from Token**
```java
String email = jwtTokenProvider.getEmailFromToken(token);
// Email is stored as JWT subject
```

**Step 7: Load UserDetails**
```java
UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
// Loads user from database, creates UserDetails with authorities
```

**Step 8: Create Authentication Object**
```java
UsernamePasswordAuthenticationToken authentication = 
    new UsernamePasswordAuthenticationToken(
        userDetails,           // Principal
        null,                  // Credentials (not needed for JWT)
        userDetails.getAuthorities()  // Roles: ROLE_CUSTOMER, ROLE_TECHNICIAN, ROLE_ADMIN
    );
authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
```

**Step 9: Set SecurityContext**
```java
SecurityContextHolder.getContext().setAuthentication(authentication);
// Now Spring Security knows who is authenticated
```

**Step 10: Continue Filter Chain**
```java
filterChain.doFilter(request, response);
// Request continues to Controller
```

#### Headers Used:
- **Request Header**: `Authorization: Bearer <JWT_TOKEN>`
- **Extracted**: Token string (without "Bearer " prefix)
- **SecurityContext**: Contains `Authentication` object with `UserDetails` and `Authorities`

---

### 3. JwtTokenProvider - Token Generation & Validation

**File**: `baymak-backend1/src/main/java/com/baymak/backend/security/JwtTokenProvider.java`

#### Configuration (from application.properties):
```properties
jwt.secret=MyVerySecureSecretKeyForJWTTokenGenerationMustBeAtLeast32BytesLongForHMACSHA256AlgorithmToWorkProperly
jwt.expiration=86400000  # 24 hours in milliseconds
```

#### Token Generation (`generateToken()`):

**Step 1: Get Signing Key**
```java
private SecretKey getSigningKey() {
    byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
    // If key < 32 bytes, hash with SHA-256 to get 32 bytes
    if (keyBytes.length < 32) {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        keyBytes = digest.digest(keyBytes);
    }
    return Keys.hmacShaKeyFor(keyBytes);  // HMAC-SHA256 key
}
```

**Step 2: Build JWT**
```java
public String generateToken(User user) {
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + jwtExpiration);  // 24 hours
    
    return Jwts.builder()
        .subject(user.getEmail())                    // Email as subject (JWT standard claim)
        .claim("role", user.getRole().name())       // Custom claim: "CUSTOMER", "TECHNICIAN", "ADMIN"
        .issuedAt(now)                              // iat claim
        .expiration(expiryDate)                      // exp claim
        .signWith(getSigningKey())                   // HMAC-SHA256 signature
        .compact();                                  // Returns base64-encoded token string
}
```

**JWT Structure:**
```
Header: {"alg":"HS256","typ":"JWT"}
Payload: {
  "sub": "user@example.com",      // Subject (email)
  "role": "CUSTOMER",              // Custom claim
  "iat": 1234567890,               // Issued at
  "exp": 1234654290                // Expiration
}
Signature: HMAC-SHA256(base64(header) + "." + base64(payload), secret)
```

#### Token Validation (`validateToken()`):

**Step 1: Check Token Exists**
```java
if (token == null || token.isEmpty()) {
    return false;
}
```

**Step 2: Parse and Verify**
```java
Jwts.parser()
    .verifyWith(getSigningKey())  // Verify signature with same secret key
    .build()
    .parseSignedClaims(token);    // Parse and validate
```

**Step 3: Handle Exceptions**
```java
catch (ExpiredJwtException e) {
    log.warn("JWT token is expired");
    return false;
}
catch (JwtException e) {
    log.warn("Invalid JWT token");
    return false;
}
```

#### Extract Email from Token (`getEmailFromToken()`):
```java
Claims claims = Jwts.parser()
    .verifyWith(getSigningKey())
    .build()
    .parseSignedClaims(token)
    .getPayload();
return claims.getSubject();  // Returns email (stored as subject)
```

#### Extract Role from Token (`getRoleFromToken()`):
```java
Claims claims = Jwts.parser()
    .verifyWith(getSigningKey())
    .build()
    .parseSignedClaims(token)
    .getPayload();
return claims.get("role", String.class);  // Returns "CUSTOMER", "TECHNICIAN", or "ADMIN"
```

#### Where Roles Are Read From:

1. **Token Generation**: Role is read from `User.getRole()` and stored as JWT claim
2. **Token Validation**: Role is extracted from JWT claim via `getRoleFromToken()`
3. **UserDetails**: Role is converted to authority via `user.getRole().getAuthority()` → `"ROLE_CUSTOMER"`
4. **SecurityConfig**: Uses `hasRole("ADMIN")` which checks for `"ROLE_ADMIN"` authority
5. **Controller**: Gets role from `Authentication` object: `authentication.getAuthorities()`

#### Role to Authority Conversion:
```java
// In User.java
public enum Role {
    CUSTOMER, TECHNICIAN, ADMIN;
    
    public String getAuthority() {
        return "ROLE_" + this.name();  // CUSTOMER → "ROLE_CUSTOMER"
    }
}
```

#### Complete Authentication Flow:

1. **Login**: User credentials → `AuthService.login()` → `JwtTokenProvider.generateToken()` → JWT returned
2. **Request**: Frontend sends `Authorization: Bearer <token>` header
3. **Filter**: `JwtAuthenticationFilter` extracts token, validates, loads UserDetails
4. **SecurityContext**: Authentication object set with authorities (ROLE_CUSTOMER, etc.)
5. **Authorization**: `SecurityConfig` checks `hasRole()` against authorities
6. **Controller**: `Authentication.getName()` returns email, `getAuthorities()` returns roles

---

## 📝 SUMMARY

### Key Security Points:
- **JWT Token**: Stateless authentication, contains email (subject) and role (claim)
- **HMAC-SHA256**: Token signed with secret key, prevents tampering
- **24-hour Expiration**: Tokens expire after 24 hours
- **Role-Based Access**: Spring Security `hasRole()` checks against authorities
- **CORS**: Configured for specific origins (localhost, EC2 IP)
- **Stateless**: No server-side sessions, all info in JWT token
- **Password Hashing**: BCrypt with Spring Security's `PasswordEncoder`

### Token Flow:
1. **Generate**: `JwtTokenProvider.generateToken(user)` → JWT string
2. **Store**: Frontend stores in `localStorage`
3. **Send**: Frontend sends in `Authorization: Bearer <token>` header
4. **Extract**: `JwtAuthenticationFilter` extracts from header
5. **Validate**: `JwtTokenProvider.validateToken(token)` → true/false
6. **Load User**: `CustomUserDetailsService.loadUserByUsername(email)`
7. **Set Context**: `SecurityContextHolder.setAuthentication()`
8. **Authorize**: `SecurityConfig` checks role via `hasRole()`

---

**This documentation covers the complete project structure, flows, and security implementation!** 🎯

