# Event Management — Admin Frontend

## Stack
- Next.js + TypeScript + Tailwind CSS
- Deployed on **Vercel** — auto-deploys on push to `main`
- Live URL: https://event-management-admin-frontend.vercel.app

## Environment Variables
```
NEXT_PUBLIC_API_URL=https://event-management-admin-backend.onrender.com/api/v1
NEXT_PUBLIC_APP_URL=https://event-management-admin-frontend.vercel.app
```

## Structure
```
src/app/
  admin/           — all protected admin pages
    platform/      — users, roles, permissions
    vendors/       — vendor management
    companies/     — company management
    settings/      — app settings
    plugins/       — plugin management
    ... (many more modules)
  api/             — Next.js API routes
```

## Auth
- Admin JWT stored in cookies
- Pages under `admin/` are protected

## Key Conventions
- Each module has a `_components/` folder with content components
- API calls go directly to `NEXT_PUBLIC_API_URL`

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
