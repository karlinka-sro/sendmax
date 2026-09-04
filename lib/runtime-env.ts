import { env } from 'cloudflare:workers';

type RuntimeSettings = {
  MAX_SITE_PASSWORD?: string;
  MAX_SITE_SESSION_SECRET?: string;
  NTFY_URL?: string;
};

type RuntimeSettingName = keyof RuntimeSettings;

const cloudflareSettings = env as unknown as RuntimeSettings;

export function getRuntimeSetting(name: RuntimeSettingName) {
  const value = cloudflareSettings[name] ?? process.env[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
