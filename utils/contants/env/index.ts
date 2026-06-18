/**
 * Runtime environment configuration for Pengembangan Ternak Rakyat.
 * Values come from .env.local at build time. Defaults are set to the
 * production API so the app works out-of-the-box without any env file.
 */
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? "http://103.245.39.75:6090";
const DOMAIN_API =
  process.env.NEXT_PUBLIC_DOMAIN_API ?? "http://103.245.39.75:6090/v1";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "SITERNAK";
/**
 * Base URL for serving uploaded images. The API returns image paths
 * (e.g. `/image/ktp/<filename>.png`); prepend this base to render them.
 */
const IMAGE_BASE =
  process.env.NEXT_PUBLIC_IMAGE_BASE ?? "http://103.245.39.75:6090/image";

export { DOMAIN, DOMAIN_API, APP_NAME, IMAGE_BASE };
