# Website Builder - Session Changes & Implementation Log

This document records all Website Builder 1:1 updates, component rebuilds, layout fixes, and sidebar navigation changes completed during this session.

---

## ⚠️ Mandatory Design Rules & UX Standards

### 🔄 Save Button Spinner Loader Requirement
- **Requirement:** Every Save / Update button across all Website Builder modules MUST display an animated spinning loader icon (`<Loader2 className="h-4 w-4 animate-spin" />`) when `isSaving` state is `true`.
- **Implementation Pattern:**
  ```tsx
  <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {isSaving ? 'Saving...' : 'Save Changes'}
  </Button>
  ```
- **Rule:** Never render a static `<Save />` icon while saving; always swap the icon to the animated `<Loader2 className="animate-spin" />` spinner component when `isSaving` is true.

### 🎨 Dynamic Dashboard Theme Color Token Rule
- **Requirement:** NEVER hardcode static color utility classes (e.g., `bg-purple-600`, `text-purple-600`, `border-purple-600`, `bg-white`, `text-slate-900`) for primary action buttons, active states, step badges, icons, callout banners, or card backgrounds across any Website Builder module.
- **Reason:** The Admin Dashboard appearance system allows admins to dynamically select their custom primary theme color (**Dashboard > Website Builder > Theme Color** / `AppearanceProvider`). Dynamic CSS variables (`--primary`, `--primary-foreground`, `--background`, `--foreground`, `--card`, `--muted`, `--border`) control the theme colors dynamically.
- **Implementation Standards:**
  - **Primary Action Buttons & Action Badges:** `bg-primary hover:bg-primary/90 text-primary-foreground`
  - **Accent Icons & Text Highlights:** `text-primary`
  - **Active Selection Cards / Active Borders:** `border-primary bg-primary/10 ring-2 ring-primary/20`
  - **Callout Banners & Info Boxes:** `bg-primary/10 border border-primary/20 text-primary`
  - **Numbered Step Badges:** `bg-primary text-primary-foreground`
  - **Cards & Surface Containers:** `bg-card text-card-foreground border-border`
  - **Subtexts & Helper Labels:** `text-muted-foreground`
  - **Page Layout Backgrounds:** `bg-background text-foreground`

### 🧩 Standard Design System Component Usage Rule
- **Requirement:** ALWAYS use the repository's standardized component library (`@/components/ui/*` and `_components/builder-field`) instead of creating custom ad-hoc HTML elements or custom styled wrappers from scratch.
- **Core Component Map:**
  - **Buttons:** Always use `<Button>` (`variant="outline"`, `variant="ghost"`, primary) from `@/components/ui/button`.
  - **Containers & Cards:** Always use `<Card>`, `<CardHeader>`, `<CardTitle>`, `<CardDescription>`, `<CardContent>`, `<CardFooter>` from `@/components/ui/card`.
  - **Form Fields & Counters:** Always use `<BuilderCountedInput>` and `<BuilderCountedTextarea>` for counted inputs, and `<Input>`, `<Label>` from `@/components/ui/*`.
  - **Dropdowns & Selectors:** Always use `<Select>`, `<SelectTrigger>`, `<SelectValue>`, `<SelectContent>`, `<SelectItem>` from `@/components/ui/select`.
  - **Toggles & Checkboxes:** Always use `<Switch>` from `@/components/ui/switch` and `<Checkbox>` from `@/components/ui/checkbox`.
  - **Modals & Dialogs:** Always use `<Dialog>`, `<DialogContent>`, `<DialogHeader>`, `<DialogTitle>`, `<DialogDescription>`, `<DialogFooter>` from `@/components/ui/dialog`.
  - **Tabs & Segmented Navigation:** Always use `<Tabs>`, `<TabsList>`, `<TabsTrigger>`, `<TabsContent>` from `@/components/ui/tabs`.
  - **Status Pills & Badges:** Always use `<Badge>` from `@/components/ui/badge`.
- **Rule:** Never re-invent ad-hoc custom UI elements when established component library primitives exist.

---

## 1. Active Sidebar Navigation Configuration (`app-sidebar.tsx`)

File: [app-sidebar.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/admin/app-sidebar.tsx)

### ✅ ENABLED Website Builder Sidebar Sections (7 Core Pages):
1. **Header** (`/admin/website-builder/header`)
2. **Nav Menu** (`/admin/website-builder/nav-menu`)
3. **Login Page** (`/admin/website-builder/login-page`)
4. **Web UI Block** (`/admin/website-builder/ui-block`)
5. **SEO Settings** (`/admin/website-builder/seo`)
6. **Footer Settings** (`/admin/website-builder/footer`)
7. **Theme Color** (`/admin/website-builder/theme-color`)

### 🔒 ADDITIONAL Content Builder Modules:
- **Simple Slider** (`/admin/website-builder/simple-slider`)
- **Advance Slider** (`/admin/website-builder/advance-slider`)
- **Hero Section** (`/admin/website-builder/hero-section`)
- **Gallery** (`/admin/website-builder/gallery`)

---

## 2. Completed 1:1 Website Builder Pages & Components

### 🟢 Portfolio - Sponsors Page (`sponsors/page.tsx`)
File: [page.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/sponsors/page.tsx)
- **1:1 Design Match:** Rebuilt `sponsors/page.tsx` into a 2-column workspace layout (`xl:grid-cols-12`) matching original Vercel OG App specifications.
- **Top Actions Bar:** Added `How It Works`, `Reset` (outline red button), and `Save` (blue filled button) action buttons with breadcrumb `Dashboard > Website Builder > Portfolio > Sponsors`.
- **Add New Sponsor Card (Left Column):** `Sponsor Name` (character-counted, max 100), `SPONSOR LOGO` upload dropzone (`600x400px Max: 2MB`), and `+ Add Sponsor` primary button.
- **Added Sponsors List Card (Left Column):** Header `Added Sponsors (X)`, drag handle `#`, logo thumbnail box, sponsor name, `Pencil` edit & `Trash` delete action buttons, and subtext `"You can upload up to 30 sponsors."`
- **Live Preview Card (Right Column):** Live status badge (`● Live Preview`), subtitle (`"This is how the sponsor wall will appear on the website."`), and responsive logo wall grid (`grid-cols-2 md:grid-cols-3 xl:grid-cols-4`).

### 🟢 Portfolio - Clients Page (`clients/page.tsx`)
File: [page.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/clients/page.tsx)
- **1:1 Design Match:** Rebuilt `clients/page.tsx` into a 2-column workspace layout (`xl:grid-cols-12`) matching original Vercel OG App specifications.
- **Top Actions Bar:** Added `How It Works`, `Reset` (outline red button), and `Save` (blue filled button) action buttons with breadcrumb `Dashboard > Website Builder > Portfolio > Clients`.
- **Add New Client Card (Left Column):** `Client Name` (character-counted, max 100), `CLIENT LOGO` upload dropzone (`600x400px Max: 2MB`), and `+ Add Client` primary button.
- **Added Clients List Card (Left Column):** Header `Added Clients (X)`, drag handle `#`, logo thumbnail box, client name, `Pencil` edit & `Trash` delete action buttons, and subtext `"You can upload up to 30 clients."`
- **Live Preview Card (Right Column):** Live status badge (`● Live Preview`), subtitle (`"This is how the client logo wall will appear on the website."`), and responsive logo wall grid.

### 🟢 Testimonials Module (`_components/testimonials-content.tsx`)
File: [testimonials-content.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/testimonials-content.tsx)
- **1:1 Design & Layout Match:** Rebuilt into a 2-column workspace layout (`xl:grid-cols-12`) matching original Vercel OG App specifications.
- **Top Actions Bar:** Added `How It Works`, `Delete` (outline red button), and `Update Testimonial` (blue filled button) action buttons with breadcrumbs `Dashboard > Website Builder > Testimonials`.
- **Testimonial Information Panel (Left Column):** `Customer Name *` (character-counted, max 100), `Customer Photo` (avatar preview + upload dropzone with `400x400px Max: 2MB` specs), `Event Name *`, `Feedback` textarea (max 1000 chars), `Show Rating` switch toggle, `Rating` star selector (1-5 stars), and `Show/Hide Testimonial` switch toggle.
- **Live Preview Card (Right Column):** Gradient card with `Testimonials` tag pill, `What Our Clients Say` heading, client photo avatar, quotation mark icon `“`, rating stars, customer feedback text, and carousel controls (`<` / `>`).
- **Testimonial Management Table (Right Column):** Title `Testimonial Management`, **`+ Add New Testimonial`** button (primary blue), `#` drag handle, avatar `Photo`, `Name`, `Event Name`, 5 yellow star `Rating` display, green `Status` switch, and `Pencil` edit / `Trash` delete action buttons.

### 🟢 Gallery Categories Page (`gallery/categories/page.tsx`)
File: [page.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/gallery/categories/page.tsx)
- **1:1 Design Match:** Rebuilt `gallery/categories/page.tsx` to match original Vercel OG App specifications.
- **Top Actions Bar:** Added `How It Works`, `Reset`, and `Save Category` (blue filled) action buttons with breadcrumb `Dashboard > Website Builder > Gallery > Categories`.
- **Add New Category Form Card:** 3-column inputs (`Category Name *` with `0/50` counter & auto-slug, `Slug *` with `0/50` counter, `Description (Optional)` with `0/150` counter), `Active` status card box with `<Switch />`, `Display Order` number field, and `Cancel` / `Save Category` buttons.
- **Categories Table Card:** Search bar (`Search categories...`), `#` index & drag handle, Category name & description, mono `Slug`, `Images` count, `Status` switch toggle, `Order` number, `Pencil` edit & `Trash` delete action buttons, and pagination footer.

### 🟢 Event Gallery Page (`_components/gallery-content.tsx`)
File: [gallery-content.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/gallery-content.tsx)
- **1:1 Design & Layout Match:** Rebuilt into a 2-column workspace layout (`xl:grid-cols-12`).
- **Top Actions Bar:** Added `How It Works`, `Reset`, and `Save Gallery` (blue filled) action buttons with breadcrumbs `Dashboard > Website Builder > Gallery`.
- **Gallery Information Panel (Left Column):** `Event Name *` (character-counted, max 100), `Event Type *` (`Select` dropdown with placeholder `"Select category"` & category hint), and `City *` (max 100).
- **Gallery Images Panel (Left Column):** Drag-and-drop cloud upload zone (`"Click to upload or drag and drop"`), specs note (`"Recommended: 1200x800px gallery image (Max: 5MB each)"`), max upload count (`"You can upload up to 50 images."`), and thumbnail preview grid.
- **Gallery Live Preview (Right Column):** Live status badge (`● Gallery Preview`), subtitle, top-right **`+ Add Category`** primary button, active category filter pills (`All`, `Wedding Decor`, `Corporate Summits`, etc.), and 4-column responsive photo grid.

### 🟢 Action Button Styling Alignment Across All Modules
Files: [contact-us/categories/page.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/contact-us/categories/page.tsx), [pages/page.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/pages/page.tsx), [testimonials-content.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/testimonials-content.tsx), [gallery/categories/page.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/gallery/categories/page.tsx)
- **Standardized Action Buttons:** Updated table action buttons across all website builder modules (`Pages List`, `Contact Categories`, `Testimonials`, `Gallery Categories`, `Simple Slider`, `Advance Slider`) to use standardized **8x8 rounded outline icon buttons**:
  - **Pencil Edit Icon Button:** Light blue border & fill on hover (`border-slate-200 text-slate-500 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50/50`).
  - **Trash Delete Icon Button:** Red outline border & fill on hover (`border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300`).

### 🟢 Button Link Target Mode Alignment (`Button Page` Dropdown vs `Custom URL`)
Files: [simple-slider-content.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/simple-slider-content.tsx), [advance-slider-content.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/advance-slider-content.tsx), [hero-section-content.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/hero-section-content.tsx)
- **5. BUTTON LINK Mode:** When **`Page`** is selected, the form now renders a **`Button Page`** dropdown selector (`<Select>`) containing site pages (`Home`, `About Us`, `Services`, `Events`, `Gallery`, `Contact Us`).
- **Custom URL Mode:** When **`Custom`** is selected, the form renders the **`Custom URL`** input field with character counting.

### 🟢 Standard Switch UI Refactor (`switch.tsx`)
File: [switch.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/switch.tsx)
- Refactored `Switch` component to feature a **light green track background (`bg-emerald-100`)** when **ON**, matching the light red track (`bg-red-100`) when **OFF**.
- Clean internal text alignment ("ON" / "OFF") with smooth circle thumb handles sliding edge to edge.
- Shared standard switch component across form cards and table status columns.

### 🟢 Simple Slider Page (`_components/simple-slider-content.tsx`)
File: [simple-slider-content.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/simple-slider-content.tsx)
- Rebuilt simple slider form with numbered sections, slide management table, and live interactive banner preview.

### 🟢 Contact Us Page (`contact-us/page.tsx`)
File: [page.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/contact-us/page.tsx)
- **Editor Mode Switcher:** `Static (Information)` vs `Dynamic (Form)` segmented control.
- **Contact Information:** Character-counted Email, Mobile, and Address inputs.
- **Social Links Table:** Table with `#`, `Social Network`, `Link` input, and ON/OFF `Show` switches.

### 🟢 SEO Settings Enhancements (`_components/seo-content.tsx`)
File: [seo-content.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/seo-content.tsx)
- **Keywords Helper & Badge Pills:** Updated helper text to `"Enter keyword and press Enter (or separate keywords with commas)."` and added interactive keyword badge pills with `×` remove buttons.
- **Select Dropdowns:** Standardized `Robots Meta Tag` (`Index, Follow`, `NoIndex, NoFollow`, etc.) and `Language` (`English`, `Spanish`, `French`, `German`, `Arabic`, `Hindi`) select dropdowns.
- **SEO Optimization Tip Box:** Added styled callout card (`💡 SEO Optimization Tip`) providing guidance on title/description length limits and canonical indexing.

### 🟢 Login Page Live Preview Device Switcher (`_components/login-page-content.tsx`)
File: [login-page-content.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/login-page-content.tsx)
- Replaced static badge with interactive **`Desktop | Mobile`** view switcher buttons in live preview header card for testing client login side panel layout across viewports.

### 🟢 Contact Submissions List Table (`contact-us/list/page.tsx`)
File: [page.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/contact-us/list/page.tsx)
- Rebuilt contact list into a full, interactive 6-column **shadcn `<Table>`**: `#` (index & drag handle), `Contact Person` (name + email avatar), `Category` (pill badge), `Message` details, `Date`, and `Actions` (red outline trash button) with real-time search input.

### 🟢 Header Section Divider Line Contrast Enhancement
Files: [login-page-content.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/login-page-content.tsx), [header-content.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/header-content.tsx), [nav-menu-content.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/nav-menu-content.tsx), [seo-content.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/seo-content.tsx), [footer-content.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/footer-content.tsx), [ui-block-content.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/ui-block-content.tsx)
- Updated section header bottom border lines from faint 1px lines (`border-b`) to prominent **`border-b-2 border-slate-300/80`** to ensure clear, crisp visual separation between the top title/action bar and content cards.

### 🟢 Pricing Plans Module Rebuild & Drag-and-Drop Reordering (`pricing-plans-content.tsx`)
File: [pricing-plans-content.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/pricing-plans-content.tsx)
- **1:1 Design & Layout Match:** Rebuilt `pricing-plans-content.tsx` into a 2-view workspace layout matching original Vercel OG App specifications.
- **Top Actions Bar:** Title `All Plans Include Features` / `Add Pricing Plan`, subtitle, `View Public Page [🔗]` outline button, and `Save Changes` primary button with animated `<Loader2 className="animate-spin" />` spinner.
- **Features Comparison Matrix Table (View 1):** Title `All Plans Include Powerful Features` with pink badge `Visible on Pricing Page`, top-right `+ Add New Feature` button, tier column headers (`Free`, `Basic`, `Pro`, `Premium`, `Companies`), 10 pre-configured feature rows with tooltips & icons, soft purple info callout box, and legend footer bar.
- **Add New Feature Modal (Dialog):** 3-section modal featuring `Feature Title *` (`0/80`), `Feature Icon` select dropdown, `Feature Description *` (`0/200`), 5-column plan limit inputs with `Not Included` checkboxes, and `Active` status switch toggle.
- **Add / Edit Pricing Plans Form (View 2):** 5 numbered form section cards (`Basic Information`, `Pricing Details`, `Features & Limits`, `Plan Settings`, `Additional Settings`) with `Plan For` card selector (`Individuals` vs `Companies`), preset badge pills (`Popular`, `Best Value`, `Recommended`, `New`), billing cycle cards (`Monthly` vs `Yearly` with `Save up to 20%`), currency dropdown, price inputs, free trial toggle, icon grid, color swatches, live preview card with desktop/mobile view switcher (`[🖥️|📱]`), plan summary card, and tips callout card.
- **Add Plan Badge Modal (Dialog):** Custom badge modal with text input (`0/25`), 4 style cards (`Filled`, `Outline`, `Soft Filled`, `Soft Outline`) with live text previews, and color swatch picker.
- **🔄 Interactive Drag & Drop Reordering Functionality:**
  - Implemented smooth HTML5 drag-and-drop reordering (`draggable={true}`, `onDragStart`, `onDragOver`, `onDrop`) for Matrix Feature rows (`matrixFeatures`) and Plan Includes limits (`features`).
  - Added visual grip handles (`<GripVertical className="cursor-grab active:cursor-grabbing" />`) with active drag opacity feedback (`opacity-40 bg-purple-50`).

### 🟢 100% Radix UI Primitive Elimination & Pure React Component Migration (Ported from `Event_Managment_Website_Builder`)
Files: [select.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/select.tsx), [dialog.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/dialog.tsx), [tabs.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/tabs.tsx), [switch.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/switch.tsx), [checkbox.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/checkbox.tsx), [label.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/label.tsx), [avatar.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/avatar.tsx), [collapsible.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/collapsible.tsx), [popover.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/popover.tsx), [tooltip.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/tooltip.tsx), [progress.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/progress.tsx), [separator.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/separator.tsx), [slider.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/slider.tsx), [radio-group.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/radio-group.tsx), [alert-dialog.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/alert-dialog.tsx), [dropdown-menu.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/dropdown-menu.tsx), [sheet.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/sheet.tsx), [scroll-area.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/scroll-area.tsx), [context-menu.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/context-menu.tsx), [command.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/command.tsx), [form.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/form.tsx), [sidebar.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/sidebar.tsx), [button.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/ui/button.tsx), [slot.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/lib/slot.tsx)
- **100% Radix UI Removal:** Verified via grep search (**0 results found** across the entire `src/components/ui` directory). Replaced every Radix UI package primitive (`@radix-ui/react-*`) with lightweight, zero-dependency custom React implementations matching `D:\Jamal\Event_Managment_Website_Builder`.
- **Full Primitive Coverage (23 UI Primitives):**
  - **`select.tsx`**: Pure React state + `createPortal` dropdown escaping overflow containers cleanly.
  - **`dialog.tsx`**: Pure React portal modal backdrop (`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4`).
  - **`tabs.tsx`**: Pure React context-driven segmented tab controller.
  - **`switch.tsx`**: Pure React button toggle with smooth animated thumb handle and green/red status indicators.
  - **`checkbox.tsx`**: Pure React button checkbox with custom check icon state.
  - **`label.tsx`**: Pure React `<label>` element with flex typography alignment.
  - **`avatar.tsx`**: Pure React `<div>` avatar container with error fallback handling.
  - **`collapsible.tsx`**: Pure React context-driven collapsible panel component.
  - **`popover.tsx`**: Pure React portal popover container.
  - **`tooltip.tsx`**: Pure React hover tooltip container.
  - **`progress.tsx`**: Pure React progress bar indicator.
  - **`separator.tsx`**: Pure React horizontal & vertical divider lines.
  - **`slider.tsx`**: Pure React range slider component.
  - **`radio-group.tsx`**: Pure React radio button option group.
  - **`alert-dialog.tsx`**: Pure React modal alert dialog overlay.
  - **`dropdown-menu.tsx`**: Pure React portal action menu dropdown.
  - **`sheet.tsx`**: Pure React drawer sheet component with portal backdrop overlay.
  - **`scroll-area.tsx`**: Pure React smooth overflow scrolling container with custom scrollbar styling.
  - **`context-menu.tsx`**: Pure React portal context menu overlay triggered on right-click.
  - **`command.tsx`**: Replaced Radix `DialogProps` import with custom `DialogProps`.
  - **`form.tsx`**: Replaced Radix `LabelPrimitive` and `Slot` with pure React implementations.
  - **`sidebar.tsx` & `button.tsx`**: Replaced `@radix-ui/react-slot` with custom `Slot` component in `src/lib/slot.tsx`.
- **Dynamic Theme Binding:** All components bind to dynamic CSS theme tokens (`bg-primary`, `text-primary`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`), ensuring 100% responsiveness to theme color settings and dark mode.

---

## 3. Verification & Build Integrity
- **TypeScript Check (`npx tsc --noEmit`):** Clean build, **0 Errors**.
- **Development Server:** Running smoothly without compilation errors.

---

## Session 2 — Backend API, DB Migrations, Pricing, Features & UI Block Sidebar Wiring

> **Date:** 2026-07-27 | **Backend:** `D:\Jamal\Event_Management_Admin_Backend` | **Frontend:** `D:\Jamal\Event_Management_Admin_Frontend`

---

### 4. Company Website Builder — New Backend API

> ⚠️ **Architecture Note:** The Admin Portal is NOT a vendor. All previous website-builder routes were under `/api/v1/vendors/website/*` with `isVendorAuthenticated` middleware — the admin JWT cannot use that. A dedicated company-scoped controller + routes was created.

#### New Backend Files

| File | Purpose |
|---|---|
| [`companyWebsiteBuilder.controller.js`](file:///D:/Jamal/Event_Management_Admin_Backend/src/controllers/companyWebsiteBuilder.controller.js) | Handlers for UI Blocks, Pricing, Features using `sequelize.query` + `QueryTypes` |
| [`companyWebsiteBuilder.routes.js`](file:///D:/Jamal/Event_Management_Admin_Backend/src/routes/companyWebsiteBuilder.routes.js) | Routes with `isAuthenticated + extractCompanyContext` middleware |

#### Route Mount in `app.js`
```js
// Admin-scoped — uses isAuthenticated + extractCompanyContext (NOT isVendorAuthenticated)
app.use('/api/v1/website-builder', require('./routes/companyWebsiteBuilder.routes'));
```

#### All API Endpoints (under `/api/v1/website-builder/`)

| Method | Path | Description |
|---|---|---|
| GET / PUT | `/ui-blocks` | UI block visibility & sort order |
| GET / PUT | `/pricing/settings` | Pricing section heading / labels |
| GET / PUT | `/pricing/plans` | Company pricing plans (bulk replace) |
| GET / PUT | `/pricing/matrix-features` | Feature comparison matrix rows |
| GET / PUT | `/features` | Features (bulk replace) |
| POST | `/features` | Create single feature |
| PUT | `/features/:id` | Update single feature |
| DELETE | `/features/:id` | Delete single feature |

#### Company ID Resolution Pattern
```js
const getCompanyId = (req) => req.companyId || req.user?.company_id || 1;
// req.companyId is always set by extractCompanyContext middleware
```

#### Raw SQL Pattern — ALWAYS Use This in companyWebsiteBuilder.controller.js
```js
const { sequelize, Sequelize } = require('../models');
const { QueryTypes } = Sequelize;

// SELECT
const rows = await sequelize.query('SELECT * FROM table WHERE company_id = ?',
  { replacements: [companyId], type: QueryTypes.SELECT });

// INSERT
await sequelize.query('INSERT INTO table (...) VALUES (?,...)',
  { replacements: [...], type: QueryTypes.INSERT });

// UPDATE
await sequelize.query('UPDATE table SET col=? WHERE company_id=?',
  { replacements: [...], type: QueryTypes.UPDATE });

// DELETE
await sequelize.query('DELETE FROM table WHERE company_id=?',
  { replacements: [companyId], type: QueryTypes.DELETE });
```
> ❌ NEVER use `db.query` from `../config/database` — that is a Sequelize config object, not a query interface.

---

### 5. Raw SQL DB Migrations — Pricing & Features Tables

> **Rule:** Never run `sequelize db:migrate`. Always execute raw SQL directly via script.

#### Script: `D:\Jamal\Event_Management_Admin_Backend\scratch\setup_pricing_tables_raw.js`
- Reads credentials from `.env` (local `localhost:3306`) and `.env.production` (Aiven MySQL)
- Run with: `node scratch/setup_pricing_tables_raw.js`

#### Tables Created

| Table | Key Columns |
|---|---|
| `company_website_pricing_settings` | `company_id`, section_title, headings, yearly_discount_badge |
| `company_website_pricing_plans` | `company_id`, plan_name, price_monthly, price_yearly, features_json, is_popular |
| `company_website_pricing_matrix_features` | `company_id`, feature_name, plan_values_json |
| `company_website_features` | `company_id`, title, short_description, icon, bullet_points_json, status |

> ⚠️ **Business Rule:** All tables use `company_id` — pricing is company promotional content ONLY. It is NOT linked to vendors, individual users, or subscriptions.

---

### 6. Frontend TanStack Query Hooks

| File | Hooks | Endpoint |
|---|---|---|
| [`useUiBlocks.ts`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/hooks/useUiBlocks.ts) | `useUiBlocksData`, `useSaveUiBlocks` | `/website-builder/ui-blocks` |
| [`usePricingPlans.ts`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/hooks/usePricingPlans.ts) | Pricing plan/settings hooks | `/website-builder/pricing/*` |

#### ⚠️ Critical Bug Fixed — `block_key` vs Integer `id` Mapping

**Problem:** DB rows have two separate fields:
- `id` — integer auto-increment PK (`1`, `2`, `3`…) — NOT the block identifier
- `block_key` — string identifier (`"pricing-plans"`, `"hero-section"` etc.)

Original code: `id: (row.id ?? row.block_key)` — since `row.id` is always a truthy integer, `block_key` was never reached. The visibility Map was built with integer keys, so `uiBlockVisibility.get("pricing-plans")` always returned `undefined` and nothing was ever hidden.

**Fix in [`useUiBlocks.ts`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/hooks/useUiBlocks.ts):**
```ts
return rows.map((row) => ({
    ...row,
    // IMPORTANT: row.id = integer DB primary key (1,2,3…). row.block_key = "pricing-plans" etc.
    // MUST use block_key so sidebar uiBlockKey lookups match correctly.
    id: (row.block_key ?? row.id) as string,   // ✅ block_key first
    visible: row.is_visible === 1 || row.is_visible === true || row.visible === true,
})) as UiBlockPayloadItem[];
```

---

### 7. Sidebar UI Block Visibility System (`app-sidebar.tsx`)

Every Website Builder sidebar item now respects the **Web UI Block** toggle page.

#### How It Works
1. Admin goes to `Website Builder > Web UI Block`
2. Toggles a block OFF → clicks **Save Changes**
3. DB: `vendor_website_ui_blocks` saves `is_visible = 0` for that `block_key`
4. Sidebar calls `useUiBlocksData()` → maps `block_key → visible`
5. Any item where `visible === false` is hidden from the sidebar immediately

#### `MenuItem` Interface — New Field
```ts
interface MenuItem {
  // ...all existing fields...
  uiBlockKey?: string; // if set, item hidden when this UI block is toggled OFF
}
```

#### Filter Logic Added to `filterMenuItem()`
```ts
const { data: uiBlocks } = useUiBlocksData();
const uiBlockVisibility = new Map<string, boolean>(
  (uiBlocks ?? []).map((b) => [b.id, b.visible])  // b.id = block_key string
);

// Only hide when blocks have been saved (length > 0) AND block is explicitly OFF
// Edge case: when DB is empty (before first save), show all items
if (item.uiBlockKey && uiBlocks && uiBlocks.length > 0 &&
    uiBlockVisibility.get(item.uiBlockKey) === false) {
  return false;
}
```

#### Complete `uiBlockKey` Mapping — All Website Builder Sidebar Items

| Sidebar Label | `uiBlockKey` |
|---|---|
| Header | `basic-information` |
| Nav Menu | `nav-menu` |
| Login Page | `login-page` |
| Web UI Block | *(none — always visible, it's the control panel)* |
| SEO Settings | `seo` |
| Footer Settings | `footer` |
| Theme Color | `theme-color` |
| Pages *(parent group)* | `pages` |
| Contact Us *(parent group)* | `contact_us` |
| Hero Section | `hero-section` |
| Simple Slider | `basic-slider` |
| Advance Slider | `advance-slider` |
| Gallery Images | `gallery-images` |
| Gallery Categories | `gallery-categories` |
| Testimonials | `testimonials` |
| Pricing Plans | `pricing-plans` |
| Features Builder | `features` |
| Sponsors | `basic-sponsors` |
| Clients | `basic-clients` |

#### Login Page Added to `INITIAL_BLOCKS` in `ui-block-content.tsx`
```ts
{ id: 'login-page', label: 'Login Page', description: 'Vendor/user login page builder.',
  icon: Monitor, visible: true, locked: false, required: false },
```

#### DB Table for UI Blocks
```
vendor_website_ui_blocks
Columns: id (INT PK), vendor_id (stores companyId), website_id,
         block_key (VARCHAR — the string identifier), is_visible (TINYINT), sort_order
```
> Note: `vendor_id` column stores `companyId` for company-scoped blocks (legacy column name).

---

### 8. Proxy Architecture — Frontend → Backend

```
apiClient.get('/website-builder/ui-blocks')
  → Next.js proxy: GET /api/proxy/v1/website-builder/ui-blocks
  → Strips 'v1/' prefix
  → Backend: http://localhost:5001/api/v1/website-builder/ui-blocks
  → Middleware: isAuthenticated + extractCompanyContext
  → Controller: companyWebsiteBuilder.controller.js
  → MySQL: vendor_website_ui_blocks WHERE vendor_id = companyId
```

- Frontend env: `NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1` (`.env.local`)
- Proxy file: [`src/app/api/proxy/[...path]/route.ts`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/api/proxy/[...path]/route.ts)
- Cookies forwarded: `access_token`, `refresh_token` only

---

### 9. Session 2 Verification Checklist

- [x] Backend starts without errors: `node -e "require('./src/app')"` → clean
- [x] Route exists: `GET /api/v1/website-builder/ui-blocks` → returns `401` (not `404`) when unauthenticated
- [x] DB has `pricing-plans` saved with `is_visible = 0` after toggle OFF + Save
- [x] `block_key` mapping bug fixed in `useUiBlocks.ts` — sidebar hides items correctly
- [x] All 18 sidebar items tagged with correct `uiBlockKey`
- [x] Empty DB edge case handled (no items hidden before first save)
- [x] Parent group items (Pages, Contact Us) use `uiBlockKey` on the parent — entire group hides when toggled OFF

---

### 10. Templates & Template Categories Module

> **Date:** 2026-07-27 | **Module:** Invitation Card & Event Website Templates

#### 🗄️ Database Tables (`scratch/setup_templates_raw.js`)
Executed raw SQL migrations directly on **Local MySQL** (`localhost:3306`) and **Production Aiven MySQL**:
1. `company_template_categories`: `id`, `company_id`, `name`, `slug`, `description`, `icon`, `color`, `sort_order`, `is_active`
2. `company_templates`: `id`, `company_id`, `category_id`, `template_name`, `slug`, `description`, `template_type`, `design_style`, `primary_color`, `thumbnail_url`, `template_file_url`, `preview_url`, `is_active`, `allow_customize`, `is_draft`, `is_popular`, `sort_order`

#### 🔌 Backend APIs (`companyWebsiteBuilder.controller.js` & `companyWebsiteBuilder.routes.js`)
- `GET /api/v1/website-builder/templates/categories` — List template categories
- `POST /api/v1/website-builder/templates/categories` — Create category
- `PUT /api/v1/website-builder/templates/categories/:id` — Update category
- `DELETE /api/v1/website-builder/templates/categories/:id` — Delete category
- `GET /api/v1/website-builder/templates` — List templates with filtering (category, type, search)
- `GET /api/v1/website-builder/templates/:id` — Get template details
- `POST /api/v1/website-builder/templates` — Create template
- `PUT /api/v1/website-builder/templates/:id` — Update template
- `DELETE /api/v1/website-builder/templates/:id` — Delete template

#### ⚛️ Frontend Hooks & Pages (`src/hooks/useTemplates.ts`)
- **Features Builder Split Page Routes (`/features` & `/features/create`)**:
  1. **Features List Page Route** ([`/admin/website-builder/features/page.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/features/page.tsx)): Features management data table with search bar, toggle switches, menu ordering, and action buttons (`+ Add New Feature` & `Edit` linking to create page).
  2. **Add / Edit Feature Form Page Route** ([`/admin/website-builder/features/create/page.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/features/create/page.tsx)): 5 section cards with left-aligned headers 1-5, Right-Column Live Feature Card Preview, and dynamic save back to the features table.
- **How It Works Module (`/how-it-works`)**:
  1. **MySQL Database Table**: Created `company_website_how_it_works` table with fields `company_id`, `step_number`, `title`, `description`, `highlight_title`, `highlight_subtext`, `icon`, `illustration_url`, `is_active`, and `sort_order`. Seeded initial 4 steps.
  2. **Backend Controller & Routes**: Implemented `getHowItWorksSteps`, `createHowItWorksStep`, `updateHowItWorksStep`, `deleteHowItWorksStep`, and `replaceHowItWorksSteps` handlers in [`companyWebsiteBuilder.controller.js`](file:///D:/Jamal/Event_Management_Admin_Backend/src/controllers/companyWebsiteBuilder.controller.js) & [`companyWebsiteBuilder.routes.js`](file:///D:/Jamal/Event_Management_Admin_Backend/src/routes/companyWebsiteBuilder.routes.js).
  3. **Frontend React Query Hooks**: Added `useHowItWorksData()`, `useCreateHowItWorksStep()`, `useUpdateHowItWorksStep()`, `useDeleteHowItWorksStep()`, and `useSaveHowItWorksSteps()` in [`useHowItWorks.ts`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/hooks/useHowItWorks.ts).
  4. **Frontend Admin Page & Preview Modal** ([`/admin/website-builder/how-it-works/page.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/how-it-works/page.tsx)):
     - **Main Admin View** (1:1 with Screenshot 2): Numbered pink circle badges (`1`, `2`, `3`, `4`), Icon & Illustration change buttons, Title & Description inputs with character counters (`19/60`, `107/200`), Highlight Title & Subtext inputs (`15/30`, `16/30`), Active switch, duplicate, delete, and drag handle icons.
     - **Add Next Step Modal Dialog** (1:1 with Screenshot 1): Icon picker, Illustration thumbnail cards, Title, Description, Highlight Title, Highlight Subtext, Step Order, and Active switch toggle.
  5. **Website Builder FAQs Module (`/faqs`, `/faqs/create`, `/faqs/edit/[id]`, `/faqs/categories`)**:
     - **Dedicated MySQL Database Tables**: Created `company_website_faq_categories` and `company_website_faqs` tables (executed on local & production Aiven MySQL via `scratch/setup_website_builder_faqs_raw.js`) to keep Website Builder FAQs 100% isolated from core admin FAQs.
     - **Backend Controllers & Routes**: Implemented `getWebsiteFaqCategories`, `createWebsiteFaqCategory`, `updateWebsiteFaqCategory`, `deleteWebsiteFaqCategory`, `getWebsiteFaqs`, `getWebsiteFaqById`, `createWebsiteFaq`, `updateWebsiteFaq`, and `deleteWebsiteFaq` in [`companyWebsiteBuilder.controller.js`](file:///D:/Jamal/Event_Management_Admin_Backend/src/controllers/companyWebsiteBuilder.controller.js) & [`companyWebsiteBuilder.routes.js`](file:///D:/Jamal/Event_Management_Admin_Backend/src/routes/companyWebsiteBuilder.routes.js).
     - **Frontend React Query Hooks**: Created [`useWebsiteFaqs.ts`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/hooks/useWebsiteFaqs.ts) and [`useWebsiteFaqCategories.ts`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/hooks/useWebsiteFaqCategories.ts).
     - **Separate Page Routes**:
       1. **FAQs List Page** ([`/admin/website-builder/faqs/page.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/faqs/page.tsx)): 1:1 match with Screenshot 1 featuring search bar, category filter, status filter, category icon & color pills, status switches, order, and pagination.
       2. **Add / Edit FAQ Page** ([`/admin/website-builder/faqs/create/page.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/faqs/create/page.tsx) & `/edit/[id]`): 1:1 match with Screenshot 2 featuring 2-column layout (`1. FAQ Details` & `2. Settings`), counted question input (`0/200`), tags input, rich answer editor (`0/2000`), status switch, display order, featured toggle, and save handler.
       3. **FAQ Categories Page** ([`/admin/website-builder/faqs/categories/page.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/faqs/categories/page.tsx)): 1:1 match with Screenshot 3 featuring categories data table and modal dialog with name (`0/50`), icon picker, description (`0/150`), color picker preview (`#7C3AED`), display order, and status switch.

---

## 📊 Live Production Audit & Verification Summary

| Module Name | Live Route URL | Status | Verification Findings |
|---|---|---|---|
| **Pricing Plans** | `/admin/website-builder/pricing-plans` | ✅ PASS | Data table, search bar, audience target filters, monthly/yearly pricing, active switches, and `/create` form view active. |
| **Features Builder** | `/admin/website-builder/features` | ✅ PASS | Split list view data table, search bar, status toggles, menu ordering, and `/create` form with 5 left-aligned header cards active. |
| **Event Templates** | `/admin/website-builder/templates` | ✅ PASS | Category filter pills, grid view, favorite hearts, invitation previews, template management, and `/create` form view active. |
| **How It Works** | `/admin/website-builder/how-it-works` | ✅ PASS | Numbered step cards `1`-`4`, Edit Pencil modal, Single Image Uploader, active Drag & Drop reordering, Public Output Preview modal, and dynamic green theme integration active. |
| **Website FAQs** | `/admin/website-builder/faqs` | ✅ PASS | 3 separate page routes (`/faqs`, `/create`, `/categories`), dedicated MySQL tables, search/filter bar, category pills, rich text answer editor, icon/color picker modal, and sidebar wiring active. |

---

## 11. Dedicated Status APIs & Lightweight Status Toggles

To optimize performance and avoid submitting full entity payloads on simple toggle switches, dedicated status toggle endpoints were created across all Website Builder modules in the backend:

### Backend Controller & Route Endpoints

| Entity Module | Dedicated Status API Endpoint | Controller Handler |
|---|---|---|
| **Pricing Plans** | `PATCH/PUT /api/v1/website-builder/pricing/plans/:id/status` | `updatePricingPlanStatus` |
| **Event Templates** | `PATCH/PUT /api/v1/website-builder/templates/:id/status` | `updateTemplateStatus` |
| **Template Categories** | `PATCH/PUT /api/v1/website-builder/templates/categories/:id/status` | `updateTemplateCategoryStatus` |
| **Features Builder** | `PATCH/PUT /api/v1/website-builder/features/:id/status` | `updateFeatureStatus` |
| **How It Works** | `PATCH/PUT /api/v1/website-builder/how-it-works/:id/status` | `updateHowItWorksStepStatus` |
| **Website FAQs** | `PATCH/PUT /api/v1/website-builder/faqs/:id/status` | `updateWebsiteFaqStatus` |
| **FAQ Categories** | `PATCH/PUT /api/v1/website-builder/faq-categories/:id/status` | `updateWebsiteFaqCategoryStatus` |

---

## 12. Reusable `BuilderDataTable` Component (`_components/builder-data-table.tsx`)

File: [`src/app/admin/website-builder/_components/builder-data-table.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/builder-data-table.tsx)

### Key Capabilities & Props Architecture:
1. **Live Search Bar**: Search input with debounced query updates (`searchQuery`, `onSearchChange`).
2. **Filter Select Dropdowns**: Array of `FilterConfig` objects rendering Radix/Shadcn Select dropdowns (`value`, `onChange`, `options`).
3. **Interactive Pagination**: Footer bar showing entry counts (`Showing X to Y of N entries`), Previous button, page buttons, Next button (`pageSize = 10`).
4. **Drag & Drop Reordering**: Row reordering handles (`GripVertical`) with visual drag indicators (`opacity-50`) and `onReorder` callbacks.
5. **Column Cell Renderers**: Strongly typed `Column<T>[]` definitions supporting custom cell JSX, header titles, and alignment classes.

---

## 13. Auto-Migrations for Large Payload Assets (`LONGTEXT`)

Backend Controller: [`companyWebsiteBuilder.controller.js`](file:///D:/Jamal/Event_Management_Admin_Backend/src/controllers/companyWebsiteBuilder.controller.js)

To prevent MySQL `WARN_DATA_TRUNCATED` errors when uploading base64 data URLs for thumbnail artworks, custom icons, or template file packages:
1. `ensureTemplatesTable()` — Modifies `thumbnail_url`, `template_file_url`, `preview_url`, `description` to `LONGTEXT`.
2. `ensureFeaturesTable()` — Modifies `icon`, `custom_icon_url`, `feature_image_url`, `image_url`, `short_description`, `detailed_description` to `LONGTEXT`.
3. `ensureHowItWorksTable()` — Modifies `icon`, `illustration_url`, `description` to `LONGTEXT`.

---

## 14. List Pages Updated Matrix

| List Page Route | Drag & Drop | Pagination | Live Search | Status Toggle API | Reusable Component |
|---|:---:|:---:|:---:|:---:|:---:|
| `/admin/website-builder/templates` | ✅ | ✅ | ✅ | ✅ | `templates/page.tsx` |
| `/admin/website-builder/templates/categories` | ✅ | ✅ | ✅ | ✅ | `BuilderDataTable` |
| `/admin/website-builder/features` | ✅ | ✅ | ✅ | ✅ | `features/page.tsx` |
| `/admin/website-builder/pricing-plans` | ✅ | ✅ | ✅ | ✅ | `pricing-plans/page.tsx` |
| `/admin/website-builder/how-it-works` | ✅ | ✅ | ✅ | ✅ | `how-it-works/page.tsx` |
| `/admin/website-builder/faqs` | ✅ | ✅ | ✅ | ✅ | `faqs/page.tsx` |

---

## 🚀 Blueprint Checklist: Creating a New Website Builder Module

Whenever creating a **NEW Website Builder Module** in this codebase, follow this exact 5-step blueprint:

### Step 1: Database Migration Helper (`companyWebsiteBuilder.controller.js`)
Create an `ensure<ModuleName>Table()` auto-migration function that executes `CREATE TABLE IF NOT EXISTS` and alters text/image columns to `LONGTEXT`:
```js
const ensureNewModuleTable = async () => {
    try {
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS company_website_new_module (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_id INT NOT NULL DEFAULT 1,
                title VARCHAR(255) NOT NULL,
                description LONGTEXT NULL,
                image_url LONGTEXT NULL,
                is_active TINYINT(1) DEFAULT 1,
                sort_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        await sequelize.query(`ALTER TABLE company_website_new_module MODIFY COLUMN image_url LONGTEXT NULL;`).catch(() => {});
    } catch (err) {
        console.error('Error ensuring new_module table:', err);
    }
};
```

### Step 2: Backend Controller Handlers & Dedicated Status API
Implement raw SQL CRUD + dedicated status update handler:
```js
const getNewModuleItems = asyncHandler(async (req, res) => {
    await ensureNewModuleTable();
    const companyId = getCompanyId(req);
    const rows = await sequelize.query(
        'SELECT * FROM company_website_new_module WHERE company_id = ? ORDER BY sort_order ASC, id ASC',
        { replacements: [companyId], type: QueryTypes.SELECT }
    );
    return ApiResponse.success(res, rows.map(parseRow), 'Items retrieved');
});

const updateNewModuleItemStatus = asyncHandler(async (req, res) => {
    const companyId = getCompanyId(req);
    const { id } = req.params;
    const { is_active } = req.body || {};
    const isActiveVal = (is_active === false || is_active === 0 || is_active === '0') ? 0 : 1;

    await sequelize.query(
        'UPDATE company_website_new_module SET is_active = ? WHERE id = ? AND company_id = ?',
        { replacements: [isActiveVal, id, companyId], type: QueryTypes.UPDATE }
    );

    return ApiResponse.success(res, { id, is_active: isActiveVal === 1 }, 'Status updated successfully');
});
```

### Step 3: Register Routes (`companyWebsiteBuilder.routes.js`)
```js
router.get('/new-module', controller.getNewModuleItems);
router.post('/new-module', controller.createNewModuleItem);
router.put('/new-module/:id', controller.updateNewModuleItem);
router.patch('/new-module/:id/status', controller.updateNewModuleItemStatus);
router.put('/new-module/:id/status', controller.updateNewModuleItemStatus);
router.delete('/new-module/:id', controller.deleteNewModuleItem);
```

### Step 4: Frontend TanStack React Query Hooks (`useNewModule.ts`)
```ts
export function useToggleNewModuleStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, is_active }: { id: string | number; is_active: boolean }) => {
            const res = await apiClient.patch(`/website-builder/new-module/${id}/status`, { is_active });
            return res.data;
        },
        onSuccess: () => {
            toast.success('Status updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['website-builder-new-module'] });
        },
    });
}
```

### Step 5: Frontend List & Form Pages with `BuilderDataTable` & Spinner Button
Use `BuilderDataTable` in the list page with live search, filters, pagination, and drag-and-drop handles. Use the mandatory Save Spinner button on form submits:
```tsx
<Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground">
    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
    {isSaving ? 'Saving...' : 'Save Item'}
</Button>
```


