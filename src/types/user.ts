/**
 * Tipos relacionados ao usuÃ¡rio e conta
 */

export interface Photo {
  path: string;
  typePhoto: 'LOGO_SMALL' | 'LOGO_LARGE' | 'PROFILE';
}

export interface Environment {
  name: string;
  nameInit: string;
  key: string;
  status: 'ACTIVE' | 'PENDING' | 'DELETED';
  owner: boolean;
  numberDocument?: string;
  photos: Photo[];
}

export interface Permission {
  descriptionPt?: string;
  [key: string]: any;
}

export interface Service {
  productName: string;
  typeProduct: 'ALLOW_MODULE_ACCOUNT' | 'ALLOW_MODULE_SIGNATURE' | 'ALLOW_MODULE_BPMS' | 'ALLOW_MODULE_CLOUD';
  active: boolean;
  permissions: Permission[];
}

export interface SelectedEnvironment extends Environment {
  services: Service[];
  verifiyPlan?: {
    verify: boolean;
    message: string;
  };
}

export interface AccountAdmin {
  permissions: string[];
}

export interface Config {
  contact?: string;
  identifier?: string;
  [key: string]: any;
}

export interface UserContent {
  name: string;
  numberDocument: string;
  nameInit: string;
  typeDocument: 'CPF' | 'CNPJ';
  accountAdmin: AccountAdmin;
  associatedEnvironments: Environment[];
  config: Config;
  contact?: string;
  identifier?: string;
  myEnvironments: Environment[];
  photos?: Photo[];
  selectedEnvironments?: SelectedEnvironment;
}
/**
 * Interface simplificada para uso no contexto da aplicação
 */
export interface UserInfo extends UserContent {
  // Campos herdados de UserContent
}

/**
 * Type para resposta da API
 */
export interface UserInfoResponse {
  message: string;
  status: number;
  timestamp: string;
  content: UserContent;
}
