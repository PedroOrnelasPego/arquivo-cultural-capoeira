/// <reference types="vite/client" />

declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.svg";
declare module "*.mp3";

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_KEY: string
  readonly VITE_ADMIN_EMAIL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
