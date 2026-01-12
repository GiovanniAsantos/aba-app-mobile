/**
 * Tipos para assinaturas onde o usuário é participante
 */

export interface DocumentToSign {
  name: string;
  signatureDocumentToSignBpms: boolean;
}

export interface CrdInfo {
  linearId: string;
  status: string;
  statusColorBackground: string | null;
  statusColorWord: string | null;
}

export interface ParticipantSignature {
  id: number;
  createAt: string;
  updateAt: string;
  percentage: number;
  amountParticipants: number;
  amountNecessaryParticipants: number;
  amountSigned: number;
  amountApproved: number;
  amountViewed: number;
  createdBy: string;
  statusParticipant: 'CONCLUIDO' | 'EM_ESPERA' | 'CANCELADO' | string;
  title: string;
  typeRegistration: 'ENVIAR' | string;
  crdInfo: CrdInfo;
  documentsToSign: DocumentToSign[];
}

export interface ParticipantSignatureResponse {
  content: ParticipantSignature[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
