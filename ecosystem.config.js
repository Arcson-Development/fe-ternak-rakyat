/**
 * PM2 Ecosystem file for SITERNAK Frontend (Next.js) — production only.
 * -----------------------------------------------------------------------
 * Usage:
 *   - Start:  pm2 start ecosystem.config.js
 *   - Stop:   pm2 stop ecosystem.config.js
 *   - Reload: pm2 reload ecosystem.config.js
 *   - Delete: pm2 delete ecosystem.config.js
 *   - Logs:   pm2 logs siternak-prod
 *   - Monitor: pm2 monit
 *
 * Notes:
 *   - `next build` must be run once before starting.
 *   - Environment variables can be overridden via `.env.production`.
 *   - On Windows, `instances` > 1 requires cluster mode and may need
 *     `node_args: ["--experimental-worker"]` for proper support.
 */

const path = require("path");

const PROJECT_ROOT = __dirname;

/** @type {import('pm2').ApplicationOptions[]} */
module.exports = {
  apps: [
    {
      name: "siternak-prod",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: PROJECT_ROOT,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 10000,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
        NEXT_PUBLIC_DOMAIN: "http://103.245.39.75:6090",
        NEXT_PUBLIC_DOMAIN_API: "http://103.245.39.75:6090/v1",
        NEXT_PUBLIC_APP_NAME: "SITERNAK",
        NEXT_PUBLIC_IMAGE_BASE: "http://103.245.39.75:6090/image",
      },
      out_file: path.join(PROJECT_ROOT, "logs", "prod-out.log"),
      error_file: path.join(PROJECT_ROOT, "logs", "prod-error.log"),
      merge_logs: true,
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
