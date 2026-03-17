# Baymak Frontend

Baymak servis yonetimi icin gelistirilmis React tabanli web arayuzu.
Uygulama; giris/kayit, dashboard ve servis operasyonlarina yonelik temel modulleri icerir.

## Ozellikler

- JWT token ile giris ve korumali sayfa erisimi
- Randevu, cihaz, teknisyen, kullanici ve servis raporlari ekranlari
- Profil yonetimi
- Axios interceptor ile otomatik `Authorization` header yonetimi
- Yetki/auth hatalarinda merkezi API hata yakalama akisi

## Teknolojiler

- React 19
- React Router DOM 7
- Axios
- Vite
- ESLint

## Gereksinimler

- Node.js 18+
- npm 9+
- Calisan bir backend servisi (`http://localhost:8080`)

## Kurulum

```bash
npm install
```

## Calistirma

Gelisim ortami:

```bash
npm run dev
```

Uretim build:

```bash
npm run build
```

Build onizleme:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

## Route Yapisi

### Public

- `/login`
- `/register`
- `/forgot-password`

### Protected (`/dashboard`)

- `/dashboard`
- `/dashboard/appointments`
- `/dashboard/devices`
- `/dashboard/users`
- `/dashboard/technicians`
- `/dashboard/profile`
- `/dashboard/reports`

## API ve Kimlik Dogrulama

- API istemcisi `src/api/axiosClient.js` icinde tanimlidir.
- Varsayilan `baseURL`: `http://localhost:8080`
- Token, `localStorage` altinda `token` anahtari ile okunur ve tum isteklere `Bearer` olarak eklenir.
- `401` durumlarinda interceptor tarafinda yonlendirme/isleme kurallari uygulanir.

## Proje Yapisi

```text
src/
  api/
    axiosClient.js
  components/
    Layout.jsx
    ProtectedRoute.jsx
  pages/
    LoginPage.jsx
    RegisterPage.jsx
    ForgotPasswordPage.jsx
    DashboardPage.jsx
    AppointmentsPage.jsx
    DevicesPage.jsx
    UsersPage.jsx
    TechniciansPage.jsx
    ProfilePage.jsx
    ServiceReportsPage.jsx
  App.jsx
  main.jsx
```
