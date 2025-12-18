# Nginx Konfigürasyonu - Final Çözüm

## Özet
- `/` → Thymeleaf landing page (Backend'den)
- `/login`, `/register`, `/dashboard/*` → React frontend
- `/api/*` → Backend API

## EC2'de Nginx Config (`/etc/nginx/sites-available/baymak`):

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
        root /var/www/html;  # Ubuntu'da genelde /var/www/html, Amazon Linux'ta /usr/share/nginx/html
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

## Önemli Notlar:

1. **Ubuntu vs Amazon Linux:**
   - Ubuntu: Frontend dosyaları genelde `/var/www/html` klasöründe
   - Amazon Linux: Frontend dosyaları genelde `/usr/share/nginx/html` klasöründe
   - Hangi sistem kullanıyorsanız ona göre `root` path'ini ayarlayın

2. **Frontend Build Dosyalarının Konumu:**
   ```bash
   # Frontend build dosyalarının doğru yerde olduğundan emin olun
   ls -la /var/www/html/  # Ubuntu
   # veya
   ls -la /usr/share/nginx/html/  # Amazon Linux
   ```

3. **Backend Static Files:**
   - Backend'deki `/baymak.png` gibi static dosyalar Thymeleaf tarafından kullanılıyor
   - Bu dosyalar backend'de `src/main/resources/static/` klasöründe olmalı
   - Nginx'te bu path'leri backend'e proxy ediyoruz

## Uygulama:

```bash
# 1. Nginx config'i düzenle
sudo nano /etc/nginx/sites-available/baymak

# 2. Config'i test et
sudo nginx -t

# 3. Nginx'i restart et
sudo systemctl restart nginx

# 4. Durumu kontrol et
sudo systemctl status nginx
```

## Test:

- ✅ `http://[EC2-IP]/` → Thymeleaf landing page görünmeli
- ✅ `http://[EC2-IP]/login` → React login page görünmeli
- ✅ `http://[EC2-IP]/register` → React register page görünmeli
- ✅ `http://[EC2-IP]/dashboard` → React dashboard görünmeli (login sonrası)
- ✅ `http://[EC2-IP]/api/auth/login` → Backend API çalışmalı

