// Tipos para a resposta da API de assinatura

export interface SignatureApiResponse {
  content: SignatureContent;
  message: string;
  status: number;
  timestamp: string;
}

export interface SignatureContent {
  id: number;
  title: string;
  status: string;
  createdAt: string;
  createdBy: string;
  orderParticipants: boolean;
  crdInfo: CrdInfo;
  documentsToSign: DocumentToSign[];
  groups: SignatureGroupApi[];
  signedDocuments: SignedDocument[];
  states: SignatureState[];
  mySignature: ParticipantApi | null;
  myApprove: ParticipantApi | null;
  myView: ParticipantApi | null;
}

export interface CrdInfo {
  linearId: string;
  status: string;
}

export interface DocumentToSign {
  id: number;
  name: string;
  cloudDocumentUuid: string;
  key?: string;
  path?: string;
  url?: string;
  urlSigned?: string;
  size?: number;
  type?: string;
}

export interface SignatureGroupApi {
  sequence: number;
  ruleId: number | null;
  participants: ParticipantApi[];
}

export interface ParticipantApi {
  id: number;
  name: string;
  email: string;
  numberDocument: string;
  titleParticipant: string;
  typeParticipant: string;
  typeValidation: string;
  signatureParticipantStatus: string;
  canSign: boolean;
  canApprove: boolean;
  canObserver: boolean;
  signedAt?: string;
  uuid: string | null;
  representative: Representative | null;
  crdInfo: CrdInfo | null;
  approveCrdInfo: CrdInfo | null;
  viewCrdInfo: CrdInfo | null;
  marcationSign?: string;
  marcationRubric?: string;
}

export interface Representative {
  cnpj: string;
  razaoSocial: string;
}

export interface SignedDocument {
  id: number;
  documentId: number;
  participantId: number;
  signedAt: string;
  urlSigned: string;
}

export interface SignatureState {
  seq: number;
  status: string;
  createdAt: string;
  createdBy: string;
  log: string;
  transactionId?: string;
}
