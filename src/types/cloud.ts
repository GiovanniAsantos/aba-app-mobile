// Cloud Types

export interface CloudUserPhoto {
  id: number;
  path: string;
  size: number;
  typePhoto: 'PROFILE' | string;
}

export interface CloudUser {
  identifier: string;
  name: string;
  photo: CloudUserPhoto | null;
}

export interface CloudSignature {
  signatureId: number;
  typeRegistration: 'ENVIAR' | string;
  linearId: string;
  status: 'ATIVADO_AGUARDANDO_ASSINATURAS' | 'CONCLUIDO' | 'CANCELADO' | string;
}

export interface CloudFileProps {
  key: string;
  myFile: boolean;
  size: number;
  subType: string;
  type: string;
  signature?: CloudSignature;
}

export type CloudPermission = 'READ' | 'UPDATE' | 'EXCLUDE' | 'CREATE';

export interface CloudLog {
  // Defina os campos do log conforme necessário
  id?: number;
  action?: string;
  timestamp?: string;
  user?: CloudUser;
}

export interface CloudItemBase {
  id: number;
  name: string;
  color: string | null;
  createdAt: string;
  createdBy: CloudUser;
  favorite: boolean | null;
  path: string | null;
  permissions: CloudPermission[];
  sharedLinkId: number | null;
  logs: CloudLog[];
}

export interface CloudFile extends CloudItemBase {
  isFolder: false;
  fileProps: CloudFileProps;
  size: number;
}

export interface CloudFolder extends CloudItemBase {
  isFolder: true;
  fileProps?: never; // Pastas não têm fileProps
  size?: never; // Pastas não têm tamanho direto
}

export type CloudItem = CloudFile | CloudFolder;

// Type guards para verificar o tipo
export const isCloudFile = (item: CloudItem): item is CloudFile => {
  return item.isFolder === false;
};

export const isCloudFolder = (item: CloudItem): item is CloudFolder => {
  return item.isFolder === true;
};

// Helper types para filtrar listas
export type CloudFileList = CloudFile[];
export type CloudFolderList = CloudFolder[];

// Tipo para resposta da API
export interface CloudApiResponse {
  content: CloudItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Tipo para navegação de pastas
export interface CloudBreadcrumb {
  id: number | null;
  name: string;
  path: string;
}

// Tipo para ações de contexto
export interface CloudContextAction {
  key: string;
  label: string;
  icon: string;
  permission: CloudPermission;
  action: (item: CloudItem) => void;
}
