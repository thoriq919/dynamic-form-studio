<p align="center">
  <strong>Dynamic Form App</strong>
</p>

<p align="center">
  Sistem formulir dinamis berbasis <strong>Next.js</strong> di mana struktur field, tipe input, status mandatory/optional, serta rules antar-field dikonfigurasi sepenuhnya <em>tanpa mengubah source code</em>.
</p>

---

## Fitur

- **Form Builder Visual** — rancang struktur form secara drag & drop.
- **3 Tipe Field** — `select`, `option` (radio), dan `free_text`.
- **Mandatory / Optional** — tiap field bisa diatur wajib diisi atau opsional.
- **Conditional Rules** — field tampil/sembunyi berdasarkan jawaban field lain.
- **Tree Dependency** — hubungan field berjenjang parent → child dengan kaskade otomatis.
- **Conditional Mandatory / Optional** — status wajib berubah mengikuti rules.
- **Dynamic Validation** — schema validasi di-generate otomatis dari konfigurasi.
- **Dashboard & Submission Logs** — pantau statistik form dan seluruh jawaban masuk.
- **Role-based Access** — peran `admin` (membangun form) dan `responder` (mengisi form).
- **Responsive UI** — nyaman di desktop, tablet, dan mobile.
- **Undo / Redo** — riwayat perubahan saat membangun form.

---

## Konsep Dynamic Form

Form tidak dibuat hard-coded. Struktur form disimpan sebagai konfigurasi dan dirender dinamis oleh **Rule Engine**:

```text
Form Configuration
        ↓
Field Configuration
        ↓
Field Rules
        ↓
Dynamic Form
```

Contoh struktur form:

```text
Customer Type
├── Individual
│   └── ID Number
└── Corporate
    ├── Company Name
    └── NPWP
```

Field yang tampil dan status mandatory-nya ditentukan oleh rules yang dievaluasi terhadap jawaban field sumber.

### Contoh Rule

```json
{
  "field": "company_name",
  "condition": {
    "field": "customer_type",
    "operator": "equals",
    "value": "corporate"
  },
  "action": {
    "visible": true,
    "required": true
  }
}
```

**Operator:** `equals` · `not_equals` · `is_empty` · `is_not_empty` · `in` · `contains`

**Action:** `show` / `hide` · `required` / `optional` · `set_value`

---

## Tech Stack

| Bagian | Teknologi |
| --- | --- |
| Framework | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS |
| Form | React Hook Form |
| Validasi | Zod + `@hookform/resolvers` |
| Icons | lucide-react |

---

## Menjalankan Project

### Prasyarat

- Node.js 18+

### Instalasi

```bash
# 1. Install dependencies
npm install

# 2. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Scripts

| Script | Deskripsi |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Build production |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | Linter |

---

## Struktur Project

```text
app/
├── page.tsx                    # Halaman utama (Form Studio)
├── forms/
│   ├── [id]/page.tsx           # Detail form
│   ├── builder/page.tsx        # Form Builder
│   └── submissions/page.tsx    # Submission
└── api/                        # Route handlers (forms, submissions, auth, seed)

components/
├── dynamic-form/               # Render form dinamis
│   ├── DynamicForm.tsx
│   ├── DynamicField.tsx
│   ├── SelectField.tsx
│   ├── OptionField.tsx
│   └── TextField.tsx
├── studio/                     # Form Builder / Studio
│   ├── FormStudio.tsx
│   ├── ComponentPalette.tsx
│   ├── FormCanvas.tsx
│   ├── FieldConfigDrawer.tsx
│   └── DashboardOverview.tsx
└── auth/
    └── AuthModal.tsx

lib/
├── rules.ts                    # Rule Engine & tree logic
├── validation.ts               # Generator schema validasi dinamis
└── seedData.ts                 # Demo data

types/
└── form.ts                     # Tipe konfigurasi form
```

---

## API

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| `GET` | `/api/forms` | Daftar seluruh form |
| `POST` | `/api/forms` | Buat / simpan form |
| `GET` | `/api/forms/:id` | Detail form |
| `PUT` | `/api/forms/:id` | Perbarui form |
| `DELETE` | `/api/forms/:id` | Hapus form |
| `POST` | `/api/forms/:id/submit` | Kirim jawaban form |
| `GET` | `/api/submissions` | Data submission |
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/register` | Registrasi |
| `POST` | `/api/seed` | Inisialisasi demo form |

---
