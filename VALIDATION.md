# Validation — 2026-10-05

Updated public reporting mode:
- `npm run typecheck`: passed
- `node tests/api.test.cjs`: four checks passed, including permission validation in Gmail mode, server risk calculation, pagination input, and public mode without Google login
- SQL schema previously executed in local PGlite: 19 company seeds, atomic report/photo link, used-photo rejection with rollback, anon direct table access denied
- Previous version before the public-mode change passed `npm run build` on Next.js 16.3.4

This environment's restricted network/port policy blocked the updated Turbopack build when its internal PostCSS worker tried binding to a port. The test and typecheck results above pass, but a clean `npm run build` for this updated archive must still be confirmed on your PC or Vercel. Webpack fallback here failed during TypeScript configuration output parsing. No live Supabase, Google OAuth, or Vercel account was available for integration tests.

PDF carries over the existing nine-company-per-page template. Validate Print Preview in the target browsers before routine use.
