# Kaviyarasan V — Video Editor Portfolio

## EASY PUBLISH (works on laptop + mobile for everyone)
1. Open `admin.html` -> add posters / videos / photo as you like.
2. Check them with **View site (preview)** (`index.html?preview=1`). Preview shows admin data from THIS browser only.
3. In admin -> Data card -> click **Download site files for upload (ZIP)** (needs internet once).
4. Unzip -> copy the `assets` folder and `js/site-data.js` into your site folder (replace existing).
5. Upload the whole site to hosting. Now every visitor sees all images and videos.

The normal `index.html` (without `?preview=1`) ALWAYS shows only what is in `js/site-data.js`,
so laptop and mobile look identical.

Tips: videos as H.264 .mp4 (720p/1080p, ideally under 20 MB); file names without spaces/capitals;
InfinityFree web uploader has a small file-size limit — use FTP for big videos, or paste an Instagram/YouTube link.

---

A static site — no PHP, no database, no admin password. Open the files directly
or upload them to any static host.

## Folder structure
```
index.html            → main page
admin.html             → admin panel (Poster/Work, Videos, Profile Photo) — no login
css/style.css          → all styling + animations + responsive rules
js/site-data.js        → DEFAULT content, shown to every visitor (edit this to publish new content site-wide)
js/storage.js           → localStorage read/write helpers, shared by admin.html and main.js
js/main.js              → loader, typing effect, cursor/scroll fx, renders work/reels/photo
assets/img, assets/videos → your real image/video files (referenced by path from site-data.js)
```

## How content works — read this first
There is no server, so `admin.html` saves everything (work items, videos, profile photo)
into **that browser's `localStorage`** — not to a shared database. That means:

- Anything you add in `admin.html` shows up on `index.html` **only in the same browser**
  you used to add it (e.g. only on your own laptop, until you clear site data).
- Other visitors — anyone opening your live link on their own phone/computer — will
  **not** see it, because they have no localStorage entry for it.

To make new work permanently visible to **everyone**:
1. Open `admin.html`, add/edit everything the way you want it.
2. Click **Export data** at the bottom — this downloads `portfolio-data.json`.
3. Open that JSON and copy the `work`, `videos` and `profilePhoto` values into
   `js/site-data.js` (into `SITE_DEFAULT_WORK`, `SITE_DEFAULT_VIDEOS`, `SITE_DEFAULT_PHOTO`).
   If a value is a long `data:image/...` or `data:video/...` string, it'll work as-is,
   but the file will get large — better to instead upload the actual image/video file into
   `assets/img/` or `assets/videos/` and reference its path (e.g. `assets/img/poster-07.jpg`).
4. Re-upload the site (all files) to your host. Now every visitor sees the update, with
   no localStorage involved for them.

`admin.html` itself is still useful as a quick local preview/editor and for trying
things out before you commit them to `site-data.js`.

## Run locally
Just open `index.html` in a browser — no server needed. To try the admin panel,
open `admin.html` the same way.

## Deploy anywhere static
Upload the whole folder (all files, keeping the structure) to any static host —
Hostinger/InfinityFree "File Manager" (no PHP/MySQL setup needed anymore), GitHub Pages,
Netlify, Vercel, etc. There's nothing to configure.

## Video uploads (up to ~800MB+)
Images/text/paths are kept in `localStorage` (small, a few MB max). Uploaded **videos**
are stored as real files in the browser's **IndexedDB** instead, which comfortably
handles large clips — often several hundred MB to 800MB+ on a desktop browser with
free disk space. The admin panel shows a live "free storage" estimate so you can see
whether a file will fit on that particular device. Mobile browsers, especially iOS
Safari, often allow much less — if a big upload fails there, compress the video or
paste a path/link instead.

Because Export data (JSON) can't practically hold an 800MB video, uploaded video files
are **not** included in it. To publish an uploaded video to the live site for everyone:
1. In `admin.html` → Data card → click **Download video files** — this saves the actual
   video file(s) to your computer.
2. Drop the downloaded file into `assets/videos/`.
3. Edit that video entry and put the path (e.g. `assets/videos/my-reel.mp4`) in the
   video path field instead of the upload — or add it directly to `SITE_DEFAULT_VIDEOS`
   in `js/site-data.js`.
4. Re-upload the site.

## Notes
- Uploaded images are resized/compressed in the browser before being saved.
- Animations respect `prefers-reduced-motion`.
- `js/site-data.js` is intentionally plain, editable JS — safe to hand-edit even
  without touching `admin.html`.
