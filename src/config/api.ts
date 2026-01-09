/**
 * Configurações centralizadas da API
 * 
 * Todas as variáveis de ambiente são importadas e exportadas aqui
 * para facilitar o uso em toda a aplicação.
 */

import {
  // Company
  COMPANY_NAME_SHORT,
  COMPANY_NAME_LONG,
  SITE_PATH,

  // Keycloak
  KEYCLOAK_URL,
  KEYCLOAK_REALM,
  KEYCLOAK_CLIENT_ID,

  // Contas
  API_ACCOUNT_URL,
  API_ACCOUNT_URL_WS,
  API_ACCOUNT_URL_V1,

  // Blockchain
  API_ORCHESTRATOR_URL,
  API_ORCHESTRATOR_URL_WS,

  // Email
  API_EMAIL_URL,
  API_EMAIL_URL_WS,
  API_EMAIL_URL_V1,

  // Assinatura
  API_SIGNATURE_URL,
  API_SIGNATURE_WS_URL,
  API_SIGNATURE_URL_V1,
  API_SIGNATURE_PUBLIC_URL_V1,

  // Plans
  API_PLANS_URL,

  // Cloud
  API_CLOUD_URL,
  API_CLOUD_URL_PUBLIC,

  // BPMS
  API_BPMS_URL,
  API_BPMS_URL_WS,
  API_BPMS_URL_V1,
  API_BPMS_URL_V1_PUBLIC,

  // Recaptcha
  RECAPTCHA_KEY,

  // Logos
  LOGO_BLUE_TRANSPARENT,
  LOGO_WHITE_TRANSPARENT,
  ICON_WHITE_TRANSPARENT,
  ICON_WHITE_ORIGINAL_TRANSPARENT,
  ICON_BLUE,
} from '@env';

export const config = {
  // Informações da Empresa
  company: {
    nameShort: COMPANY_NAME_SHORT,
    nameLong: COMPANY_NAME_LONG,
    sitePath: SITE_PATH,
  },

  // Keycloak (Autenticação)
  keycloak: {
    url: KEYCLOAK_URL,
    realm: KEYCLOAK_REALM,
    clientId: KEYCLOAK_CLIENT_ID,
  },

  // APIs - Contas
  api: {
    account: {
      base: API_ACCOUNT_URL,
      ws: API_ACCOUNT_URL_WS,
      v1: API_ACCOUNT_URL_V1,
    },

    // Blockchain
    orchestrator: {
      url: API_ORCHESTRATOR_URL,
      ws: API_ORCHESTRATOR_URL_WS,
    },

    // Email
    email: {
      base: API_EMAIL_URL,
      ws: API_EMAIL_URL_WS,
      v1: API_EMAIL_URL_V1,
    },

    // Assinatura
    signature: {
      base: API_SIGNATURE_URL,
      ws: API_SIGNATURE_WS_URL,
      v1: API_SIGNATURE_URL_V1,
      publicV1: API_SIGNATURE_PUBLIC_URL_V1,
    },

    // Plans
    plans: {
      base: API_PLANS_URL,
    },

    // Cloud
    cloud: {
      base: API_CLOUD_URL,
      public: API_CLOUD_URL_PUBLIC,
    },

    // BPMS
    bpms: {
      base: API_BPMS_URL,
      ws: API_BPMS_URL_WS,
      v1: API_BPMS_URL_V1,
      publicV1: API_BPMS_URL_V1_PUBLIC,
    },
  },

  // Recaptcha
  recaptcha: {
    key: RECAPTCHA_KEY,
  },

  // Logos e Ícones
  assets: {
    logoBlue: LOGO_BLUE_TRANSPARENT,
    logoWhite: LOGO_WHITE_TRANSPARENT,
    iconWhite: ICON_WHITE_TRANSPARENT,
    iconWhiteOriginal: ICON_WHITE_ORIGINAL_TRANSPARENT,
    iconBlue: ICON_BLUE,
  },
};

// Exportação de atalhos para facilitar uso
export const { company, keycloak, api, recaptcha, assets } = config;

export default config;
