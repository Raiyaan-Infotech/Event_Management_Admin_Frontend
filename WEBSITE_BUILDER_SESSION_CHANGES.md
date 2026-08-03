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

---

## Session 3 — Full CRUD Hooks, Create/Edit Pages, & Complete Module Reference

> **Date:** 2026-07-28 | **Frontend:** `D:\Jamal\Event_Management_Admin_Frontend` | **Backend:** `D:\Jamal\Event_Management_Admin_Backend`

---

### 15. Complete Backend Routes Reference (`companyWebsiteBuilder.routes.js`)

File: [`companyWebsiteBuilder.routes.js`](file:///D:/Jamal/Event_Management_Admin_Backend/src/routes/companyWebsiteBuilder.routes.js)

All routes mount under `/api/v1/website-builder/` with `isAuthenticated + extractCompanyContext` middleware applied globally via `router.use(...)`.

| Method | Path | Controller Handler |
|---|---|---|
| GET / PUT | `/ui-blocks` | `getUiBlocks`, `saveUiBlocks` |
| GET / PUT | `/pricing/settings` | `getPricingSettings`, `savePricingSettings` |
| GET / PUT | `/pricing/plans` | `getPricingPlans`, `savePricingPlans` |
| PATCH / PUT | `/pricing/plans/:id/status` | `updatePricingPlanStatus` |
| DELETE | `/pricing/plans/:id` | `deletePricingPlan` |
| GET / PUT | `/pricing/matrix-features` | `getPricingMatrixFeatures`, `savePricingMatrixFeatures` |
| GET / POST / PUT | `/features` | `getFeatures`, `createFeature`, `replaceFeatures` |
| PUT | `/features/:id` | `updateFeature` |
| PATCH / PUT | `/features/:id/status` | `updateFeatureStatus` |
| DELETE | `/features/:id` | `deleteFeature` |
| GET / POST | `/templates/categories` | `getTemplateCategories`, `createTemplateCategory` |
| PUT | `/templates/categories/:id` | `updateTemplateCategory` |
| PATCH / PUT | `/templates/categories/:id/status` | `updateTemplateCategoryStatus` |
| DELETE | `/templates/categories/:id` | `deleteTemplateCategory` |
| GET / POST | `/templates` | `getTemplates`, `createTemplate` |
| GET | `/templates/:id` | `getTemplateById` |
| PUT | `/templates/:id` | `updateTemplate` |
| PATCH / PUT | `/templates/:id/status` | `updateTemplateStatus` |
| DELETE | `/templates/:id` | `deleteTemplate` |
| GET / POST / PUT | `/how-it-works` | `getHowItWorksSteps`, `createHowItWorksStep`, `replaceHowItWorksSteps` |
| PUT | `/how-it-works/:id` | `updateHowItWorksStep` |
| PATCH / PUT | `/how-it-works/:id/status` | `updateHowItWorksStepStatus` |
| DELETE | `/how-it-works/:id` | `deleteHowItWorksStep` |
| GET / POST | `/faq-categories` | `getWebsiteFaqCategories`, `createWebsiteFaqCategory` |
| PUT | `/faq-categories/:id` | `updateWebsiteFaqCategory` |
| PATCH / PUT | `/faq-categories/:id/status` | `updateWebsiteFaqCategoryStatus` |
| DELETE | `/faq-categories/:id` | `deleteWebsiteFaqCategory` |
| GET / POST | `/faqs` | `getWebsiteFaqs`, `createWebsiteFaq` |
| GET | `/faqs/:id` | `getWebsiteFaqById` |
| PUT | `/faqs/:id` | `updateWebsiteFaq` |
| PATCH / PUT | `/faqs/:id/status` | `updateWebsiteFaqStatus` |
| DELETE | `/faqs/:id` | `deleteWebsiteFaq` |

---

### 16. Complete Frontend React Query Hooks Reference

#### [`useFeatures.ts`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/hooks/useFeatures.ts)

**TypeScript Interface — `FeatureItem`:**
```ts
export interface FeatureItem {
    id?: number | string;
    title: string;
    short_description: string;
    detailed_description?: string;
    icon: string;
    custom_icon_url?: string;
    feature_image_url?: string;
    image_url?: string;
    bullet_points_json: string[];
    show_in_menu: boolean;
    menu_order: number;
    status: 'Active' | 'Inactive' | 'Draft';
    sort_order?: number;
    is_active?: boolean;
    created_by?: string;
    created_on?: string;
}
```

**All Exported Hooks:**
| Hook | Method | Endpoint | Purpose |
|---|---|---|---|
| `useFeaturesData()` | GET | `/website-builder/features` | Fetch all features list |
| `useCreateFeature()` | POST | `/website-builder/features` | Create single feature |
| `useUpdateFeature()` | PUT | `/website-builder/features/:id` | Update single feature |
| `useDeleteFeature()` | DELETE | `/website-builder/features/:id` | Delete feature by ID |
| `useSaveFeaturesList()` | PUT | `/website-builder/features` (bulk) | Replace all features (bulk save) |
| `useToggleFeatureStatus()` | PATCH | `/website-builder/features/:id/status` | Toggle active/inactive status |
| `useToggleFeatureMenu()` | PUT | `/website-builder/features/:id` | Toggle show_in_menu visibility |

> ⚠️ **Status Toggle Fallback Pattern:** `useToggleFeatureStatus()` catches `404` and falls back to a full `PUT` update — same pattern used in `useToggleTemplateStatus` and `useToggleTemplateCategoryStatus`.

---

#### [`useHowItWorks.ts`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/hooks/useHowItWorks.ts)

**TypeScript Interface — `HowItWorksStep`:**
```ts
export interface HowItWorksStep {
    id?: number | string;
    step_number: number;
    title: string;
    description: string;
    highlight_title?: string;
    highlight_subtext?: string;
    icon?: string;
    illustration_url?: string;
    is_active?: boolean;
    sort_order?: number;
}
```

**All Exported Hooks:**
| Hook | Method | Endpoint | Purpose |
|---|---|---|---|
| `useHowItWorksData()` | GET | `/website-builder/how-it-works` | Fetch all steps |
| `useCreateHowItWorksStep()` | POST | `/website-builder/how-it-works` | Create a new step |
| `useUpdateHowItWorksStep()` | PUT | `/website-builder/how-it-works/:id` | Update a step by ID |
| `useDeleteHowItWorksStep()` | DELETE | `/website-builder/how-it-works/:id` | Delete a step by ID |
| `useSaveHowItWorksSteps()` | PUT | `/website-builder/how-it-works` (bulk) | Bulk replace all steps + reorder |
| `useToggleHowItWorksStatus()` | PATCH | `/website-builder/how-it-works/:id/status` | Toggle active/inactive per step |

---

#### [`useTemplates.ts`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/hooks/useTemplates.ts)

**TypeScript Interfaces:**
```ts
export interface TemplateCategory {
    id?: number;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
    sort_order?: number;
    is_active?: boolean;
    templates_count?: number;
}

export interface Template {
    id?: number;
    category_id?: number | null;
    category_name?: string;
    template_name: string;
    slug?: string;
    description?: string;
    template_type: 'wedding' | 'engagement' | 'birthday' | 'anniversary' | 'baby_shower' | 'corporate' | 'festival' | 'other';
    design_style: 'classic' | 'modern' | 'minimal' | 'floral' | 'traditional';
    primary_color: string;
    thumbnail_url?: string;
    template_file_url?: string;
    preview_url?: string;
    is_active?: boolean;
    allow_customize?: boolean;
    is_draft?: boolean;
    is_popular?: boolean;
    sort_order?: number;
}
```

**All Exported Hooks:**
| Hook | Method | Endpoint | Purpose |
|---|---|---|---|
| `useTemplateCategories()` | GET | `/website-builder/templates/categories` | Fetch all categories |
| `useSaveTemplateCategory()` | POST/PUT | `/website-builder/templates/categories[/:id]` | Create or update category |
| `useDeleteTemplateCategory()` | DELETE | `/website-builder/templates/categories/:id` | Delete category |
| `useToggleTemplateCategoryStatus()` | PATCH | `/website-builder/templates/categories/:id/status` | Toggle category status |
| `useTemplates(params?)` | GET | `/website-builder/templates[?filters]` | Fetch templates with optional filtering |
| `useTemplateById(id?)` | GET | `/website-builder/templates/:id` | Fetch single template (edit mode) |
| `useSaveTemplate()` | POST/PUT | `/website-builder/templates[/:id]` | Create or update template |
| `useDeleteTemplate()` | DELETE | `/website-builder/templates/:id` | Delete template |
| `useToggleTemplateStatus()` | PATCH | `/website-builder/templates/:id/status` | Toggle template active status |

**Filter Params for `useTemplates()`:**
```ts
useTemplates({
    category_id?: number,
    template_type?: string,  // 'wedding' | 'engagement' | 'birthday' | etc.
    search?: string,
})
```

---

#### [`useWebsiteFaqs.ts`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/hooks/useWebsiteFaqs.ts) & [`useWebsiteFaqCategories.ts`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/hooks/useWebsiteFaqCategories.ts)

**Hooks:**
| Hook | Method | Endpoint | Purpose |
|---|---|---|---|
| `useWebsiteFaqCategories()` | GET | `/website-builder/faq-categories` | Fetch all FAQ categories |
| `useSaveWebsiteFaqCategory()` | POST/PUT | `/website-builder/faq-categories[/:id]` | Create/update FAQ category |
| `useDeleteWebsiteFaqCategory()` | DELETE | `/website-builder/faq-categories/:id` | Delete FAQ category |
| `useWebsiteFaqs(params?)` | GET | `/website-builder/faqs[?filters]` | Fetch FAQs with filters |
| `useSaveWebsiteFaq()` | POST/PUT | `/website-builder/faqs[/:id]` | Create/update FAQ |
| `useDeleteWebsiteFaq()` | DELETE | `/website-builder/faqs/:id` | Delete FAQ |

---

### 17. Complete Frontend Admin Pages Reference

| Route | File | Description |
|---|---|---|
| `/admin/website-builder/features` | [`features/page.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/features/page.tsx) | Features list table with search, status toggle, menu toggle, edit/delete actions |
| `/admin/website-builder/features/create` | [`features/create/page.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/features/create/page.tsx) | Features form with 5 section cards + live right-column preview |
| `/admin/website-builder/templates` | [`templates/page.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/templates/page.tsx) | Templates list with table/grid view switcher, category+type filters, search, status toggle, pagination, drag & drop |
| `/admin/website-builder/templates/create` | [`templates/create/page.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/templates/create/page.tsx) | Template create/edit form with type cards, design style grid, color picker, thumbnail upload, live preview switcher |
| `/admin/website-builder/templates/categories` | [`templates/categories/page.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/templates/categories/page.tsx) | Template categories table with modal dialog for create/edit |
| `/admin/website-builder/how-it-works` | [`how-it-works/page.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/how-it-works/page.tsx) | How It Works step cards with inline editing, drag & drop reorder, Add/Edit modals, icon picker, illustration uploader |
| `/admin/website-builder/pricing-plans` | [`pricing-plans/page.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/pricing-plans/page.tsx) | Pricing plans list via `pricing-plans-content.tsx` |
| `/admin/website-builder/pricing-plans/create` | [`pricing-plans/create/page.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/pricing-plans/create/page.tsx) | Pricing plan create/edit form with plan type, billing cycle, features list, badge, live card preview |
| `/admin/website-builder/faqs` | [`faqs/page.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/faqs/page.tsx) | FAQs list with search, category filter, status filter, pagination |
| `/admin/website-builder/faqs/create` | [`faqs/create/page.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/faqs/create/page.tsx) | FAQ create/edit 2-column form |
| `/admin/website-builder/faqs/categories` | [`faqs/categories/page.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/faqs/categories/page.tsx) | FAQ categories table + modal |

---

### 18. Feature-by-Feature Page Implementation Details

#### 🟢 Features List Page (`features/page.tsx`)
- **Breadcrumb:** `Dashboard › Website Builder › Features List`
- **Table Columns:** `#` (with GripVertical drag handle), `Icon` (colored primary/10 icon box), `Feature Title` (bold), `Short Description` (truncated), `Show in Menu` (Switch toggle → `useToggleFeatureMenu`), `Menu Order` (number), `Status` (Switch + Badge pill: emerald=Active, slate=Inactive), `Actions` (Pencil edit → `/create?id=X`, Trash delete → `DeleteDialog`)
- **Hooks Used:** `useFeaturesData`, `useToggleFeatureStatus`, `useToggleFeatureMenu`, `useDeleteFeature`
- **Icon Presets:** `calendar`, `map-pin`, `users`, `image`, `message`, `gift`, `video`, `music`, `heart`, `bell`, `scan`, `qr-code`

#### 🟢 Templates List Page (`templates/page.tsx`)
- **Breadcrumb:** `Dashboard › Website Builder › Event Templates`
- **Header Actions:** `Categories` outline button (→ `/templates/categories`), `Add Template` primary button (→ `/templates/create`)
- **Filters:** Search input (`w-56`), Category `<Select>` filter (dynamic from `useTemplateCategories`), Type `<Select>` filter (wedding / engagement / birthday / anniversary / baby_shower / corporate / festival), View switcher (Table `<List>` / Grid `<LayoutGrid>`)
- **Table Columns:** `#` (GripVertical + index), `Preview` (12×9 thumbnail img OR color-bg name card), `Template Name` (+ 🔥 Popular badge), `Category` (primary/10 pill), `Type` (muted cap badge), `Style` (purple-500/10 badge), `Customizable` (Yes=emerald/No=muted), `Status` (Switch → `useToggleTemplateStatus`), `Actions` (Pencil → `/create?id=X`, Trash → `DeleteDialog`)
- **Grid View:** 4-column responsive color-bg cards with type, name, edit & delete buttons
- **Pagination:** Interactive footer with Previous / page buttons / Next (10 per page)
- **Hooks Used:** `useTemplates`, `useTemplateCategories`, `useSaveTemplate`, `useToggleTemplateStatus`, `useDeleteTemplate`

#### 🟢 Templates Create/Edit Page (`templates/create/page.tsx`)
- **URL Pattern:** `/admin/website-builder/templates/create` (new) or `/create?id=123` (edit — loads via `useTemplateById`)
- **Form Sections (left column):**
  1. **Template Type Cards:** 5 type selector cards (`wedding`, `engagement`, `birthday`, `anniversary`, `other`) with icon + label
  2. **Basic Info:** `Template Name` (counted, max 100), `Category` (`<Select>` from `useTemplateCategories`), `Description` (counted textarea, max 300)
  3. **Design Style Grid:** 5 style cards (`classic`, `modern`, `minimal`, `floral`, `traditional`) with gradient preview backgrounds
  4. **Visual Settings:** `Primary Color` hex color picker (`<input type="color">`), `Thumbnail Image` upload (base64 `FileReader`), `Preview URL` input, `Template File URL` input
  5. **Options:** `Allow Customization` switch, `Mark as Popular` switch, `Published` (is_active) switch, `Draft Mode` (is_draft) switch
- **Live Preview (right column):** Device switcher (🖥️ Desktop / 📱 Mobile), styled invitation card with dynamic `primary_color` background, template name, category, style badges
- **Save Logic:** Uses `useSaveTemplate()` — detects edit mode via `?id=` query param. On success, redirects back to `/admin/website-builder/templates`

#### 🟢 How It Works Page (`how-it-works/page.tsx`)
- **Header Actions:** `Preview` outline button (opens public output modal), `Add Next Step` primary button (opens Add Modal), `Save All Steps` emerald button (with `<Loader2 animate-spin />` spinner)
- **Step Card Layout (12-col grid per card):**
  - Col 1-2: **Step Number Badge** (rounded-full bg-primary circle), **Icon Box** (rounded-full bg-primary/10, 14×14), `Change` button → inline icon picker popover
  - Col 3-4: **Illustration Box** (14×24 rounded-xl thumbnail), `Change Image` label button → `<input type="file" hidden>` (FileReader → base64)
  - Col 5-9: **Title** (`BuilderCountedInput`, max 60) + **Description** (`BuilderCountedTextarea`, max 200)
  - Col 10-12: **Highlight Title** (`BuilderCountedInput`, max 30) + **Highlight Subtext** (`BuilderCountedInput`, max 30)
  - Right column: Active `<Switch>`, `<GripVertical>` drag handle, Edit `<Pencil>` button (→ Edit Modal), Delete `<Trash2>` button (→ `DeleteDialog`)
- **Drag & Drop:** `draggable={true}`, `onDragStart/onDragOver/onDrop` handlers — on drop calls `useSaveHowItWorksSteps(updated)` immediately + `toast.success`
- **Icon Presets:** `gift`, `sparkles`, `share-2`, `qr-code`, `sliders`, `image`, `zap`, `heart`
- **Add Modal (Dialog):** Icon picker box + Single image upload + Title + Description + Highlight Title + Highlight Subtext + Step Order + Active switch → calls `useCreateHowItWorksStep()`
- **Edit Modal (Dialog):** Same form pre-filled from `steps[editingStepIdx]` → calls `useUpdateHowItWorksStep()` if `target.id` exists
- **Inline Active Toggle:** Immediately calls `useToggleHowItWorksStatus()` when `<Switch>` changes
- **Validation:** All 4 text fields required; inline `border-red-500 ring-1 ring-red-500 bg-red-50/20` error state on blank fields
- **Hooks Used:** `useHowItWorksData`, `useCreateHowItWorksStep`, `useUpdateHowItWorksStep`, `useDeleteHowItWorksStep`, `useSaveHowItWorksSteps`, `useToggleHowItWorksStatus`

#### 🟢 Pricing Plans Create/Edit Page (`pricing-plans/create/page.tsx`)
- **URL Pattern:** `/admin/website-builder/pricing-plans/create` (new) or `/create?id=123` (edit)
- **Breadcrumb:** `Dashboard › Website Builder › Pricing Plans › Add New Plan`
- **Form Sections (left column, numbered cards):**
  1. **Basic Information:** Plan Name (counted, max 60), Plan Subtitle (counted, max 120), Plan For cards (`Individuals` / `Companies`)
  2. **Pricing Details:** Currency `<Select>` (₹ INR, $ USD, € EUR, £ GBP), Price Monthly (number input), Price Yearly (number input), Period Label input (`/month`)
  3. **Plan Settings:** `Popular Plan` switch, `Active Plan` switch, Badge Text (counted, max 25), Badge Style cards (Filled / Outline / Soft Filled / Soft Outline)
  4. **Features & Limits:** `+ Add Feature` input row → appends `PlanFeatureItem` to list; each feature has text + included checkbox + delete
  5. **Preview:** Device switcher (Monitor / Smartphone), live pricing card with dynamic styles
- **Save Logic:** Merges edited plan back into `dbPlans` array, calls `useSavePricingPlans(updatedPlans)` — on success redirects to `/admin/website-builder/pricing-plans`

---

### 19. Reusable Component: `builder-data-table.tsx`

File: [`_components/builder-data-table.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/builder-data-table.tsx)

```ts
// Core Props Interface
interface BuilderDataTableProps<T> {
    columns: Column<T>[];           // Typed column definitions with custom cell renderers
    data: T[];                      // Generic row data array
    isLoading?: boolean;            // Shows spinner loader row
    searchQuery?: string;           // Controlled search input value
    onSearchChange?: (v: string) => void;  // Search change handler
    filters?: FilterConfig[];       // Array of dropdown filter configs
    onReorder?: (from: number, to: number) => void;  // Drag-and-drop reorder callback
    pageSize?: number;              // Defaults to 10
    emptyMessage?: string;          // Empty state message text
}

interface Column<T> {
    key: string;
    header: string;
    align?: 'left' | 'center' | 'right';
    render: (row: T, idx: number) => React.ReactNode;
}

interface FilterConfig {
    value: string;
    onChange: (val: string) => void;
    options: { label: string; value: string }[];
    placeholder?: string;
    width?: string;
}
```

---

### 20. Complete `_components/` Directory Reference

| File | Purpose |
|---|---|
| [`advance-slider-content.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/advance-slider-content.tsx) | Advance slider form with multiple slides, button link mode |
| [`builder-data-table.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/builder-data-table.tsx) | Reusable generic table with search, filters, pagination, drag & drop |
| [`builder-field.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/builder-field.tsx) | `BuilderCountedInput` + `BuilderCountedTextarea` — character-counted form field components |
| [`draggable-item-list.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/draggable-item-list.tsx) | Reusable drag-and-drop list container |
| [`faq-categories-builder-content.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/faq-categories-builder-content.tsx) | FAQ categories table + modal (icon picker, color picker, status switch) |
| [`faq-form-content.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/faq-form-content.tsx) | FAQ create/edit 2-column form (question, tags, rich answer, settings) |
| [`faqs-list-content.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/faqs-list-content.tsx) | FAQs list table with search, category + status filters |
| [`features-content.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/features-content.tsx) | Old inline features content (superseded by split `features/page.tsx` + `features/create/page.tsx`) |
| [`footer-content.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/footer-content.tsx) | Footer settings form |
| [`gallery-content.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/gallery-content.tsx) | Gallery image upload + live preview with category filters |
| [`header-content.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/header-content.tsx) | Header/logo settings form |
| [`hero-section-content.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/hero-section-content.tsx) | Hero section form with button link mode (Page dropdown / Custom URL) |
| [`login-page-content.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/login-page-content.tsx) | Login page builder with Desktop/Mobile preview switcher |
| [`multi-select-pages.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/multi-select-pages.tsx) | Multi-select pages component for nav menu |
| [`nav-menu-content.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/nav-menu-content.tsx) | Nav menu items management |
| [`pricing-plans-content.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/pricing-plans-content.tsx) | Pricing plans matrix + plan list + add/edit form views |
| [`seo-content.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/seo-content.tsx) | SEO settings with keyword badges, robots meta, language select |
| [`simple-slider-content.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/simple-slider-content.tsx) | Simple slider slides management form |
| [`testimonials-content.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/testimonials-content.tsx) | Testimonials form + management table + live preview card |
| [`theme-color-content.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/theme-color-content.tsx) | Admin dashboard theme color picker (CSS variable injection) |
| [`ui-block-content.tsx`](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/ui-block-content.tsx) | Web UI Block visibility toggle controls + INITIAL_BLOCKS |

---

### 21. Key Patterns Summary (Quick Reference for Claude)

#### ✅ Standard API Client Import
```ts
import { apiClient } from '@/lib/api-client';
// All requests go through Next.js proxy → Backend
// apiClient.get('/website-builder/xxx')  →  /api/v1/website-builder/xxx
```

#### ✅ Standard TanStack Query Hook Pattern
```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

// Query key naming convention: ['website-builder-<module-name>']
export function useModuleData() {
    return useQuery({
        queryKey: ['website-builder-module-name'],
        queryFn: async () => {
            const res = await apiClient.get('/website-builder/module-name');
            return (res.data?.data || res.data || []) as ModuleItem[];
        },
    });
}

// Mutation with invalidation
export function useToggleModuleStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, is_active }: { id: string | number; is_active: boolean }) => {
            const res = await apiClient.patch(`/website-builder/module-name/${id}/status`, { is_active });
            return res.data;
        },
        onSuccess: () => {
            toast.success('Status updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['website-builder-module-name'] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || err.message || 'Error updating status.');
        },
    });
}
```

#### ✅ Standard `BuilderCountedInput` / `BuilderCountedTextarea` Usage
```tsx
import { BuilderCountedInput, BuilderCountedTextarea } from '../_components/builder-field';

<BuilderCountedInput
    label="Title"
    required
    placeholder="Enter title..."
    value={title}
    onChange={(val) => setTitle(val)}
    maxLength={60}
    inputClassName="!h-9 text-xs border-border bg-card text-foreground"
/>

<BuilderCountedTextarea
    label="Description"
    required
    placeholder="Enter description..."
    value={desc}
    onChange={(val) => setDesc(val)}
    maxLength={200}
    textareaClassName="min-h-[70px] text-xs border-border bg-card text-foreground"
/>
```

#### ✅ Standard Delete Dialog Usage
```tsx
import { DeleteDialog } from '@/components/common/delete-dialog';

<DeleteDialog
    open={deleteId !== null}
    onOpenChange={(open) => !open && setDeleteId(null)}
    onConfirm={confirmDelete}
    isDeleting={deleteMutation.isPending}
    title="Delete Item"
    description="Are you sure you want to delete this item? This action cannot be undone."
/>
```

#### ✅ Standard Page Header Pattern
```tsx
{/* Top Header Bar */}
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
    <div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <span>Dashboard</span><span>›</span>
            <span>Website Builder</span><span>›</span>
            <span className="font-semibold text-foreground">Module Name</span>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-foreground">Module Name</h1>
        <p className="text-xs text-muted-foreground">Module description text here.</p>
    </div>
    <div className="flex items-center gap-2">
        {/* Action Buttons */}
        <Button size="sm" disabled={isSaving} onClick={handleSave}
            className="h-9 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
    </div>
</div>
```

#### ✅ Standard Table Action Buttons Pattern
```tsx
{/* Edit Button */}
<Link href={`/admin/website-builder/module/create?id=${item.id}`}>
    <Button type="button" variant="outline" size="icon"
        className="h-8 w-8 rounded-lg p-0 border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 cursor-pointer">
        <Pencil className="h-3.5 w-3.5" />
    </Button>
</Link>

{/* Delete Button */}
<Button type="button" variant="outline" size="icon"
    onClick={() => item.id !== undefined && setDeleteId(item.id)}
    className="h-8 w-8 rounded-lg p-0 text-rose-500 border-rose-200 hover:bg-rose-50 hover:border-rose-300 cursor-pointer">
    <Trash2 className="h-3.5 w-3.5" />
</Button>
```

---

### 22. Database Tables — Full Reference

| Table | Key Columns | Module |
|---|---|---|
| `vendor_website_ui_blocks` | `id`, `vendor_id` (=companyId), `block_key`, `is_visible`, `sort_order` | UI Blocks |
| `company_website_pricing_settings` | `company_id`, `section_title`, `section_headings`, `yearly_discount_badge` | Pricing |
| `company_website_pricing_plans` | `company_id`, `plan_name`, `subtitle`, `target_type`, `price_monthly`, `price_yearly`, `features_json`, `is_popular`, `is_active` | Pricing Plans |
| `company_website_pricing_matrix_features` | `company_id`, `feature_name`, `plan_values_json` | Pricing Matrix |
| `company_website_features` | `company_id`, `title`, `short_description`, `icon`, `custom_icon_url`, `feature_image_url`, `bullet_points_json`, `show_in_menu`, `menu_order`, `status`, `is_active` | Features |
| `company_template_categories` | `company_id`, `name`, `slug`, `description`, `icon`, `color`, `sort_order`, `is_active` | Template Categories |
| `company_templates` | `company_id`, `category_id`, `template_name`, `slug`, `description`, `template_type`, `design_style`, `primary_color`, `thumbnail_url`, `template_file_url`, `preview_url`, `is_active`, `allow_customize`, `is_draft`, `is_popular`, `sort_order` | Templates |
| `company_website_how_it_works` | `company_id`, `step_number`, `title`, `description`, `highlight_title`, `highlight_subtext`, `icon`, `illustration_url`, `is_active`, `sort_order` | How It Works |
| `company_website_faq_categories` | `company_id`, `name`, `slug`, `icon`, `color`, `description`, `sort_order`, `is_active` | FAQ Categories |
| `company_website_faqs` | `company_id`, `category_id`, `question`, `answer`, `tags_json`, `display_order`, `is_featured`, `status`, `is_active` | FAQs |

> ⚠️ **LONGTEXT Columns:** All `icon`, `illustration_url`, `thumbnail_url`, `template_file_url`, `custom_icon_url`, `feature_image_url`, `image_url`, `description` columns that store base64 data URLs are auto-migrated to `LONGTEXT` via `ensure<Module>Table()` auto-migration functions in the controller.

---

### 23. Session 3 Verification Checklist

- [x] All 9 database tables confirmed with full column reference
- [x] All 30+ backend API routes fully documented in routes reference table
- [x] `useFeatures.ts` — 7 hooks fully documented with `FeatureItem` interface
- [x] `useHowItWorks.ts` — 6 hooks fully documented with `HowItWorksStep` interface
- [x] `useTemplates.ts` — 9 hooks fully documented with `Template` + `TemplateCategory` interfaces
- [x] `useWebsiteFaqs.ts` + `useWebsiteFaqCategories.ts` — hooks documented
- [x] `templates/create/page.tsx` — full 5-section form + live preview documented
- [x] `pricing-plans/create/page.tsx` — full 5-section form + live card preview documented
- [x] `how-it-works/page.tsx` — inline editing, drag & drop, dual modal system documented
- [x] `features/page.tsx` — table with dual-switch (status + menu), icon presets documented
- [x] All 21 `_components/` files catalogued with purpose
- [x] All standard patterns (API client, TanStack Query, BuilderCountedInput, Delete Dialog, page header, action buttons) documented as reusable blueprints

---

## Session 4 — Website Builder Restructure, Page-First Navigation, Per-Page UI Blocks, Highlights Customization & Login CTA Modules

> **Date:** 2026-07-30 | **Backend:** `D:\Jamal\Event_Management_Admin_Backend` | **Frontend:** `D:\Jamal\Event_Management_Admin_Frontend`

---

### 1. Page-First Sidebar Navigation Restructure (`app-sidebar.tsx`)

File: [app-sidebar.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/admin/app-sidebar.tsx)

- **Architecture Change:** Reorganized the Website Builder sidebar so each core page is a parent collapsible item containing all its child sections in exact visual display sequence:
  - **Home**: Header, Navbar, Hero Section, Highlights (Outline), Template, Highlights (BG Filled), Testimonials, Login & Demo, Footer
  - **Features**: Header, Navbar, Hero Section, Features, Sign In with Price Plan, Highlights, Sign In & Demo, Footer
  - **Template**: Header, Navbar, Hero Section, Template, Sign In with Price Plan, Highlights, Footer
  - **Pricing**: Header, Navbar, Hero Section, Plans & Pricing, Plan Features, Highlights, Contact & Signup Demo, Footer
  - **How It's Work**: Header, Navbar, Hero Section, Videos, Highlights, Signup Demo, Footer
  - **Contact**: Header, Navbar, Hero Section, Highlights, Contact form with Map, FAQ's, Chat & Signup Demo, Footer
- **Parent-Level General & Settings**: Promoted **Theme Color**, **SEO Settings**, **Login Page**, and **Custom Pages** directly to parent-level items under Website Builder.

---

### 2. Per-Page UI Blocks Manager (`ui-block-content.tsx` & `ui-block/[page]/page.tsx`)

Files: [ui-block-content.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/ui-block-content.tsx), [page.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/ui-block/[page]/page.tsx)

- **Dynamic Page Route**: Created `/admin/website-builder/ui-block/[page]` supporting per-page UI block configuration (`home`, `features`, `template`, `pricing`, `how-it-works`, `contact`).
- **Page Tabs Control**: Rendered top segmented page tabs (`Home`, `Features`, `Template`, `Pricing`, `How It Works`, `Contact`) with instant URL navigation.
- **Fixed Global Sections**: Header, Navbar, Hero Section, and Footer rendered as fixed, required global rows.
- **`pageSlug` Query Support in `useUiBlocks.ts`**: Updated `useUiBlocksData(pageSlug)` and `useSaveUiBlocks()` to pass `?page_slug={slug}` query parameters to backend `/website-builder/ui-blocks`.

---

### 3. Highlights Customization Module (`useHighlights.ts` & `highlights-content.tsx`)

Files: [useHighlights.ts](file:///d:/Jamal/Event_Management_Admin_Frontend/src/hooks/useHighlights.ts), [highlights-content.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/highlights-content.tsx), [page.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/highlights/[page]/[instance]/page.tsx)

- **Raw SQL Database Migration**: Executed `scratch/setup_highlights_table_raw.js` creating `company_website_highlights` on both Local MySQL and Live Production MySQL (Aiven Cloud):
  ```sql
  CREATE TABLE IF NOT EXISTS company_website_highlights (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      page_slug VARCHAR(100) NOT NULL,
      instance INT DEFAULT 1,
      settings_json LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY company_page_instance (company_id, page_slug, instance)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  ```
- **Backend API Endpoints**:
  - `GET /api/v1/website-builder/highlights?page_slug={slug}&instance={id}`
  - `PUT /api/v1/website-builder/highlights`
- **Full Customizer Admin Panel**:
  - 4 configuration cards: `1. Highlight Items Manager` (add/edit/delete/reorder items, Lucide icon selector, title & description inputs), `2. Layout & Alignment` (items per row 2-6, icon shape circle/square/rounded, icon style filled/outline, alignment left/center/right), `3. Color Customization` (icon bg color, icon color, title color, description color pickers), `4. Background Settings & Presets` (solid, gradient, image background + overlay opacity slider).
  - Live interactive preview panel with real-time style rendering.
  - Save button with animated `<Loader2 className="animate-spin" />` spinner and dynamic theme tokens (`bg-primary text-primary-foreground`).

---

### 4. Live Preview Section Components (`highlights-section.tsx` & `login-demo-section.tsx`)

Files: [highlights-section.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/company-website-preview/sections/highlights-section.tsx), [login-demo-section.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/company-website-preview/sections/login-demo-section.tsx)

- **`HighlightsSection` Component**: Reads live customized settings via `useHighlights(pageSlug, instance)` and renders exact items, icons, colors, layout grid, and background styles.
- **`LoginDemoSection` Component**: Created 5 page-specific static CTA variants:
  - `LoginDemoSection` (Home page CTA)
  - `SignInDemoSection` (Features & Template pages CTA)
  - `ContactSignupDemoSection` (Pricing page CTA)
  - `SignupDemoSection` (How It Works page CTA)
  - `ChatSignupDemoSection` (Contact page CTA)

---

### 5. Multi-Page Live Website Preview (`company-website-preview.tsx`)

File: [company-website-preview.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/company-website-preview/company-website-preview.tsx)

- Updated live preview renderer (`pageContents`) to support full multi-page section sequences for `home`, `features`, `template`, `pricing`, `how-it-works`, and `contact` pages with fixed Header, Navbar, Hero Section, and Footer across all page views.

---

### 6. Latest Session Enhancements & Database Optimizations

Files: [header-section.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/components/company-website-preview/sections/header-section.tsx), [nav-menu-content.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/nav-menu-content.tsx), [footer-content.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/footer-content.tsx), [testimonials-content.tsx](file:///d:/Jamal/Event_Management_Admin_Frontend/src/app/admin/website-builder/_components/testimonials-content.tsx), [useCompanyWebsiteBuilder.ts](file:///d:/Jamal/Event_Management_Admin_Frontend/src/hooks/useCompanyWebsiteBuilder.ts), [website_builder_db_optimizations.sql](file:///d:/Jamal/Event_Management_Admin_Frontend/docs/website_builder_db_optimizations.sql)

#### 🌐 Icon Preloading & Network Iconify API Integration
- Added `@iconify/react`'s `loadIcons` preloader inside `useEffect` across `header-section.tsx`, `footer-section.tsx`, and `contact-section.tsx` to explicitly fetch icon data over the network from `https://api.iconify.design`. Cleaned and lowercased icon keys (e.g. `simple-icons:facebook`).

#### ✂️ Logo Cropper Integration (`MediaCropDialog`)
- Integrated `MediaCropDialog` image cropper into both `NavMenuContent` (`nav-menu-content.tsx`) and `FooterContent` (`footer-content.tsx`).
- Selecting a logo opens the crop modal so users can crop, zoom, scale, and drag before saving. Added hover **Crop** actions on existing logo boxes to allow re-cropping via `/api/proxy-image`.

#### 🔄 Dual-Way Brand Synchronization (Nav Menu & Footer)
- Synchronized `company_name` and `logo_url` across both `basic_information` AND `footer_settings` endpoints. Updating logo/name in Nav Menu or Footer Settings automatically updates both modules and the Website Preview.

#### 🚀 React Query Caching & Database Indexing Optimizations
- **In-Memory Caching**: Configured `staleTime: 5 * 60 * 1000` (5 minutes) and `gcTime: 15 * 60 * 1000` in `useCompanyWebsiteBuilder.ts` to eliminate duplicate HTTP GET calls to `/website-builder/basic-information`.
- **Database Composite Indexes**: Applied composite B-Tree indexes across 16 `company_website_*` database tables on both Local MySQL (`localhost:3306`) and Live Production Aiven Cloud MySQL (`mysql-cbe9f33-jamaludheen779-4e61.k.aivencloud.com:15373`). Saved SQL script at [website_builder_db_optimizations.sql](file:///d:/Jamal/Event_Management_Admin_Frontend/docs/website_builder_db_optimizations.sql).

#### 💬 Testimonials Backend Persistence & Hardcoded Content Removal
- Connected `testimonials-content.tsx` to `useCompanyTestimonials()`, replacing dummy `setTimeout` saving with real `replaceTestimonials` backend API persistence.
- Connected customer photo inputs to `mediaApi.upload(file, 'website-builder')`.
- Completely removed hardcoded mock arrays (`initialTestimonials` / `DEFAULT_TESTIMONIALS`) so Testimonials render 100% real database records with a clean empty state UI when no testimonials exist in the database.


