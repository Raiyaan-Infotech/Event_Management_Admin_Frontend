# Event Management — Admin Frontend

> Next.js 15 admin panel for the Event Management platform. Handles company management, vendors, employees, events, subscriptions, FAQs, payments, settings, plugins, and translations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.1.0 (App Router) |
| Language | TypeScript 5.7.2 |
| UI | shadcn/ui + Radix UI |
| Styling | Tailwind CSS 3.4 |
| Icons | Lucide React |
| Data Fetching | TanStack React Query v5 |
| Tables | TanStack React Table v8 |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios (proxy: `/api/proxy/v1`) |
| Charts | Recharts |
| Maps | Leaflet + React Leaflet |
| Rich Text | React Quill |
| Themes | next-themes |
| Toasts | Sonner |
| Auth | Cookie-based JWT (access + refresh) |
| OAuth | @react-oauth/google |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Login, register, forgot/reset password, verify email
│   ├── admin/              # All admin panel pages
│   └── api/proxy/v1/       # Next.js API proxy to backend
├── components/
│   ├── admin/              # app-sidebar.tsx (main nav with permission + plugin checks)
│   ├── common/             # Reusable: tables, forms, editors, dialogs, map picker
│   ├── layout/             # navbar, footer, breadcrumb, top-header
│   ├── providers/          # appearance-provider (theme/colors), dynamic-head
│   ├── guards/             # Permission guard components
│   └── ui/                 # shadcn/ui primitives
├── contexts/               # CompanyContext (multi-tenant company switcher)
├── hooks/                  # 45+ custom hooks (see Hooks section below)
├── lib/
│   ├── api-client.ts       # Axios instance with interceptors
│   ├── query-client.ts     # React Query config + queryKeys factory
│   ├── auth-utils.ts       # Auth cookie helpers
│   └── helpers.ts          # General utilities
├── providers/              # QueryProvider, TranslationProvider
├── types/                  # TypeScript interfaces
└── middleware.ts           # Route protection (checks cookies)
```

---

## All Modules & Pages

### Authentication (`/auth/`)
| Route | Description |
|---|---|
| `/auth/login` | Admin login |
| `/auth/register` | User registration |
| `/auth/forgot-password` | OTP generation |
| `/auth/reset-password` | Password reset |
| `/auth/verify-email` | Email verification |

### Admin Panel (`/admin/`)

| Route | Module | Permission |
|---|---|---|
| `/admin` | Dashboard | — |
| `/admin/companies` | Companies (list, create, edit) | Developer only |
| `/admin/vendors` | Vendors (list, create, edit) | `vendors.view` |
| `/admin/platform/users` | Employees (list, create, edit) | `employees.view` |
| `/admin/menus` | Menus / Events | `menus.view` |
| `/admin/reports` | Reports | `reports.view` |
| `/admin/media` | Media library | `media.view` |
| `/admin/notifications` | Notifications | `notifications.view` |
| `/admin/mail` | Mail management | `mail.view` |
| `/admin/support` | Support tickets | `support.view` |
| `/admin/contact` | Contact submissions | `contact.view` |
| `/admin/subscriptions` | Subscription plans | `subscriptions.view` |
| `/admin/faqs` | FAQ list | `faqs.view` (plugin: faq) |
| `/admin/faq-categories` | FAQ categories | `faq_categories.view` |
| `/admin/payments` | Payment gateways | `payments.view` |
| `/admin/settings/*` | All settings modules | `settings.view` |
| `/admin/platform/roles` | Role management | — |
| `/admin/platform/modules` | Module management | — |
| `/admin/platform/activity-logs` | Activity logs | — |
| `/admin/plugins` | Plugin management | — |
| `/admin/approvals` | Approval requests | — |
| `/admin/profile` | User profile | — |

### Settings Sub-modules (`/admin/settings/`)
`general` · `admin-apperance` · `admin-settings` · `email` · `email/campaigns` · `currencies` · `languages` · `locations` · `media` · `phone` · `social-login` · `timezone` · `translations` · `translations/missing` · `website-tracking` · `cache` · `optimize` · `templates`

---

## API Integration

**Base URL:** `/api/proxy/v1` — proxies to backend at `NEXT_PUBLIC_API_URL`

**Axios interceptors:**
- Request: adds `X-Company-Id` header from localStorage (multi-tenant)
- Response: handles `202` / `approval_required: true` → throws `ApprovalRequiredError`
- Response: handles `401` → clears cookies → redirects to `/auth/login`

**Response shapes:**
```ts
ApiResponse<T>        { success, message?, data?, errors?, approval_required? }
PaginatedResponse<T>  { success, data: T[], pagination: { page, limit, totalItems, totalPages } }
```

**Generic API methods:** `api.get`, `api.getPaginated`, `api.post`, `api.put`, `api.patch`, `api.delete`

---

## Authentication Flow

1. Submit credentials → backend sets HTTP-only `access_token` + `refresh_token` cookies
2. Frontend sets `auth_pending=true` JS cookie (15 sec) for middleware bridging
3. `middleware.ts` checks for `access_token | refresh_token | auth_pending` on `/admin/*`
4. `useCurrentUser()` polls `/auth/me` every 30 seconds
5. 401 on any request → clear session → redirect to login
6. Logout → clear React Query cache + cookies → redirect to login

---

## Permission System

Hook: `usePermissionCheck()`

| Method | Description |
|---|---|
| `hasPermission(slug)` | Check single permission (developer/super_admin bypass all) |
| `hasAnyPermission(slugs[])` | At least one required |
| `hasAllPermissions(slugs[])` | All required |
| `isDeveloper()` | `role.slug === 'developer'` |
| `isSuperAdmin()` | `role.slug === 'super_admin'` |
| `hasMinLevel(n)` | `role.level >= n` |

**Permission format:** `module.action` — e.g. `vendors.view`, `employees.create`, `roles.delete`

**Role hierarchy levels:**
```
developer    → 1000 (full access, can switch company context)
super_admin  → 100  (bypasses approvals)
admin        → 50
subadmin     → 25
custom roles → 10
```

---

## Plugin System

Hook: `usePlugins()` / `useIsPluginActive(slug)`

- Each plugin has `slug`, `name`, `is_active`, `config_group`, `config_route`
- Sidebar menu items can be gated by `pluginSlug` — hidden when plugin inactive
- Config stored in Settings model; frontend config pages at `/admin/plugins/{slug}/config`

**Built-in plugins:** `stripe` · `twilio` · `google-maps` · `recaptcha` · `faq`

---

## Settings System

| Group | Purpose |
|---|---|
| `general` | App name, domain, default language/currency |
| `appearance` | Theme colors, logo, font |
| `admin-appearance` | Admin panel-specific theming |
| `email` | SMTP config |
| `cache` | Caching settings |
| `media` | Upload limits/formats |
| `phone` | SMS/Twilio config |
| `social-login` | Google/Facebook OAuth keys |
| `timezone` | Timezone settings |
| `translations` | Translation system config |
| `languages` | Language management |
| `website-tracking` | Analytics/tracking codes |

**Dynamic theming:** hex color → HSL → CSS variable injection via `appearance-provider.tsx`

---

## Translation / i18n

Hook: `useTranslation()` → `t(key, defaultValue?, variables?)`

- Translations fetched per language from backend
- Variable substitution: `t('greeting', { name: 'John' })`
- Missing keys auto-reported to backend (non-blocking)
- Language switching persists to General Settings
- Translation key groups: `nav`, `common`, `auth`, `forms`, + module-specific

---

## Custom Hooks (45+)

**Auth:** `useAuth` · `useCurrentUser` · `useLogin` · `useLogout` · `useRegister` · `useSmartLogin` · `useChangePassword` · `useForgotPassword` · `useVerifyOTP` · `useResetPassword` · `useUpdateProfile`

**Permissions:** `usePermissionCheck` · `usePermissions` · `usePermission` · `useCreatePermission` · `useUpdatePermission` · `useDeletePermission`

**Users:** `useUsers` · `useUser` · `useCreateUser` · `useUpdateUser` · `useToggleUserStatus` · `useDeleteUser`

**Companies:** `useCompanies` · `useCompany` · `useDeveloperDashboard` · `useCreateCompany` · `useUpdateCompany` · `useDeleteCompany`

**Roles:** `useRoles` · `useRole` · `useCreateRole` · `useUpdateRole` · `useDeleteRole`

**Settings:** `usePublicSettings` · `useSettings` · `useSettingsByGroup` · `useSetting` · `useUpdateSetting` · `useBulkUpdateSettings`

**i18n:** `useTranslation` · `useLanguages` · `useLanguage` · `useTranslations` · `useTranslationsByLanguage` · `useTranslationKeys`

**Features:** `useVendors` · `useVendor` · `useCreateVendor` · `useUpdateVendor` · `usePlugins` · `usePlugin` · `useTogglePlugin` · `useIsPluginActive` · `useApprovals` · `usePendingCount` · `useSubscriptions` · `useFAQs` · `useFAQCategories` · `usePayments` · `useEmailConfigs` · `useEmailTemplates` · `useEmailCampaigns` · `useActivityLogs` · `useModules` · `useAds` · `useAnnouncements` · `useLocations` · `useCurrencies`

---

## Multi-Tenancy

- `CompanyProvider` context manages current company
- Developer users can switch companies (stored in localStorage)
- All API requests include `X-Company-Id` header
- Non-developer users locked to their assigned company

---

## Approval Workflow

- Sensitive operations (create/update/delete) may require approval
- Backend returns `202` with `approval_required: true`
- Frontend throws `ApprovalRequiredError` (not treated as failure)
- Pending count badge shown in sidebar/navbar
- Super Admin (level ≥ 100) bypasses approvals entirely

---

## React Query Config

```ts
staleTime: 10 min   // Keep fresh for 10 minutes
gcTime:    15 min   // Garbage collect after 15 minutes
retry:     1        // Retry failed queries once
refetchOnWindowFocus: false
refetchOnReconnect:   false
```

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

---

## Getting Started

```bash
npm install
npm run dev      # http://localhost:3002
npm run build
npm run start
```
