# 🚀 AWS EC2 - Tüm Servisleri Tek Instance'da Deploy (All-in-One)

## 📋 Genel Bakış

Bu rehber, **Backend + Frontend + MySQL Database**'i **tek bir EC2 instance**'da çalıştırmak için adım adım talimatlar içerir.

**Mimari:**
- **EC2 Instance:** Backend (Spring Boot) + Frontend (React Build) + MySQL + Nginx
- **Tek IP/Port:** Nginx reverse proxy ile tüm servisler 80 portundan erişilebilir

---

## 📦 BÖLÜM 1: AWS EC2 Instance Oluşturma

### Adım 1.1: EC2 Instance
1. AWS Console → **EC2** → **Launch Instance**
2. **Name:** `baymak-all-in-one`
3. **AMI:** Amazon Linux 2023 AMI (veya Ubuntu 22.04 LTS)
4. **Instance type:** `t3.small` (minimum - MySQL için yeterli RAM gerekli)
   - **Not:** `t2.micro` çok küçük olabilir, MySQL + Backend + Frontend için
5. **Key pair:** Create new → `baymak-key.pem` (indirin)
6. **Network settings:**
   - Allow SSH (22): **My IP**
   - Allow HTTP (80): **0.0.0.0/0**
   - Allow HTTPS (443): **0.0.0.0/0**
7. **Storage:** 30 GB (MySQL için yeterli alan)
8. **Launch instance**

### Adım 1.2: Elastic IP (Önerilir)
1. EC2 → **Elastic IPs** → **Allocate Elastic IP**
2. **Associate** → `baymak-all-in-one` instance'ı seçin
3. IP adresini not edin

---

## 💻 BÖLÜM 2: EC2'ye SSH ile Bağlanma

```bash
chmod 400 baymak-key.pem
ssh -i baymak-key.pem ec2-user@[EC2-IP]
```

---

## 🔧 BÖLÜM 3: Yazılım Kurulumu

### Adım 3.1: Sistem Güncelleme
```bash
sudo yum update -y
```

### Adım 3.2: Java 17
```bash
sudo yum install java-17-amazon-corretto -y
java -version
```

### Adım 3.3: Maven
```bash
sudo yum install maven -y
mvn -version
```

### Adım 3.4: Node.js 20
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v
npm -v
```

### Adım 3.5: MySQL 8.0
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

### Adım 3.6: MySQL Güvenlik Ayarları
```bash
sudo mysql_secure_installation
# Sorulara cevap verin:
# - Yeni root şifresi belirleyin
# - Remove anonymous users? Y
# - Disallow root login remotely? N (EC2'den erişim için)
# - Remove test database? Y
# - Reload privilege tables? Y
```

### Adım 3.7: MySQL Database Oluşturma
```bash
mysql -u root -p
```

MySQL'de:
```sql
CREATE DATABASE baymak;
CREATE USER 'baymak_user'@'localhost' IDENTIFIED BY 'GüçlüŞifre123!';
GRANT ALL PRIVILEGES ON baymak.* TO 'baymak_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Adım 3.8: Nginx
```bash
sudo yum install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Adım 3.9: Git
```bash
sudo yum install git -y
```

---

## 🔐 BÖLÜM 4: GitHub SSH Key Ayarlama

```bash
ssh-keygen -t ed25519 -C "ec2-baymak"
cat ~/.ssh/id_ed25519.pub
# Public key'i kopyalayın ve GitHub'a ekleyin
ssh -T git@github.com
```

---

## 📥 BÖLÜM 5: Backend Deploy

### Adım 5.1: Backend Repository Clone
```bash
cd ~
git clone git@github.com:[USERNAME]/[BACKEND-REPO].git baymak-backend
cd baymak-backend
```

### Adım 5.2: application.properties Güncelleme
```bash
nano src/main/resources/application.properties
```

**İçeriği güncelleyin:**
```properties
spring.application.name=baymak-backend

# Local MySQL (EC2'de)
spring.datasource.url=jdbc:mysql://localhost:3306/baymak?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=baymak_user
spring.datasource.password=GüçlüŞifre123!

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

server.port=8080

jwt.secret=MyVerySecureSecretKeyForJWTTokenGenerationMustBeAtLeast32BytesLongForHMACSHA256AlgorithmToWorkProperly
jwt.expiration=86400000
```

### Adım 5.3: Backend Build
```bash
mvn clean package -DskipTests
```

### Adım 5.4: Systemd Service
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

**Servisi başlat:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable baymak-backend
sudo systemctl start baymak-backend
sudo systemctl status baymak-backend
```

---

## 🎨 BÖLÜM 6: Frontend Deploy

### Adım 6.1: Frontend Repository Clone
```bash
cd ~
git clone git@github.com:[USERNAME]/[FRONTEND-REPO].git baymak-frontend
cd baymak-frontend
```

### Adım 6.2: API Base URL Güncelleme
```bash
nano src/api/axiosClient.js
```

**Güncelleyin:**
```javascript
const axiosClient = axios.create({
  baseURL: "http://localhost:8080",  // Nginx proxy kullanacağız, bu değişmeyecek
  headers: {
    "Content-Type": "application/json",
  },
});
```

**VEYA production için:**
```javascript
const axiosClient = axios.create({
  baseURL: window.location.origin + "/api",  // Otomatik domain kullanır
  headers: {
    "Content-Type": "application/json",
  },
});
```

### Adım 6.3: Frontend Build
```bash
npm install
npm run build
```

### Adım 6.4: Build Dosyalarını Nginx'e Kopyalama
```bash
sudo rm -rf /usr/share/nginx/html/*
sudo cp -r dist/* /usr/share/nginx/html/
```

---

## 🌐 BÖLÜM 7: Nginx Konfigürasyonu (Reverse Proxy)

### Adım 7.1: Nginx Config
```bash
sudo nano /etc/nginx/conf.d/baymak.conf
```

**İçerik:**
```nginx
server {
    listen 80;
    server_name [EC2-IP] [DOMAIN-IF-ANY];

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
        
        # CORS headers (gerekirse)
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
    }

    # Static resources (images, etc.)
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Adım 7.2: Default Nginx Config'i Kaldırma
```bash
sudo rm /etc/nginx/conf.d/default.conf
# veya
sudo mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.backup
```

### Adım 7.3: Nginx Test ve Restart
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl status nginx
```

---

## 🔄 BÖLÜM 8: Backend CORS Ayarları

### Adım 8.1: SecurityConfig.java Güncelleme
```bash
cd ~/baymak-backend
nano src/main/java/com/baymak/backend/config/SecurityConfig.java
```

**CORS allowedOrigins'e EC2 IP'yi ekleyin:**
```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173",
    "http://localhost:3000",
    "http://[EC2-IP]",  // EKLE
    "http://[EC2-IP]:80"  // EKLE
));
```

### Adım 8.2: Backend Restart
```bash
mvn clean package -DskipTests
sudo systemctl restart baymak-backend
```

---

## ✅ BÖLÜM 9: Test ve Kontrol

### Adım 9.1: Servislerin Durumu
```bash
# MySQL
sudo systemctl status mysqld

# Backend
sudo systemctl status baymak-backend

# Nginx
sudo systemctl status nginx
```

### Adım 9.2: Port Kontrolü
```bash
# MySQL (3306)
sudo netstat -tlnp | grep 3306

# Backend (8080)
sudo netstat -tlnp | grep 8080

# Nginx (80)
sudo netstat -tlnp | grep 80
```

### Adım 9.3: Tarayıcıda Test
- **Frontend:** `http://[EC2-IP]`
- **Backend API:** `http://[EC2-IP]/api/auth/login` (test endpoint)

### Adım 9.4: Log Kontrolü
```bash
# Backend logları
sudo journalctl -u baymak-backend -f

# Nginx error log
sudo tail -f /var/log/nginx/error.log

# MySQL log
sudo tail -f /var/log/mysqld.log
```

---

## 🔄 BÖLÜM 10: Güncelleme İşlemi

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

## 🔒 BÖLÜM 11: Güvenlik Notları

### 1. MySQL Güvenliği
```bash
# Sadece localhost'tan erişime izin ver (zaten öyle)
# Remote access istemiyorsanız bind-address kontrol edin:
sudo nano /etc/my.cnf
# bind-address = 127.0.0.1 olduğundan emin olun
```

### 2. Firewall (Opsiyonel)
```bash
# EC2 Security Group yeterli, ama ekstra güvenlik için:
sudo yum install firewalld -y
sudo systemctl start firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. Database Backup
```bash
# Otomatik backup script oluşturun
sudo nano /home/ec2-user/backup-db.sh
```

**İçerik:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u baymak_user -p'GüçlüŞifre123!' baymak > /home/ec2-user/backups/baymak_$DATE.sql
# Eski backup'ları sil (30 günden eski)
find /home/ec2-user/backups -name "*.sql" -mtime +30 -delete
```

**Cron job ekleyin:**
```bash
mkdir -p /home/ec2-user/backups
chmod +x /home/ec2-user/backup-db.sh
crontab -e
# Her gün saat 02:00'de backup al
0 2 * * * /home/ec2-user/backup-db.sh
```

---

## 📊 BÖLÜM 12: Kaynak Kullanımı İzleme

### CPU ve Memory Kontrolü
```bash
htop
# veya
top
```

### Disk Kullanımı
```bash
df -h
```

### MySQL Performans
```bash
mysql -u root -p
SHOW PROCESSLIST;
SHOW STATUS;
```

---

## ⚠️ ÖNEMLİ NOTLAR

### Avantajlar:
✅ Tek instance - daha ucuz (~$15-25/ay)
✅ Basit yapı - kolay yönetim
✅ Hızlı deployment

### Dezavantajlar:
⚠️ Tek nokta arıza riski
⚠️ Kaynak paylaşımı (CPU, RAM)
⚠️ Ölçeklenebilirlik sınırlı
⚠️ Backup stratejisi gerekli

### Öneriler:
- **Production için:** RDS kullanın (daha güvenli)
- **Test/Development için:** Bu yapı uygun
- **Backup:** Düzenli database backup alın
- **Monitoring:** CloudWatch ile izleyin

---

## 🆘 Sorun Giderme

### MySQL başlamıyor:
```bash
sudo systemctl status mysqld
sudo journalctl -u mysqld -n 50
```

### Backend başlamıyor:
```bash
sudo journalctl -u baymak-backend -n 50
# Port 8080 kullanımda mı kontrol edin
sudo lsof -i :8080
```

### Nginx 502 Bad Gateway:
- Backend çalışıyor mu kontrol edin
- `proxy_pass http://localhost:8080` doğru mu?

### Database bağlantı hatası:
- MySQL çalışıyor mu?
- Username/password doğru mu?
- Database oluşturuldu mu?

---

## 📝 Hızlı Kontrol Listesi

- [ ] EC2 instance oluşturuldu (t3.small veya daha büyük)
- [ ] SSH bağlantısı test edildi
- [ ] Java 17, Maven, Node.js, MySQL, Nginx kuruldu
- [ ] MySQL database ve user oluşturuldu
- [ ] GitHub SSH key eklendi
- [ ] Backend repo clone edildi
- [ ] application.properties güncellendi (localhost MySQL)
- [ ] Backend build edildi ve servis başlatıldı
- [ ] Frontend repo clone edildi
- [ ] Frontend build edildi
- [ ] Nginx konfigüre edildi (reverse proxy)
- [ ] Tüm servisler çalışıyor
- [ ] Test edildi

---

## 💰 Tahmini Maliyet

- **EC2 t3.small:** ~$15-20/ay
- **Elastic IP:** Ücretsiz (instance çalışırken)
- **Data Transfer:** ~$1-5/ay
- **Toplam:** ~$16-25/ay

**RDS kullanırsanız:** +$15-20/ay (toplam ~$31-45/ay)

---

**All-in-One deployment başarılar! 🚀**

