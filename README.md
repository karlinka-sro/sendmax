# Send to Max

A small, phone-friendly web app for sending short messages to Max's ESP32 desktop robot through ntfy.

## What it does

- Requires a shared password before the message screen opens.
- Accepts plain-text messages up to 72 characters.
- Sends messages to ntfy from a protected server endpoint.
- Keeps the password and ntfy topic out of the browser code.
- Can be installed on a phone as a small web app.

## Run locally

Requirements: Node.js 22.13 or newer and pnpm.

1. Copy `.env.example` to `.env.local`.
2. Fill in all three values:

   ```env
   MAX_SITE_PASSWORD=a-new-password-used-only-for-this-app
   MAX_SITE_SESSION_SECRET=a-long-random-secret
   NTFY_URL=https://ntfy.sh/your-private-topic
   ```

3. Install and run:

   ```bash
   pnpm install
   pnpm dev
   ```

4. Open the local address printed in the terminal.

## Build

```bash
pnpm build
```

## Deploy from GitHub with Cloudflare Workers

1. In Cloudflare, open **Workers & Pages** and choose **Create application**.
2. Import the GitHub repository and select the `main` branch.
3. Set the build command to `pnpm build`.
4. Set the deploy command to `pnpm deploy`.
5. Keep the root directory as `/`.
6. Add these three **runtime secrets** under the Worker's **Settings → Variables & Secrets**:
   - `MAX_SITE_PASSWORD`
   - `MAX_SITE_SESSION_SECRET`
   - `NTFY_URL`
7. Redeploy after adding the secrets.

Every new commit to `main` will then trigger another deployment.

## Important security note

Never commit `.env.local` or your real password, session secret, or ntfy topic. The included `.gitignore` excludes local environment files.

This project needs server-side routes for secure password checking and message delivery. A plain GitHub Pages deployment is static and will not run those routes. GitHub can safely store the source, but deploy it to a host that supports server-side JavaScript or Cloudflare Workers.
