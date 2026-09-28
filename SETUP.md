# AD HUB — Setup, Content & Deployment

## Run locally
This is intentionally a plain HTML/CSS/JavaScript project. **There is no build step and no `npm run build` script.** A local static server is required because browser ES modules do not work reliably when the HTML file is opened directly from disk.

```bash
cd ad-hub-website
python3 -m http.server 5173
```
On Windows, use `py -m http.server 5173` if `python3` is not available. `npm run dev` runs the same Python command on systems where `python3` is installed.
Open `http://localhost:5173`. Admin: `http://localhost:5173/admin/`.

## Central editing
- `js/config.js`: brand, contact, WhatsApp message, social URLs, services, exact package prices, fallback categories, sample testimonials.
- Supabase admin: portfolio videos and categories after setup.
- Replace `assets/poster.svg` with your preferred showreel poster, or update the hero markup.
- Sample testimonials are explicitly marked as placeholders and should only be replaced with real, approved feedback.

## Supabase free-tier setup
1. Create a project at Supabase.
2. In **Authentication → Providers**, disable public email sign-ups unless you intentionally need them. Admin users should be created manually.
3. In **Authentication → Users**, create the administrator email/password. Do not expose this password in code. Copy that user's UUID.
4. Open **SQL Editor**, paste `supabase/schema.sql`, run it, then run this separate statement with the copied UUID:
   `insert into public.admin_users(user_id) values ('YOUR-AUTH-USER-UUID');`
   The schema creates both public Storage buckets, tables, constraints and policies.
5. Open **Project Settings → API**. Copy the Project URL and public `anon`/publishable key.
6. Add only those public values to `js/config.js`:
   - `siteConfig.supabase.url`
   - `siteConfig.supabase.anonKey`
7. Never place the `service_role`, database password, JWT secret or administrator password in this project. The browser uses the public anon/publishable key; Row Level Security permits public portfolio reads and permits writes only to user UUIDs listed in `public.admin_users`.
8. Sign in at `/admin/`, add categories/videos, upload thumbnails/video files, and toggle Featured.

Uploads are limited to 5 MB for thumbnails and 50 MB for videos. For larger video files, use a compressed MP4/WebM or an external CDN video URL. The admin accepts either upload or URL. Deleting a video entry also attempts to remove files that belong to the configured AD HUB Storage buckets; external URLs are never deleted.

## Free deployment
### Netlify
Drag the `ad-hub-website` folder into Netlify Drop, or connect a Git repository. Publish directory: project root. Leave the build command empty.

### Cloudflare Pages
Connect the repository. Framework preset: None. Build command: leave empty. Output directory: `/`.

### Vercel
Import the repository as an “Other” project. No build command is required. Root directory: project root.

## Content and production checklist
- Add the real hero/showreel video and poster.
- Replace all demo portfolio entries by connecting Supabase and adding actual work.
- Replace only with genuine client testimonials.
- Add real social URLs in `js/config.js`; blank entries stay hidden.
- Add an absolute Open Graph image URL after deployment.
- Test WhatsApp, phone links, admin login, uploads and all video URLs on the deployed domain.
- Compress videos and thumbnails before upload.
- Add each approved administrator's Auth user UUID to `public.admin_users`. Removing that row removes write access.

## Architecture
The public site reads categories/videos from Supabase through its REST API. If Supabase is not configured or unavailable, it safely displays clearly labeled local demo placeholders. The admin uses Supabase Auth, an explicit administrator allowlist, Row Level Security and Storage. Public pages have no write controls. Access tokens are refreshed using Supabase refresh tokens when needed.
