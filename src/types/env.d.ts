declare module '@env' {
  // Company Info
  export const COMPANY_NAME_SHORT: string;
  export const COMPANY_NAME_LONG: string;
  export const SITE_PATH: string;

  // Configs
  export const PORT: string;
  export const CHOKIDAR_USEPOLLING: string;
  export const SKIP_PREFLIGHT_CHECK: string;
  export const GENERATE_SOURCEMAP: string;

  // WebSocket
  export const API_ACCOUNT_URL_BASE: string;
  export const API_SIGNATURE_URL_BASE: string;
  export const API_CLOUD_URL_BASE: string;
  export const API_BPMS_URL_BASE: string;

  // Recaptcha
  export const RECAPTCHA_KEY: string;

  // Keycloak
  export const KEYCLOAK_URL: string;
  export const KEYCLOAK_REALM: string;
  export const KEYCLOAK_CLIENT_ID: string;

  // Contas
  export const API_ACCOUNT_URL: string;
  export const API_ACCOUNT_URL_WS: string;
  export const API_ACCOUNT_URL_V1: string;

  // Blockchain
  export const API_ORCHESTRATOR_URL: string;
  export const API_ORCHESTRATOR_URL_WS: string;

  // Email
  export const API_EMAIL_URL: string;
  export const API_EMAIL_URL_WS: string;
  export const API_EMAIL_URL_V1: string;

  // Assinatura
  export const API_SIGNATURE_URL: string;
  export const API_SIGNATURE_WS_URL: string;
  export const API_SIGNATURE_URL_V1: string;
  export const API_SIGNATURE_PUBLIC_URL_V1: string;

  // Plans
  export const API_PLANS_URL: string;

  // Cloud
  export const API_CLOUD_URL: string;
  export const API_CLOUD_URL_PUBLIC: string;

  // BPMS
  export const API_BPMS_URL: string;
  export const API_BPMS_URL_WS: string;
  export const API_BPMS_URL_V1: string;
  export const API_BPMS_URL_V1_PUBLIC: string;

  // Logos
  export const LOGO_BLUE_TRANSPARENT: string;
  export const LOGO_WHITE_TRANSPARENT: string;
  export const ICON_WHITE_TRANSPARENT: string;
  export const ICON_WHITE_ORIGINAL_TRANSPARENT: string;
  export const ICON_BLUE: string;
}
