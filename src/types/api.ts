/**
 * Interfaces para tipagem dos dados da API
 * Tipos genéricos e respostas padrão
 */

export interface ApiResponse<T> {
  message: string;
  status: number;
  timestamp: string;
  content: T;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Re-exportar tipos de outros arquivos para facilitar importação
export type { UserContent, UserInfo, Photo, Environment, UserInfoResponse } from './user';
export type { ParticipantSignature, ParticipantSignatureResponse } from './participantSignature';
export type { AllSignature, AllSignatureResponse } from './allSignature';
export type {
  SignaturePosition,
  RubricPosition,
  SignaturePositionConfig,
  ParticipantRepresentant,
  Participant,
  SignatureGroup,
  SignatureDocument,
  CreateSignatureRequest,
  SearchedUser,
  SignatureRule,
} from './signature';
