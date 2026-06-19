# SITERNAK - Pengembangan Ternak Rakyat

Sistem Informasi Pengembangan Ternak Rakyat. Aplikasi frontend
enterprise-grade untuk pendataan, monitoring, dan pembinaan peternak
ayam (pedaging & petelur) nasional. Dibangun dengan Next.js 14,
Mantine UI 7, dan arsitektur siap-colok ke backend REST apapun.

---

## Daftar Isi

- Stack & Arsitektur
- Quick Start
- Demo & Kredensial
- Struktur Direktori
- Skema Data (Domain)
- Routing & Halaman
- Komponen UI
- Store & State Management
- Tema & Dark Mode
- Onboarding & Command Palette
- Export Excel/CSV & Print PDF
- Migrasi ke Backend
- Fase 6: Polish & Production
- Catatan Migrasi Backend

---

## Stack & Arsitektur

- Framework: Next.js 14.2 (App Router) + TypeScript
- UI: Mantine 7 (core, dates, dropzone, notifications, spotlight)
- State: Zustand + persist (localStorage siternak-ternak v2)
- Data layer: TanStack Query v5 (region endpoint) + axios client siap-colok
- Map: Leaflet via react-leaflet (dynamic import, no SSR)
- Export: xlsx (SheetJS Community Edition) + custom CSV (RFC 4180)
- Icon: @tabler/icons-react (~300 icon)
- Font: Inter (Google Fonts)
- Theme: Deep teal/green #13bc6d, light + dark mode
- Bahasa: 100% Bahasa Indonesia

Mock backend via Zustand + localStorage. Real backend diaktifkan
dengan NEXT_PUBLIC_DOMAIN_API=https://... - semua call otomatis
switch ke axios.

---

## Quick Start

    cd "C:\Users\JunRis\webProjects\arcson\pengembangan-ternak-rakyat"
    npm install --legacy-peer-deps
    npm run dev

Buka http://localhost:6091. Login dengan admin / admin123.

Build production:

    npm run build
    npm start

---

## Demo & Kredensial

- Username: admin
- Password: admin123

Session disimpan di cookie siternak-session. Logout akan menghapus
cookie + cache TanStack Query.

---

## Struktur Direktori

    app/
      page.tsx                      # Landing (auto-redirect kalau session ada)
      login/                        # Split-pane login
      pendaftaran/                  # Wizard 5-step
      dashboard/
        layout.tsx                  # AppShell + Sidebar + Topbar + BottomNav
        page.tsx                    # Overview (stat cards, charts)
        peternak/                   # List + detail + print
        kandang/                    # List + detail per peternak
        laporan/                    # Excel export + bulk import
        aktivitas/                  # Activity feed
        pengaturan/                 # Theme, notif, sound
        bantuan/                    # FAQ
    components/
      layout/                       # AppShell, Sidebar, Topbar, MobileBottomNav
      ui/                           # StatCard, SectionCard, EmptyState, dll
      wizard/                       # StepIdentitas, StepKandang, StepReview
      charts/                       # KomposisiChart, TrendChart
      map/                          # MapPicker (Leaflet)
      provider/                     # AppProviders, ThemeController
      onboarding/                   # 6-step tour
      skeletons/                    # Dashboard, List, Detail
    hooks/
      useTernakRakyat/              # Store + types + queries
      useTheme/                     # Theme store
      useNotifier/                  # Sound + browser notification
    lib/
      api/                          # Axios client + endpoints
      auth/                         # Session helpers
      export/                       # Excel/CSV/Import utilities
    theme.ts                        # Mantine theme
    middleware.ts                   # Auth guard

---

## Skema Data (Domain)

Lihat hooks/useTernakRakyat/types.ts untuk definisi lengkap.

    Peternak {
      id, createdAt, nama, noKtp,
      ktp: PhotoRef,           // { preview: string|null, name?, size? }
      alamat: { provinsi, kabupaten, kecamatan, kelurahan, detail },
      kategori: "ayam_pedaging" | "ayam_petelur" | "",
      kandang: Kandang[]
    }

    Kandang {
      id, nama,
      lokasi: { lat, lng, alamat },
      kapasitas: "<2500" | "2500-5000" | ">5000" | "",
      kondisi: {
        dinding: { kondisi, foto },
        atap:    { kondisi, foto },
        lantai:  { kondisi, foto }
      },
      peralatan: {
        tempatMinum: { kondisi, foto },
        tempatMakan: { kondisi, foto },
        brooding:    { kondisi, foto },
        kipas:       { kondisi, foto }
      },
      statusOperasional: "operasi" | "berhenti" | "",
      jumlahAyam, jenisUsaha, kemitraan
    }

Kemitraan (hardcoded untuk saat ini, backend belum tersedia):

- charoen_phokphan - Charoen Phokphan
- japfa_comfeed - Japfa Comfeed
- ciomas_adistawa - Ciomas Adistawa
- sierad - Sierad
- malindo_feedmill - Malindo Feedmill
- mitra_mahkita - Mitra Mahkita
- sreeya_sewu - Sreeya Sewu
- mitra_mahkota_buana - Mitra Mahkota Buana (MMB)
- super_unggas_jaya - Super Unggas Jaya

---

## Routing & Halaman

- /                    - Landing page (auto redirect ke /dashboard kalau login)
- /login               - Split-pane login
- /pendaftaran         - Wizard 5-step
- /pendaftaran?edit=:id - Edit mode (prefill dari existing)
- /dashboard           - Overview
- /dashboard/peternak  - List + filter
- /dashboard/peternak/:id         - Detail (tabs: Identitas, Kandang, Dokumen, Timeline)
- /dashboard/peternak/:id/print   - Print-friendly view
- /dashboard/laporan   - Export Excel/CSV + bulk import
- /dashboard/pengaturan - Theme, notif, sound
- /dashboard/bantuan   - FAQ

---

## Komponen UI

- StatCard        - stat dengan icon + trend
- SectionCard     - grouped section dengan icon + title
- EmptyState      - empty placeholder dengan CTA
- PageHeader      - responsive title + breadcrumb
- BulkActionBar   - floating bulk operation bar
- PhotoLightbox   - fullscreen photo carousel
- PhotoThumb      - clickable thumbnail
- ConditionBar    - colored bar (Baik/Sedang/Rusak)
- FileUploadCard  - drag-drop upload
- MapPicker       - Leaflet map dengan click-to-pin
- GpsPicker       - GPS coords + alamat text

---

## Store & State Management

Zustand store di hooks/useTernakRakyat/store/ternakStore.ts:

    useTernakStore.getState() === {
      list: Peternak[],
      add(p), update(id, p), remove(id),
      addMany(items), removeMany(ids),
      reset()
    }

Persist middleware dengan key siternak-ternak v2. Hydration check
ada di useHydrated() untuk hindari SSR mismatch.

Helpers (read-only) di hooks/useTernakRakyat/index.ts:
usePeternakList, usePeternakById, useKandangById.

---

## Tema & Dark Mode

- Theme store: useThemeStore (mode: light/dark/auto)
- ThemeController mirror ke data-mantine-color-scheme attr
- DefaultColorScheme: light
- Primary color: #13bc6d (deep teal-green)
- Toggle dari Sidebar footer atau Settings

---

## Onboarding & Command Palette

- 6-step onboarding tour (OnboardingTour.tsx) untuk user baru
  - skip-able, flag di localStorage[siternak-onboarding-done]
- Command palette (Ctrl+K / Cmd+K) - SpotlightProvider:
  - Navigate ke semua route
  - Quick action: tambah peternak, export, dll
  - Recent items

---

## Export Excel/CSV & Print PDF

- lib/export/excel.ts - Workbook builder (multi-sheet support)
  - buildPeternakWorkbook(items, options)
  - buildKandangWorkbook(items, options)
  - buildSinglePeternakWorkbook(p)
- lib/export/csv.ts - CSV dengan RFC 4180 escaping + UTF-8 BOM
- lib/export/import.ts - Parser Excel untuk bulk import
- Print PDF: route /dashboard/peternak/:id/print (print-friendly)
  - @media print CSS di globals.css

---

## Migrasi ke Backend

Saat backend siap:

1. Set NEXT_PUBLIC_DOMAIN_API=https://api.example.com di .env.local
2. Semua call otomatis via axios (lihat lib/api/endpoints.ts)
3. Session: ganti siternak-session cookie dengan HttpOnly + signed

Contract endpoint yang diharapkan:

- POST /auth/login
- GET /region/provinsi, /kabupaten, /kecamatan, /kelurahan
- GET /master/kemitraan
- GET /peternak (paginated)
- POST /peternak / GET /peternak/:id / DELETE /peternak/:id
- POST /peternak/bulk (untuk bulk import)

---

## Fase 6: Polish & Production-Ready (v1.1.0)

Setelah MVP, aplikasi melalui fase polish besar yang menambahkan
fitur production-grade tanpa menyentuh kontrak data mock.

### 6.1 Notification system (Web Audio + Browser API)

Dua layer notifikasi yang bisa dikonfigurasi user dari Settings:

- Web Audio API beep - tiga preset: success (naik 2 nada),
  error (turun 2 nada), info (single tone)
- Browser Notification API - permission di-request sekali

API publik (hooks/useNotifier):

    const { playSound, notify, isMuted, permission, requestPermission } = useNotifier();
    playSound("success");
    notify({ title: "...", body: "...", kind: "success" });

State di-persist di localStorage[siternak-notifier].

### 6.2 Mobile responsive

- Bottom nav (MobileBottomNav) - muncul di breakpoint < md
- Header - version badge hidden di mobile
- Page headers - responsive font size + wrap
- StatCard - responsive column count

### 6.3 Bulk operations

BulkActionBar (floating bottom) muncul otomatis ketika user
memilih >= 1 row:

- Hapus massal - single removeMany() call
- Export pilihan - Excel/CSV khusus baris yang dipilih

### 6.4 Photo lightbox

PhotoLightbox (fullscreen carousel) + PhotoThumb (thumbnail):

- Keyboard nav: arrow keys, Esc, +/-
- Pinch-zoom di touch device
- Download original

### 6.5 Skeleton loading

Tiga skeleton component: DashboardSkeleton, ListSkeleton, DetailSkeleton.

Pattern:

    const [ready, setReady] = useState(false);
    useEffect(() => setReady(true), []);
    if (!ready) return <XxxSkeleton />;

### 6.6 Bulk Excel import

Modal 4-stage di Laporan page (Import Excel):

1. Upload - dropzone, validasi .xlsx/.xls
2. Mapping - auto-detect kolom
3. Review - preview + validasi per row
4. Done - ringkasan hasil

Library: xlsx (SheetJS Community Edition) v^0.18.5.

### 6.7 Build hardening

30+ type error & build warning diperbaiki:

- MapPicker value prop: { lat, lng, alamat }
- Kandang type flat (bukan nested operasional)
- RegionRef, DAFTAR_KEMITRAAN, makeKandang di-export
- Implicit any -> explicit : any di array callbacks
- Provider order fix - MantineProvider membungkus AppProviders
- useSearchParams() wrapped in Suspense di /pendaftaran
- Missing imports: Kbd, Stack, ThemeIcon, IconFileSpreadsheet, dll
- Photo ref field rename: fileName -> name
- Empty "" key added ke semua LABEL Records

Build status: exit 0, 13 routes prerendered, ~87 KB shared JS.

---

## Catatan Migrasi Backend

Saat backend sudah siap, yang perlu dilakukan:

1. Set NEXT_PUBLIC_DOMAIN_API=https://api.example.com di .env.local
2. Pastikan endpoint tersedia (lihat section Migrasi ke Backend)
3. Ganti session cookie dengan HttpOnly + signed (JWT/session ID)

---

(c) Arcson Development. Lisensi internal.
