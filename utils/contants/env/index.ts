/**
 * Runtime environment configuration for Pengembangan Ternak Rakyat.
 * Values come from .env.local at build time. Provide sensible defaults
 * so the app still boots in dev without any env file.
 */
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? "";
const DOMAIN_API = process.env.NEXT_PUBLIC_DOMAIN_API ?? "";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "SITERNAK";

export { DOMAIN, DOMAIN_API, APP_NAME };
