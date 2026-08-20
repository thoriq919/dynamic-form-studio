# Dynamic Form Builder & Management Studio

## Overview

Dynamic Form Builder is a full-featured web application that enables administrators to design, configure, and manage dynamic forms visually without modifying source code.

Form structure — fields, input types, required/optional status, display order, nested hierarchies, and inter-field rules — is stored entirely as configuration data. The **Rule Engine** evaluates the configuration in real-time at runtime, rendering only the relevant fields and applying dynamic validations.

The application includes a role-based architecture: **admin** users design forms through a visual drag & drop builder, manage system users, and impersonate other accounts, while **responder** users fill in published forms with automatic input validation and submission tracking.

---

## Features

- **Authentication & RBAC** — secure login and self-registration with role-based access (`admin` / `responder`).
- **User Management & Impersonation** — manage user roles, delete accounts, and sign in (*impersonate*) as any user to test the responder experience with an instant one-click return to the admin session.
- **Visual Drag & Drop Builder** — design form structures visually by dragging components from the palette into root slots or specific conditional branch zones.
- **Unified Field Drawer** — configure field properties, options, and conditional logic seamlessly in a single vertical panel.
- **Conditional Target Value** — target value selector automatically adapts; hides for unary operators (`is_empty` / `is_not_empty`) and displays options for relational operators.
- **Toast Notifications** — animated top-right corner alerts for all create, save, edit, duplicate, and delete operations.
- **Mandatory / Optional Fields** — mark fields as required or optional, including conditional required actions based on dynamic rules.
- **Conditional Rules & Branching** — show/hide fields and toggle required states dynamically based on source field answers.
- **Tree Dependency & Cascading** — parent-child field hierarchy with cascading visibility (hiding a parent automatically hides all descendants).
- **Dynamic Validation** — client-side and server-side validation powered by dynamically generated validation schemas.
- **Dashboard & Submission Logs** — overview of configured forms, submission counts, quick actions, and structured response logs.
- **Undo / Redo** — in-memory history stack for safe visual building.
- **Responsive UI** — desktop, tablet, and mobile-friendly layout built with Tailwind CSS.

---

## Application Structure

The application workspace includes the following areas:

- **Authentication Modal** — login and registration modal. The first user to register automatically becomes an Administrator.
- **Dashboard Overview** — quick metrics, statistics, quick action shortcuts, and recently updated forms.
- **Form Studio (Visual Builder)** — drag & drop palette, tree canvas with branch zones, and a unified field configuration drawer.
- **All Forms List** — browse, edit structure, launch live forms, or delete configured forms.
- **Submissions & Data Logs** — review submitted response data with formatted key-value badges.
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
Save Form
```

1. **Component Palette** — choose from `Free Text`, `Select Dropdown`, `Radio Option`, `Number`, or `Date`.
2. **Drag & Drop** — drag components directly onto the canvas as root fields or into specific branch condition slots.
3. **Form Canvas** — displays the live hierarchy, nested sub-branches, and visual indicators.
4. **Field Configuration** — edit label, variable name, placeholder, status, required toggle, option list, and conditional logic.
5. **Preview** — test the responsive form with live Rule Engine evaluation and validation.
6. **Save** — persists form metadata, fields, options, and rules.

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

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

```bash
# 1. Clone repository
git clone https://github.com/thoriq919/dynamic-form-studio.git
cd dynamic-form-studio

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the project for production |
| `npm run start` | Runs the production build |
| `npm run lint` | Runs ESLint |
