# Dynamic Form Builder

## Overview

Dynamic Form Builder is a web application built with **Next.js** that enables administrators to create, configure, and manage dynamic forms entirely through configuration, without hard-coding every form structure in the source code.

The application stores form structure — fields, input types, required/optional status, display order, and inter-field rules — as configuration data. The **Rule Engine** evaluates the configuration at runtime, rendering only the relevant fields and applying the correct validation rules. This means adding or changing a form does not require a code change or a redeployment.

The application also provides a role-based flow: **admin** users design forms through a visual drag & drop builder, while **responder** users fill in published forms and their submissions are stored and reviewable on the dashboard.

## Features

- **Authentication** — login and registration with role-based access (`admin` / `responder`).
- **Dashboard** — overview of forms, submission counts, and recent responses.
- **Form Management** — create, edit, duplicate, preview, and delete forms.
- **Drag & Drop Form Builder** — design form structures visually by dragging components from the palette.
- **Component Search** — quickly find components in the palette by keyword.
- **Dynamic Field Configuration** — configure each field's properties without code.
- **Mandatory / Optional Fields** — mark fields as required or optional, including conditionally.
- **Conditional Rules** — show/hide fields and toggle required status based on other field values.
- **Field Dependency** — fields can depend on the value of other fields.
- **Tree Relationship** — parent-child field hierarchy with cascading visibility.
- **Form Preview** — test-run a form before publishing it.
- **Responsive UI** — works on desktop, tablet, and mobile.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Application framework |
| TypeScript | Type safety |
| React | UI |
| Tailwind CSS | Styling |
| React Hook Form | Form state management |
| Zod | Validation |
| `@hookform/resolvers` | Bridge between Zod and React Hook Form |
| MySQL | Data persistence |

## Application Structure

The application is organized into several main areas:

- **Authentication** — handles login and registration. Admins are redirected to the Form Builder, while responders land on the available-forms page. Sessions are persisted in local storage (`df_auth_user`).
- **Dashboard** — shows an overview of configured forms, submission counts, and recent submission history.
- **Forms** — lists all configured forms. Admins can browse, edit structure, run live forms, or delete forms.
- **Form Builder** — the core workspace where admins assemble forms via a component palette, a form canvas, and a field configuration drawer.
- **Rules** — field rules (show/hide/required/optional) that drive the dynamic behavior of a form.
- **Configurations** — where submitted data is reviewed in the form of submission logs.

## Form Builder

The visual builder is the primary tool for designing forms. It works in the following flow:

1. **Component Library** — a palette on the left lists available components (Select, Option/Radio, Free Text). Components can be filtered with the search box.
2. **Drag & Drop** — components are dragged from the palette and dropped onto the canvas, either as new root fields or into specific slots to become children of an existing field.
3. **Form Canvas** — the central area renders the current form structure as a tree, showing nested child fields and the form's name/description.
4. **Field Configuration** — selecting a field opens a drawer where its properties (name, label, type, required, placeholder, help text, grid span, options, rules) can be edited.
5. **Rules** — rules define when a field is shown/hidden and when it becomes required, based on the value of a source field.
6. **Preview** — the builder offers a live preview modal that renders the form exactly as a responder would see it.
7. **Save** — the form configuration is persisted via the API.

```text
Component Library
        ↓
Drag & Drop
        ↓
Form Canvas
        ↓
Field Configuration
        ↓
Rules
        ↓
Preview
        ↓
Save
```

The builder also supports **undo/redo** via an in-memory history stack.

## Supported Field Types

The application supports three field types:

### Select

A dropdown where the user picks a single value from a predefined list of options. Used when a field has many possible choices.

```text
Customer Type
[ Individual ▼ ]
[ Corporate  ▼ ]
```

Each Select field holds its options in an `options` array (label/value pairs) and is a common source field for conditional rules.

### Option / Radio

A set of radio buttons where the user picks one visible option. Used when the choices are few and should be immediately visible.

```text
Jenis Kelamin

○ Male
○ Female
```

Like Select, radio options are stored as an `options` array on the field.

### Free Text

A plain text input where the user types a value. Used for free-form answers.

```text
Company Name
[________________]
```

## Field Configuration

Each field can be configured with the following properties:

- **Field name** — unique identifier used in the form data (e.g. `company_name`).
- **Label** — the human-readable label shown to the user.
- **Type** — one of `select`, `option`, or `free_text`.
- **Required** — whether the field must be filled (`true`/`false`).
- **Parent field** — the field this field belongs to in the tree structure (`parent_id`).
- **Options** — available choices for `select` and `option` fields.
- **Rules** — conditional rules that control visibility and required state.
- **Display order** — sorting position among siblings (`sort_order`).
- **Status** — whether the field is active or hidden (`status`).

Example JSON configuration:

```json
{
  "name": "company_name",
  "label": "Company Name",
  "type": "free_text",
  "required": true,
  "parent": "customer_type",
  "sort_order": 3,
  "status": "active",
  "options": [],
  "rules": [
    {
      "field_id": "company_name",
      "source_field_id": "customer_type",
      "operator": "equals",
      "value": "corporate",
      "action": "show"
    }
  ]
}
```

## Conditional Rules

Rules define dynamic behavior based on the value of a source field. When the condition matches, the specified action is applied to the target field.

```text
IF Customer Type equals Corporate
THEN Show Company Name
AND Set Company Name as Required
```

Supported operators:

- `equals`
- `not_equals`
- `is_empty`
- `is_not_empty`
- `in`
- `contains`

Supported actions:

- `show` / `hide` — control field visibility.
- `required` / `optional` — toggle the required state.
- `set_value` — prefill the target field.

Example JSON configuration:

```json
{
  "field_id": "company_name",
  "source_field_id": "customer_type",
  "operator": "equals",
  "value": "corporate",
  "action": "show"
}
```

The `evaluateFieldStates` function in `lib/rules.ts` evaluates every rule against the current form values and produces a state map (`visible`, `required`, and triggered rules) for each field.

## Field Dependency

Fields can depend on other fields, forming a parent-child tree. When the parent's value changes, dependent fields are shown or hidden accordingly.

```text
Customer Type
├── Individual
│   └── ID Number
└── Corporate
    ├── Company Name
    └── NPWP
```

In this example, selecting `Individual` shows only `ID Number`, while selecting `Corporate` shows `Company Name` and `NPWP`. Fields whose parent is not visible are automatically hidden through a cascading tree traversal.

The tree structure is built with `buildFieldTree` and flattened with `flattenFieldTree` in `lib/rules.ts`. The `parent_id` property on each field links a child to its parent.

## Validation

Validation is generated dynamically from the field configuration and the currently evaluated field states. This ensures that hidden fields are skipped and required status is honored at submit time.

The relationship between configuration and validation:

```text
Configuration
    ↓
Zod Schema
    ↓
React Hook Form
    ↓
Validation
    ↓
Submit
```

On submit, `generateDynamicZodSchema` in `lib/validation.ts` builds a Zod schema where:

- Hidden fields become optional and are excluded from the submitted payload.
- Visible required fields of type `select`/`option` must be selected.
- Visible required `free_text` fields must be non-empty.
- Optional fields accept empty or `null` values.

React Hook Form manages the form state, error display, and reset, while `@hookform/resolvers` is available to integrate the generated Zod schema with the form.

## Database

The application persists data in MySQL. The following entities are used:

- **forms** — the top-level form record. Contains `id`, `name`, `description`, `status`, `created_at`, `updated_at`.
- **form_fields** — fields belonging to a form. Contains `id`, `form_id`, `parent_id`, `name`, `label`, `type`, `required`, `sort_order`, `status`, `placeholder`, `help_text`, `grid_span`. The `parent_id` column builds the tree structure.
- **field_options** — options for `select` and `option` fields. Contains `id`, `field_id`, `label`, `value`, `sort_order`, `status`.
- **field_rules** — conditional rules applied to a field. Contains `id`, `field_id`, `source_field_id`, `operator`, `value`, `action`.

The application also uses two supporting tables:

- **users** — authentication records with `username`, `password`, `name`, and `role`.
- **form_submissions** — submitted responses stored as JSON in a `data` column.

Relationships:

```text
forms 1 ── n form_fields
form_fields 1 ── n field_options
form_fields 1 ── n field_rules
form_fields 1 ── n form_fields (parent_id → id)
forms 1 ── n form_submissions
```

The tables are created automatically on first connection. If MySQL is unavailable, the application falls back to a local JSON file for development convenience.

## Project Structure

The application follows the Next.js App Router structure. A recommended layout:

```text
app/
├── login/
├── register/
├── forgot-password/
├── dashboard/
├── forms/
├── form-builder/
└── api/

components/
└── dynamic-form/

lib/
```

The important directories:

- **`app/`** — application routes. `login`, `register`, and `forgot-password` hold the authentication pages; `dashboard` shows the overview; `forms` lists available forms and submissions; `form-builder` hosts the visual builder; `api/` contains the route handlers for forms, submissions, auth, and seeding.
- **`components/dynamic-form/`** — the renderer used by responders. `DynamicForm` orchestrates the form, `DynamicField` renders each field recursively, and `SelectField`, `OptionField`, and `TextField` render the individual input types.
- **`lib/`** — core logic. `rules.ts` implements the Rule Engine and tree handling, `validation.ts` generates the dynamic Zod schema, and `db.ts` is the data-access layer.

In the current implementation, the studio (builder, dashboard, forms list, and submissions) is a client-side workspace (`components/studio/FormStudio.tsx`) served from the main app page.

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL (optional — a local JSON fallback is provided automatically)

### Installation

```bash
git clone <repository>
cd <project>
npm install
```

Create a `.env` file based on `.env.example` to configure the database (optional):

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=dynamic_form_db
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run the linter |
| `node scripts/test-engine.mjs` | Run standalone tests for the Rule Engine |