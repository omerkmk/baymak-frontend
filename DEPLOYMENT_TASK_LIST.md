# 🚀 Baymak Service Management System - Deployment Task List

## 📋 PROJE ÖZETİ

**Proje Adı:** Baymak Service Management System

**Teknolojiler:**
- **Backend:** Spring Boot 3.5.7, Java 17, MySQL 8.0, JWT Authentication
- **Frontend:** React 19.2.0, Vite 7.2.4, React Router 7.10.1
- **Database:** MySQL 8.0
- **Web Server:** Nginx (Reverse Proxy)

**Repository Yapısı:**
- Backend: Ayrı GitHub repository
- Frontend: Ayrı GitHub repository

**Deployment Hedefi:** AWS EC2 (All-in-One: Backend + Frontend + MySQL aynı instance'da)

---

## 🎯 DEPLOYMENT İÇİN YAPILMASI GEREKENLER

### ✅ BÖLÜM 1: AWS EC2 Instance Hazırlığı

#### 1.1 EC2 Instance Oluşturma
- [ ] AWS Console → EC2 → Launch Instance
- [ ] **Name:** `baymak-all-in-one`
- [ ] **AMI:** Amazon Linux 2023 AMI (veya Ubuntu 22.04 LTS)
- [ ] **Instance Type:** `t3.small` (minimum - MySQL + Backend + Frontend için yeterli RAM gerekli)
  - **Not:** `t2.micro` çok küçük, MySQL için yetersiz kalabilir
- [ ] **Key Pair:** Yeni oluştur → `baymak-key.pem` indir
- [ ] **Network Settings:**
  - SSH (22): My IP
  - HTTP (80): 0.0.0.0/0
  - HTTPS (443): 0.0.0.0/0
- [ ] **Storage:** 30 GB (MySQL için yeterli alan)
- [ ] Instance'ı başlat

#### 1.2 Elastic IP (Opsiyonel ama Önerilir)
- [ ] EC2 → Elastic IPs → Allocate Elastic IP
- [ ] Instance'a associate et
- [ ] IP adresini not et

---

### ✅ BÖLÜM 2: EC2'ye Bağlanma ve Yazılım Kurulumu

#### 2.1 SSH Bağlantısı (MacBook)
```bash
chmod 400 baymak-key.pem
ssh -i baymak-key.pem ec2-user@[EC2-IP-ADDRESS]
```

#### 2.2 Sistem Güncelleme
```bash
sudo yum update -y
```

#### 2.3 Java 17 Kurulumu
```bash
sudo yum install java-17-amazon-corretto -y
java -version  # Kontrol et
```

#### 2.4 Maven Kurulumu
```bash
sudo yum install maven -y
mvn -version  # Kontrol et
```

#### 2.5 Node.js 20 Kurulumu
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v  # Kontrol et
npm -v   # Kontrol et
```

#### 2.6 MySQL 8.0 Kurulumu
```bash
# MySQL repository ekle
sudo yum install -y https://dev.mysql.com/get/mysql80-community-release-el9-1.noarch.rpm

# MySQL kur
sudo yum install -y mysql-community-server

# MySQL başlat
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Geçici root şifresini al
sudo grep 'temporary password' /var/log/mysqld.log
```

#### 2.7 MySQL Güvenlik Ayarları
```bash
sudo mysql_secure_installation
# Sorulara cevap:
# - Yeni root şifresi belirle (güçlü bir şifre)
# - Remove anonymous users? Y
# - Disallow root login remotely? N (EC2'den erişim için)
# - Remove test database? Y
# - Reload privilege tables? Y
```

#### 2.8 MySQL Database ve User Oluşturma
```bash
mysql -u root -p
# (Root şifresini gir)
```

MySQL içinde:
```sql
CREATE DATABASE baymak;
CREATE USER 'baymak_user'@'localhost' IDENTIFIED BY 'GüçlüŞifre123!';
GRANT ALL PRIVILEGES ON baymak.* TO 'baymak_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 2.9 Nginx Kurulumu
```bash
sudo yum install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx  # Kontrol et
```

#### 2.10 Git Kurulumu
```bash
sudo yum install git -y
git --version  # Kontrol et
```

---

### ✅ BÖLÜM 3: GitHub SSH Key Ayarlama

#### 3.1 SSH Key Oluşturma (EC2'de)
```bash
ssh-keygen -t ed25519 -C "ec2-baymak"
# Enter'a bas (default location)
# Passphrase boş bırakabilirsiniz
```

#### 3.2 Public Key'i Kopyalama
```bash
cat ~/.ssh/id_ed25519.pub
# Çıkan key'i kopyala
```

#### 3.3 GitHub'a SSH Key Ekleme
- [ ] GitHub → Settings → SSH and GPG keys
- [ ] New SSH key
- [ ] Title: `EC2 Baymak Server`
- [ ] Key: Kopyaladığın public key'i yapıştır
- [ ] Add SSH key

#### 3.4 SSH Bağlantısını Test Etme
```bash
ssh -T git@github.com
# "Hi username! You've successfully authenticated..." mesajını görmelisin
```

---

### ✅ BÖLÜM 4: Backend Deployment

#### 4.1 Backend Repository Clone
```bash
cd ~
git clone git@github.com:[USERNAME]/[BACKEND-REPO-NAME].git baymak-backend
cd baymak-backend
```

#### 4.2 application.properties Güncelleme
```bash
nano src/main/resources/application.properties
```

**Mevcut içerik:**
```properties
spring.application.name=baymak-backend

spring.datasource.url=jdbc:mysql://localhost:3306/baymak?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=Kumek9496

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

server.port=8080

jwt.secret=MyVerySecureSecretKeyForJWTTokenGenerationMustBeAtLeast32BytesLongForHMACSHA256AlgorithmToWorkProperly
jwt.expiration=86400000
```

**Güncellenmiş içerik (EC2 için):**
```properties
spring.application.name=baymak-backend

# EC2'deki local MySQL kullan
spring.datasource.url=jdbc:mysql://localhost:3306/baymak?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=baymak_user
spring.datasource.password=GüçlüŞifre123!  # MySQL'de oluşturduğun şifre

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false  # Production'da false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

server.port=8080

jwt.secret=MyVerySecureSecretKeyForJWTTokenGenerationMustBeAtLeast32BytesLongForHMACSHA256AlgorithmToWorkProperly
jwt.expiration=86400000
```

**Kaydet:** `Ctrl+X`, `Y`, `Enter`

#### 4.3 Backend Build
```bash
mvn clean package -DskipTests
```

#### 4.4 Backend Test (Opsiyonel)
```bash
cd target
java -jar baymakbackend-0.0.1-SNAPSHOT.jar
# Ctrl+C ile durdur
```

#### 4.5 Systemd Service Oluşturma
```bash
sudo nano /etc/systemd/system/baymak-backend.service
```

**İçerik:**
```ini
[Unit]
Description=Baymak Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/baymak-backend/target
ExecStart=/usr/bin/java -jar /home/ec2-user/baymak-backend/target/baymakbackend-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Kaydet ve servisi başlat:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable baymak-backend
sudo systemctl start baymak-backend
sudo systemctl status baymak-backend  # Kontrol et
```

---

### ✅ BÖLÜM 5: Frontend Deployment

#### 5.1 Frontend Repository Clone
```bash
cd ~
git clone git@github.com:[USERNAME]/[FRONTEND-REPO-NAME].git baymak-frontend
cd baymak-frontend
```

#### 5.2 API Base URL Kontrolü
**Dosya:** `src/api/axiosClient.js`

**Mevcut içerik:**
```javascript
const axiosClient = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});
```

**Değişiklik GEREKMİYOR** - Nginx reverse proxy kullanacağız, bu değişmeyecek.

**VEYA production için otomatik domain kullanmak istersen:**
```javascript
const axiosClient = axios.create({
  baseURL: window.location.origin + "/api",  // Otomatik domain kullanır
  headers: {
    "Content-Type": "application/json",
  },
});
```

#### 5.3 Frontend Build
```bash
npm install
npm run build
```

#### 5.4 Build Dosyalarını Nginx'e Kopyalama
```bash
sudo rm -rf /usr/share/nginx/html/*
sudo cp -r dist/* /usr/share/nginx/html/
```

---

### ✅ BÖLÜM 6: Nginx Reverse Proxy Konfigürasyonu

#### 6.1 Nginx Config Dosyası Oluşturma
```bash
sudo nano /etc/nginx/conf.d/baymak.conf
```

**İçerik:**
```nginx
server {
    listen 80;
    server_name [EC2-IP-ADDRESS] [DOMAIN-IF-ANY];

    # Frontend static files
    root /usr/share/nginx/html;
    index index.html;

    # React Router için - tüm route'ları index.html'e yönlendir
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static resources (images, etc.) - cache için
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Kaydet:** `Ctrl+X`, `Y`, `Enter`

#### 6.2 Default Nginx Config'i Devre Dışı Bırakma
```bash
sudo rm /etc/nginx/conf.d/default.conf
# veya yedekle
sudo mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.backup
```

#### 6.3 Nginx Test ve Restart
```bash
sudo nginx -t  # Syntax kontrolü
sudo systemctl restart nginx
sudo systemctl status nginx  # Kontrol et
```

---

### ✅ BÖLÜM 7: Backend CORS Ayarları

#### 7.1 SecurityConfig.java Güncelleme
**Dosya:** `baymak-backend/src/main/java/com/baymak/backend/config/SecurityConfig.java`

**Mevcut CORS ayarları:**
```java
configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
```

**Güncellenmiş CORS ayarları:**
```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173",
    "http://localhost:3000",
    "http://[EC2-IP-ADDRESS]",  // EKLE
    "http://[EC2-IP-ADDRESS]:80"  // EKLE
));
```

**Komut:**
```bash
cd ~/baymak-backend
nano src/main/java/com/baymak/backend/config/SecurityConfig.java
# Yukarıdaki değişikliği yap
```

#### 7.2 Backend'i Yeniden Build ve Restart
```bash
mvn clean package -DskipTests
sudo systemctl restart baymak-backend
sudo systemctl status baymak-backend  # Kontrol et
```

---

### ✅ BÖLÜM 8: Static Files Kontrolü

#### 8.1 Backend Static Files (Thymeleaf Landing Page için)
**Klasör:** `baymak-backend/src/main/resources/static/`

**Gerekli dosyalar:**
- [ ] `baymak.png` ✅
- [ ] `neden-baymak-klima-tercih-etmelisinizz.png` ✅
- [ ] `baymak-2.jpg` ✅
- [ ] `10486447538226.png` ✅

**Not:** Bu dosyalar backend repo'da olmalı, build sırasında JAR'a dahil edilir.

#### 8.2 Frontend Static Files (React için)
**Klasör:** `baymak-frontend/public/`

**Gerekli dosyalar:**
- [ ] `baymak.png` ✅
- [ ] `neden-baymak-klima-tercih-etmelisinizz.png` ✅
- [ ] `baymak-2.jpg` ✅

**Not:** Bu dosyalar frontend repo'da olmalı, build sırasında `dist/` klasörüne kopyalanır.

---

### ✅ BÖLÜM 9: Test ve Doğrulama

#### 9.1 Servislerin Durumunu Kontrol Etme
```bash
# MySQL
sudo systemctl status mysqld

# Backend
sudo systemctl status baymak-backend

# Nginx
sudo systemctl status nginx
```

#### 9.2 Port Kontrolü
```bash
# MySQL (3306)
sudo netstat -tlnp | grep 3306

# Backend (8080)
sudo netstat -tlnp | grep 8080

# Nginx (80)
sudo netstat -tlnp | grep 80
```

#### 9.3 Tarayıcıda Test
- [ ] Frontend: `http://[EC2-IP-ADDRESS]` → Açılmalı
- [ ] Login sayfası görünmeli
- [ ] Register sayfası çalışmalı
- [ ] Login yapılabilmeli
- [ ] Dashboard açılmalı
- [ ] API çağrıları çalışmalı

#### 9.4 API Endpoint Test
```bash
# Backend health check (opsiyonel)
curl http://localhost:8080/api/auth/login

# Nginx üzerinden test
curl http://[EC2-IP-ADDRESS]/api/auth/login
```

#### 9.5 Log Kontrolü
```bash
# Backend logları
sudo journalctl -u baymak-backend -f

# Nginx error log
sudo tail -f /var/log/nginx/error.log

# Nginx access log
sudo tail -f /var/log/nginx/access.log

# MySQL log
sudo tail -f /var/log/mysqld.log
```

---

### ✅ BÖLÜM 10: Güvenlik Kontrolleri

#### 10.1 MySQL Remote Access Kontrolü
```bash
sudo nano /etc/my.cnf
# bind-address = 127.0.0.1 olduğundan emin ol (sadece localhost'tan erişim)
```

#### 10.2 Security Group Kontrolü
- [ ] SSH (22) sadece kendi IP'nizden açık mı?
- [ ] HTTP (80) herkese açık mı?
- [ ] HTTPS (443) herkese açık mı? (SSL sertifikası ekleyecekseniz)

#### 10.3 JWT Secret (Production için)
- [ ] Production'da JWT secret'ı değiştirilmeli
- [ ] Güçlü bir secret kullanılmalı (minimum 32 byte)

---

## 🔄 GÜNCELLEME İŞLEMLERİ (Deploy Sonrası)

### Backend Güncelleme:
```bash
cd ~/baymak-backend
git pull origin main
mvn clean package -DskipTests
sudo systemctl restart baymak-backend
```

### Frontend Güncelleme:
```bash
cd ~/baymak-frontend
git pull origin main
npm install
npm run build
sudo cp -r dist/* /usr/share/nginx/html/
sudo systemctl restart nginx
```

---

## 📝 ÖNEMLİ NOTLAR

### Proje Yapısı:
- **Backend Repo:** Spring Boot projesi, `baymak-backend1` klasörü içinde
- **Frontend Repo:** React projesi, root klasörde
- **İki ayrı GitHub repository**

### Database:
- **Development:** Local MySQL (localhost:3306)
- **Production (EC2):** EC2'de kurulu MySQL (localhost:3306)
- **Database Name:** `baymak`
- **User:** `baymak_user` (veya root)

### Port Yapısı:
- **80:** Nginx (Frontend + Backend proxy)
- **8080:** Spring Boot Backend (internal)
- **3306:** MySQL (internal, sadece localhost)

### API Yapısı:
- **Frontend → Backend:** `/api/*` endpoint'leri
- **Nginx:** `/api` isteklerini `http://localhost:8080`'e proxy eder
- **CORS:** Backend'de EC2 IP'si allowed origins'de olmalı

### Authentication:
- **JWT Token:** localStorage'da saklanır
- **Token Expiration:** 86400000 ms (24 saat)
- **Protected Routes:** Frontend'de `ProtectedRoute` component'i

### Role-Based Access:
- **CUSTOMER:** Devices, Appointments (own), Profile
- **TECHNICIAN:** Assigned Appointments, Service Reports, Profile
- **ADMIN:** Users, Technicians, All Appointments, Service Reports, Profile

---

## 🆘 SORUN GİDERME

### Backend başlamıyor:
```bash
sudo journalctl -u baymak-backend -n 50
# Hata mesajlarını kontrol et
```

### MySQL bağlantı hatası:
- MySQL çalışıyor mu? `sudo systemctl status mysqld`
- Database oluşturuldu mu? `mysql -u root -p` → `SHOW DATABASES;`
- Username/password doğru mu?

### Nginx 502 Bad Gateway:
- Backend çalışıyor mu? `sudo systemctl status baymak-backend`
- Port 8080 açık mı? `sudo netstat -tlnp | grep 8080`
- `proxy_pass http://localhost:8080` doğru mu?

### Frontend görünmüyor:
- Build dosyaları kopyalandı mı? `ls /usr/share/nginx/html/`
- Nginx çalışıyor mu? `sudo systemctl status nginx`
- Nginx config doğru mu? `sudo nginx -t`

### CORS hatası:
- Backend'de EC2 IP allowed origins'de mi?
- SecurityConfig.java güncellendi mi?
- Backend restart edildi mi?

---

## ✅ FINAL CHECKLIST

- [ ] EC2 instance oluşturuldu (t3.small+)
- [ ] Tüm yazılımlar kuruldu (Java, Maven, Node.js, MySQL, Nginx, Git)
- [ ] MySQL database ve user oluşturuldu
- [ ] GitHub SSH key eklendi
- [ ] Backend repo clone edildi
- [ ] Backend application.properties güncellendi (localhost MySQL)
- [ ] Backend build edildi
- [ ] Backend systemd service oluşturuldu ve başlatıldı
- [ ] Frontend repo clone edildi
- [ ] Frontend build edildi
- [ ] Frontend build dosyaları Nginx'e kopyalandı
- [ ] Nginx reverse proxy konfigüre edildi
- [ ] Backend CORS ayarları güncellendi
- [ ] Tüm servisler çalışıyor (MySQL, Backend, Nginx)
- [ ] Frontend tarayıcıda açılıyor
- [ ] Login/Register çalışıyor
- [ ] API çağrıları çalışıyor
- [ ] Database bağlantısı çalışıyor

---

## 📊 PROJE BİLGİLERİ

### Backend Endpoints:
- `/api/auth/login` - POST (Public)
- `/api/auth/register` - POST (Public)
- `/api/auth/reset-password` - POST (Public)
- `/api/users` - GET, POST (Admin)
- `/api/users/{id}` - GET, PUT, DELETE (Admin)
- `/api/technicians` - GET, POST (Admin)
- `/api/technicians/{id}` - GET, PUT, DELETE (Admin)
- `/api/devices/my` - GET (Customer)
- `/api/devices` - POST (Customer)
- `/api/devices/{id}` - GET, PUT, DELETE (Customer)
- `/api/appointments/my` - GET (Customer)
- `/api/appointments` - POST (Customer)
- `/api/appointments/assigned` - GET (Technician)
- `/api/appointments/all` - GET (Admin)
- `/api/appointments/{id}/status` - PUT (Technician)
- `/api/appointments/{id}/assign` - PUT (Admin)
- `/api/service-reports/my` - GET (Technician)
- `/api/service-reports` - POST (Technician)
- `/api/service-reports/all` - GET (Admin)

### Frontend Pages:
- `/login` - LoginPage
- `/register` - RegisterPage
- `/forgot-password` - ForgotPasswordPage
- `/` - DashboardPage (Role-based)
- `/appointments` - AppointmentsPage (Role-based)
- `/devices` - DevicesPage (Customer)
- `/users` - UsersPage (Admin)
- `/technicians` - TechniciansPage (Admin)
- `/reports` - ServiceReportsPage (Technician/Admin)
- `/profile` - ProfilePage (All roles)

### Dependencies:
**Backend:**
- Spring Boot 3.5.7
- Java 17
- MySQL Connector
- JWT (jjwt 0.12.3)
- Spring Security 6
- Thymeleaf

**Frontend:**
- React 19.2.0
- Vite 7.2.4
- React Router 7.10.1
- Axios 1.13.2

---

**Bu liste GPT'ye verilebilir ve deployment işlemini adım adım takip edebilir. 🚀**

