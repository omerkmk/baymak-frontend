# 🗺️ Baymak Frontend Development Roadmap

## ✅ TAMAMLANANLAR

### 1. Authentication & Authorization
- ✅ Login Page (`/login`) - Tamamlandı
- ✅ Register Page (`/register`) - Tamamlandı
- ✅ Protected Routes - Tamamlandı
- ✅ JWT Token Management - Tamamlandı
- ✅ Role-Based Menu (ADMIN, CUSTOMER, TECHNICIAN) - Tamamlandı

### 2. Devices Management
- ✅ DevicesPage (`/devices`) - Tamamlandı
  - ✅ List devices (`GET /api/devices/my`)
  - ✅ Add device (`POST /api/devices`)
  - ✅ Update device (`PUT /api/devices/{id}`)
  - ✅ Delete device (`DELETE /api/devices/{id}`)

---

## 📋 YAPILACAKLAR

### 🔴 YÜKSEK ÖNCELİK

#### 1. **AppointmentsPage** (`/appointments`) - KISMEN TAMAMLANMIŞ
**Mevcut Durum:** Sadece listeleme var, CRUD eksik

**Yapılacaklar:**
- [ ] **Customer için:**
  - [ ] Randevu oluşturma formu (`POST /api/appointments`)
    - Device dropdown (kullanıcının cihazlarından seçim)
    - Tarih seçici (date picker)
    - Saat seçici (time picker)
  - [ ] Randevu iptal etme (`PUT /api/appointments/my/{id}/cancel`)
  - [ ] Randevu detayı görüntüleme (`GET /api/appointments/my/{id}`)
  - [ ] Mevcut listeleme iyileştirme (daha detaylı bilgiler)

- [ ] **Technician için:**
  - [ ] Atanan randevuları listeleme (`GET /api/appointments/assigned`)
  - [ ] Randevu durumu güncelleme (`PUT /api/appointments/{id}/status`)
    - PENDING → IN_PROGRESS → COMPLETED
  - [ ] Randevu detayı görüntüleme

- [ ] **Admin için:**
  - [ ] Tüm randevuları listeleme (`GET /api/appointments/all`)
  - [ ] Teknisyen atama (`PUT /api/appointments/{id}/assign`)
  - [ ] Duruma göre filtreleme (`GET /api/appointments/status/{status}`)
  - [ ] Randevu yönetimi (görüntüleme, düzenleme)

**Backend Endpoints:**
```
POST   /api/appointments                    (Customer - Randevu oluştur)
GET    /api/appointments/my                 (Customer - Kendi randevularım)
GET    /api/appointments/my/{id}           (Customer - Randevu detayı)
PUT    /api/appointments/my/{id}/cancel     (Customer - Randevu iptal)
GET    /api/appointments/assigned           (Technician - Atanan randevular)
PUT    /api/appointments/{id}/status        (Technician - Durum güncelle)
GET    /api/appointments/all              (Admin - Tüm randevular)
PUT    /api/appointments/{id}/assign       (Admin - Teknisyen ata)
GET    /api/appointments/status/{status}   (Admin - Duruma göre filtrele)
```

**DTO:**
- `AppointmentRequestDto`: `deviceId`, `date`, `time`
- `AppointmentResponseDto`: `id`, `customerName`, `deviceId`, `date`, `time`, `status`, `technicianName`, etc.
- `AppointmentStatusUpdateDto`: `status` (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- `AppointmentAssignDto`: `technicianId`

---

#### 2. **DashboardPage** (`/`) - BOŞ
**Mevcut Durum:** Sadece placeholder var

**Yapılacaklar:**
- [ ] **Customer Dashboard:**
  - [ ] Toplam cihaz sayısı
  - [ ] Aktif randevu sayısı
  - [ ] Son eklenen cihazlar (5 adet)
  - [ ] Yaklaşan randevular (5 adet)
  - [ ] İstatistikler (grafikler - opsiyonel)

- [ ] **Technician Dashboard:**
  - [ ] Atanan randevu sayısı (bugün/yarın/gelecek)
  - [ ] Tamamlanan randevu sayısı (bu ay)
  - [ ] Bekleyen randevular listesi
  - [ ] Son servis raporları

- [ ] **Admin Dashboard:**
  - [ ] Toplam kullanıcı sayısı
  - [ ] Toplam teknisyen sayısı
  - [ ] Toplam randevu sayısı (durum bazlı)
  - [ ] Son eklenen kullanıcılar
  - [ ] Bekleyen randevular (teknisyen atanmamış)
  - [ ] İstatistikler ve grafikler

**Backend Endpoints:**
- Mevcut endpoint'ler kullanılacak (aggregate data frontend'de hesaplanabilir)
- Veya yeni dashboard endpoint'leri eklenebilir (opsiyonel)

---

#### 3. **ProfilePage** (`/profile`) - BOŞ
**Mevcut Durum:** Sadece placeholder var

**Yapılacaklar:**
- [ ] Kullanıcı bilgilerini görüntüleme
  - [ ] İsim, Email, Telefon, Adres
  - [ ] Role bilgisi
- [ ] Profil bilgilerini güncelleme
  - [ ] Form ile düzenleme
  - [ ] Şifre değiştirme (opsiyonel - backend'de endpoint yoksa eklenmeli)
- [ ] Kullanıcı istatistikleri
  - [ ] Toplam cihaz sayısı
  - [ ] Toplam randevu sayısı
  - [ ] Son aktiviteler

**Backend Endpoints:**
- Kullanıcı bilgileri için mevcut endpoint'ler kullanılabilir
- Güncelleme için `PUT /api/users/{id}` kullanılabilir (kendi ID'si)

---

### 🟡 ORTA ÖNCELİK

#### 4. **UsersPage** (`/users`) - BOŞ (Sadece Admin)
**Mevcut Durum:** Sadece placeholder var

**Yapılacaklar:**
- [ ] Tüm kullanıcıları listeleme (`GET /api/users`)
- [ ] Kullanıcı detayı görüntüleme (`GET /api/users/{id}`)
- [ ] Yeni kullanıcı oluşturma (`POST /api/users`)
- [ ] Kullanıcı güncelleme (`PUT /api/users/{id}`)
- [ ] Kullanıcı silme (`DELETE /api/users/{id}`)
- [ ] Arama ve filtreleme (opsiyonel)

**Backend Endpoints:**
```
GET    /api/users          (Tüm kullanıcılar)
GET    /api/users/{id}     (Kullanıcı detayı)
POST   /api/users          (Yeni kullanıcı)
PUT    /api/users/{id}     (Kullanıcı güncelle)
DELETE /api/users/{id}     (Kullanıcı sil)
```

**DTO:**
- `UserRequestDto`: `name`, `email`, `phone`, `address`, `password`
- `UserResponseDto`: `id`, `name`, `email`, `phone`, `address`, `role`

---

#### 5. **TechniciansPage** (`/technicians`) - BOŞ (Sadece Admin)
**Mevcut Durum:** Sadece placeholder var

**Yapılacaklar:**
- [ ] Tüm teknisyenleri listeleme (`GET /api/technicians`)
- [ ] Teknisyen detayı görüntüleme (`GET /api/technicians/{id}`)
- [ ] Yeni teknisyen oluşturma (`POST /api/technicians`)
- [ ] Teknisyen güncelleme (`PUT /api/technicians/{id}`)
- [ ] Teknisyen silme (`DELETE /api/technicians/{id}`)
- [ ] Teknisyen istatistikleri (randevu sayıları, tamamlanan işler)

**Backend Endpoints:**
```
GET    /api/technicians          (Tüm teknisyenler)
GET    /api/technicians/{id}     (Teknisyen detayı)
POST   /api/technicians          (Yeni teknisyen)
PUT    /api/technicians/{id}     (Teknisyen güncelle)
DELETE /api/technicians/{id}     (Teknisyen sil)
```

**DTO:**
- `TechnicianRequestDto`: `name`, `email`, `phone`, `specialization`
- `TechnicianResponseDto`: `id`, `name`, `email`, `phone`, `specialization`

---

#### 6. **Service Reports Page** (`/reports`) - YOK (Sadece Technician)
**Mevcut Durum:** Route yok, sayfa yok

**Yapılacaklar:**
- [ ] Route ekleme (`/reports` - Layout.jsx'te zaten var)
- [ ] Servis raporlarını listeleme (`GET /api/service-reports/my`)
- [ ] Yeni servis raporu oluşturma (`POST /api/service-reports`)
  - Randevu seçimi (tamamlanmış randevular)
  - Rapor detayları (açıklama, yapılan işler, kullanılan parçalar)
- [ ] Servis raporu detayı görüntüleme (`GET /api/service-reports/{id}`)
- [ ] Randevuya ait rapor görüntüleme (`GET /api/service-reports/appointment/{appointmentId}`)

**Backend Endpoints:**
```
POST   /api/service-reports                    (Rapor oluştur)
GET    /api/service-reports/my                (Kendi raporlarım)
GET    /api/service-reports/{id}              (Rapor detayı)
GET    /api/service-reports/appointment/{id}  (Randevuya ait rapor)
```

**DTO:**
- `ServiceReportRequestDto`: `appointmentId`, `description`, `workPerformed`, `partsUsed`
- `ServiceReportResponseDto`: `id`, `appointmentId`, `technicianName`, `description`, `workPerformed`, `partsUsed`, `createdAt`

---

### 🟢 DÜŞÜK ÖNCELİK / OPSİYONEL

#### 7. **Service Requests Page** (`/service-requests`) - YOK
**Mevcut Durum:** Route yok, sayfa yok

**Not:** Backend'de ServiceRequest endpoint'leri var ama frontend'de kullanılmıyor. 
Eğer ihtiyaç varsa eklenebilir.

**Yapılacaklar (opsiyonel):**
- [ ] Servis talebi oluşturma (`POST /api/requests`)
- [ ] Kendi servis taleplerimi listeleme (`GET /api/requests/my`)
- [ ] Servis talebi detayı (`GET /api/requests/{id}`)
- [ ] Servis talebi durumu güncelleme (`PUT /api/requests/{id}/status`)
- [ ] Servis talebi silme (`DELETE /api/requests/{id}`)

---

#### 8. **UI/UX İyileştirmeleri**
- [ ] Loading states (spinner, skeleton)
- [ ] Error handling (toast notifications)
- [ ] Form validations (client-side)
- [ ] Responsive design (mobile uyumluluk)
- [ ] Dark mode (opsiyonel)
- [ ] Animations & transitions
- [ ] Date/Time picker components
- [ ] Modal components (reusable)

---

#### 9. **Teknik İyileştirmeler**
- [ ] State management (Context API veya Redux - opsiyonel)
- [ ] Custom hooks (useAuth, useDevices, etc.)
- [ ] Error boundary components
- [ ] Code splitting & lazy loading
- [ ] Unit tests (opsiyonel)
- [ ] E2E tests (opsiyonel)

---

## 📊 ÖNCELİK SIRASI

1. **AppointmentsPage** - En kritik, kullanıcıların randevu oluşturması gerekiyor
2. **DashboardPage** - Kullanıcı deneyimi için önemli
3. **ProfilePage** - Kullanıcıların bilgilerini görmesi/güncellemesi
4. **UsersPage** - Admin için gerekli
5. **TechniciansPage** - Admin için gerekli
6. **Service Reports Page** - Technician için gerekli
7. **Service Requests** - Opsiyonel
8. **UI/UX İyileştirmeleri** - Sürekli geliştirme

---

## 🎯 HEDEF TAMAMLAMA SIRASI

### Faz 1: Temel Fonksiyonellik (1-2 hafta)
- ✅ Login/Register
- ✅ Devices CRUD
- 🔄 AppointmentsPage (Customer + Technician + Admin)
- 🔄 DashboardPage (tüm roller için)

### Faz 2: Yönetim Panelleri (1 hafta)
- 🔄 ProfilePage
- 🔄 UsersPage (Admin)
- 🔄 TechniciansPage (Admin)

### Faz 3: Teknisyen Özellikleri (1 hafta)
- 🔄 Service Reports Page

### Faz 4: İyileştirmeler (Sürekli)
- 🔄 UI/UX iyileştirmeleri
- 🔄 Teknik iyileştirmeler

---

## 📝 NOTLAR

- Tüm sayfalar Türkçe olacak (login/register hariç - İngilizce)
- Role-based access control zaten mevcut
- JWT token yönetimi zaten mevcut
- Backend endpoint'leri hazır, sadece frontend entegrasyonu yapılacak
- Responsive design önemli (mobile-first yaklaşım önerilir)

