/**
 * Tipos para todas as assinaturas (criadas pelo usuário)
 */

import { DocumentToSign, CrdInfo } from './participantSignature';

export interface AllSignature {
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
  statusParticipant: null;
  title: string;
  description?: string;
  typeRegistration: 'ENVIAR' | string;
  crdInfo: CrdInfo;
  documentsToSign: DocumentToSign[];
}

export interface AllSignatureResponse {
  content: AllSignature[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
