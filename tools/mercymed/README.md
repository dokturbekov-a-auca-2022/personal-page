# MercyMed staff editor

Open `/hw6/admin/`, enter an approved staff email and use the one-time code. Select a section and language, save a private draft, preview, and publish. The owner manages staff access in the dashboard. Restore a saved revision from History, then publish it when ready.

The public pages in `hw6/` use published content from the Vercel function in `api/mercymed.js`. Shared content, revision history, staff permissions and uploaded photos are stored in Neon Postgres. The auth proxy in `api/authproxy.js` forwards only the permitted authentication operations. The server verifies signed tokens and checks verified email and current staff access for every restricted operation. Runtime secrets belong in Vercel environment variables `MERCYMED_DATABASE_URL` and `MERCYMED_AUTH_URL`; never commit their values. The initial database schema is included here.

To rebuild the editor after a developer change, install the pinned dependencies in this folder and run `npm run build`. Ordinary content changes do not require a build. The published website and editor run on Vercel; static-only hosting is insufficient for private drafts and shared publishing.

This is an unofficial classroom project. The booking demonstration collects no real patient information. Selected social links and clinic photos are managed by staff; clinical copy and translations need clinic approval for official use.
