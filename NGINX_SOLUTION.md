# Nginx Konfigürasyonu - Thymeleaf + React Çözümü

## Problem
- Thymeleaf landing page `/` path'inde olmalı (Backend'den)
- React frontend `/login`, `/register`, `/dashboard` gibi path'lerde olmalı
- İkisi de aynı `/` path'inde çakışıyordu

## Çözüm: Nginx Konfigürasyonu

### EC2'de Nginx Config (`/etc/nginx/sites-available/baymak`):

```nginx
server {
    listen 80;
    server_name _;

    # Root path (/) → Backend'e proxy et (Thymeleaf landing page için)
    location = / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API endpoint'leri → Backend'e proxy et
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
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static resources (Backend'den gelen - baymak.png vs)
    location ~* ^/(baymak\.png|baymak-2\.jpg|neden-baymak.*\.png)$ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
    }

    # React frontend için - tüm diğer path'ler
    location / {
        root /var/www/html;  # veya /usr/share/nginx/html (Ubuntu'da genelde /var/www/html)
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # React static files (css, js, images) - cache için
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        root /var/www/html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
```

## React Router Güncellemesi

React Router'da `/` path'i Dashboard'a gidiyor. Bu Thymeleaf landing page ile çakışmaması için React Router'ı güncellemek gerekiyor.

### Seçenek 1: React Router'da `/` yerine `/dashboard` kullan

`src/App.jsx` dosyasında:
- `/` path'ini kaldır
- Dashboard'u `/dashboard` path'ine taşı
- Login sonrası `/dashboard`'a yönlendir

### Seçenek 2: React Router'ı olduğu gibi bırak (ÖNERİLEN)

Nginx'te React frontend path'leri doğru ayarlandığı için React Router'da değişiklik yapmaya gerek yok.
Sadece Login sonrası yönlendirmeyi kontrol et.

## Uygulama Adımları

### 1. Nginx Config'i Güncelle (EC2'de):

```bash
sudo nano /etc/nginx/sites-available/baymak
```

Yukarıdaki config'i yapıştır ve kaydet.

### 2. Nginx'i Test Et ve Restart Et:

```bash
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl status nginx
```

### 3. React Router'ı Güncelle (Opsiyonel - Eğer gerekirse):

Login sonrası navigate("/") yerine navigate("/dashboard") yapılabilir, ama Nginx doğru ayarlandığında gerek yok.

### 4. Test Et:

- `http://[EC2-IP]/` → Thymeleaf landing page görünmeli
- `http://[EC2-IP]/login` → React login page görünmeli
- `http://[EC2-IP]/register` → React register page görünmeli
- `http://[EC2-IP]/api/auth/login` → Backend API çalışmalı

