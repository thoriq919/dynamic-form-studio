# Dynamic Form Builder & Management Studio

## Overview

Dynamic Form Builder is a full-featured web application built with **Next.js 14** and **MySQL** that enables administrators to design, configure, and manage dynamic forms visually without modifying source code.

Form structure — fields, input types, required/optional status, display order, nested hierarchies, and inter-field rules — is stored entirely as configuration data in **MySQL**. The **Rule Engine** evaluates the configuration in real-time at runtime, rendering only the relevant fields and applying dynamic validations.

The application includes a role-based architecture: **admin** users design forms through a visual drag & drop builder, manage system users, and impersonate other accounts, while **responder** users fill in published forms with automatic input validation and database submission logging.

---

## Features

- **Authentication & RBAC** — secure login and self-registration with role-based access (`admin` / `responder`). Passwords are encrypted with SHA-256 hashing.
- **User Management & Impersonation** — manage user roles, delete accounts, and sign in (*impersonate*) as any user to test the responder experience with an instant one-click return to the admin session.
- **Visual Drag & Drop Builder** — design form structures visually by dragging components from the palette into root slots or specific conditional branch zones.
- **Unified Field Drawer** — configure field properties, options, and conditional logic seamlessly in a single vertical panel.
- **Conditional Target Value** — target value selector automatically adapts; hides for unary operators (`is_empty` / `is_not_empty`) and displays options for relational operators.
- **SweetAlert-Style Toast Notifications** — animated top-right corner alerts for all create, save, edit, duplicate, and delete operations.
- **Mandatory / Optional Fields** — mark fields as required or optional, including conditional required actions based on dynamic rules.
- **Conditional Rules & Branching** — show/hide fields and toggle required states dynamically based on source field answers.
- **Tree Dependency & Cascading** — parent-child field hierarchy with cascading visibility (hiding a parent automatically hides all descendants).
- **Two-Tier Validation** — client-side and server-side validation powered by dynamically generated Zod schemas.
- **Dashboard & Submission Logs** — overview of configured forms, submission counts, quick actions, and structured response logs.
- **CLI & 1-Click Database Seeder** — initialize the default admin account via terminal (`npm run seed`) or browser endpoint (`/api/seed-admin`).
- **Undo / Redo** — in-memory history stack for safe visual building.
- **Responsive UI** — desktop, tablet, and mobile-friendly layout built with Tailwind CSS.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | Fullstack React framework & API Route Handlers |
| TypeScript | Type safety & strict contracts |
| React 18 | Declarative UI & hooks |
| Tailwind CSS | Modern styling, gradients, and custom micro-animations |
| React Hook Form | Dynamic form state management |
| Zod | Dynamic schema generation & payload validation |
| `@hookform/resolvers` | Integration bridge between Zod and React Hook Form |
| MySQL (`mysql2/promise`) | Relational database persistence with global connection pooling |
| Lucide React | Modern UI iconography |

---

## Application Structure

The application workspace includes the following areas:

- **Authentication Modal** — login and registration modal. The first user to register automatically becomes an Administrator.
- **Dashboard Overview** — quick metrics, statistics, quick action shortcuts, and recently updated forms.
- **Form Studio (Visual Builder)** — drag & drop palette, tree canvas with branch zones, and a unified field configuration drawer.
- **All Forms List** — browse, edit structure, launch live forms, or delete configured forms.
- **Submissions & Data Logs** — review submitted response data with formatted JSON key-value badges.
- **User Management** — overview of registered users, role assignments, user creation, user deletion, and session impersonation.

---

## Form Builder Workflow

```text
Component Palette
        ↓ (Drag & Drop)
Form Canvas
        ↓ (Click Field)
Unified Field Config Drawer
        ↓ (Configure Rules / Options)
Live Preview Modal
        ↓ (Test Form)
Save to Database (MySQL)
```

1. **Component Palette** — choose from `Free Text`, `Select Dropdown`, `Radio Option`, `Number`, or `Date`.
2. **Drag & Drop** — drag components directly onto the canvas as root fields or into specific branch condition slots.
3. **Form Canvas** — displays the live hierarchy, nested sub-branches, and visual indicators.
4. **Field Configuration** — edit label, variable name, placeholder, status, required toggle, option list, and conditional logic.
5. **Preview** — test the responsive form with live Rule Engine evaluation and Zod validation.
6. **Save** — persists form metadata, fields, options, and rules to MySQL.

---

## Supported Field Types

### 1. Select Dropdown (`select`)
Dropdown input where the user picks a single value from a list of options. Frequently used as a source field for conditional branching.

```text
Customer Classification
[ Individual Customer ▼ ]
[ Corporate Entity     ▼ ]
```

### 2. Option / Radio (`option`)
A group of selectable radio buttons where only one option can be chosen.

```text
Preferred Contact Method
○ Email
○ Phone Call
○ WhatsApp
```

### 3. Free Text (`free_text`)
Plain text input for free-form responses (names, identification numbers, addresses, emails).

```text
Full Legal Name
[___________________________]
```

---

## Conditional Logic & Rules

Rules define dynamic behavior based on the value of a source field:

```text
IF Customer Classification EQUALS "Corporate Entity"
THEN SHOW Company Name
AND SET Company Name AS REQUIRED
```

### Supported Operators:
- `equals` — exact match (case-insensitive).
- `not_equals` — value does not match.
- `contains` — value contains the target string.
- `is_empty` — source field has no value (target value input is automatically hidden).
- `is_not_empty` — source field is filled (target value input is automatically hidden).
- `in` — value matches any item in a comma-separated list.

### Supported Actions:
- `show` / `hide` — controls target field visibility.
- `required` / `optional` — dynamically sets whether the target field is mandatory.

---

## Database Architecture

Data is stored across 6 relational tables in MySQL:

- **`users`** — `id`, `username`, `password` (SHA-256), `name`, `role`, `created_at`.
- **`forms`** — `id`, `name`, `description`, `status`, `created_at`, `updated_at`.
- **`form_fields`** — `id`, `form_id`, `parent_id`, `name`, `label`, `type`, `required`, `sort_order`, `status`, `placeholder`, `help_text`, `grid_span`, `created_at`, `updated_at`.
- **`field_options`** — `id`, `field_id`, `label`, `value`, `sort_order`, `status`.
- **`field_rules`** — `id`, `field_id`, `source_field_id`, `operator`, `value`, `action`, `created_at`, `updated_at`.
- **`form_submissions`** — `id`, `form_id`, `user_id`, `user_name`, `data` (JSON), `created_at`.

```text
forms 1 ── n form_fields
form_fields 1 ── n field_options
form_fields 1 ── n field_rules
form_fields 1 ── n form_fields (parent_id → id)
forms 1 ── n form_submissions
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticates user with SHA-256 password hash |
| `POST` | `/api/auth/register` | Registers user (first user becomes `admin`) |
| `GET` | `/api/users` | Lists all registered users |
| `POST` | `/api/users` | Creates a new user account |
| `DELETE` | `/api/users?id=:id` | Deletes a user account |
| `GET` | `/api/forms` | Retrieves all forms with complete structures |
| `POST` | `/api/forms` | Creates or updates a form configuration |
| `GET` | `/api/forms/:id` | Retrieves a single form by ID |
| `PUT` | `/api/forms/:id` | Updates an existing form |
| `DELETE` | `/api/forms/:id` | Deletes a form and all associated fields/rules/submissions |
| `POST` | `/api/forms/:id/submit` | Validates (Zod) and saves form submission |
| `GET` | `/api/submissions` | Retrieves form submission logs (supports `?formId=`) |
| `GET` / `POST` | `/api/seed` | Seeds sample forms into MySQL |
| `GET` | `/api/seed-admin` | 1-Click endpoint to ensure the default admin user exists |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL Server (running locally or remotely)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/thoriq919/dynamic-form-studio.git
cd dynamic-form-studio

# 2. Install dependencies
npm install

# 3. Configure environment variables (.env)
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=root
# DB_NAME=dynamic_form_db

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server |
| `npm run build` | Builds the project for production |
| `npm run start` | Runs the production build |
| `npm run lint` | Runs ESLint |
| `npm run seed` | CLI seeder to initialize the default admin account |

### Default Credentials
- **Username**: `admin`
- **Password**: `admindf1773`