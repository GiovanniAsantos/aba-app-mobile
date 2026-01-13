/**
 * Tipos para criação e gerenciamento de assinaturas
 */

export interface SignaturePosition {
  docKey: string;
  x: number;
  y: number;
  width: number;
  height: number;
  docHeight: number;
  docWidth: number;
  docPage?: number;
  positionConfirmed?: boolean;
  participantId?: string;
}

export interface RubricPosition {
  rubricOption: 'NOT_SIGN' | 'REQUIRED_SIGN' | 'OPTIONAL_SIGN';
  docsAndPosition: SignaturePosition[];
  allPages: boolean;
  positionDefined: boolean;
}

export interface SignaturePositionConfig {
  positionDefined: boolean;
  docsAndPosition: SignaturePosition[];
}

export interface ParticipantRepresentant {
  cnpj: string;
  razaoSocial: string;
}

export interface Participant {
  idTemp: string;
  accountId?: number;
  cpf: string;
  email: string;
  name: string;
  urlPhotoPerfil?: string;
  titleParticipant: 'SIGNATARIO' | 'APPROVER' | 'OBSERVER' | 'SIGNATARIO_1' | 'SIGNATARIO_2';
  typeValidation: 'POR_TOKEN' | 'ICP_BRASIL';
  typeValidateIcp?: 'CPF' | 'CNPJ';
  signaturePosition: SignaturePositionConfig;
  rubricPosition: RubricPosition;
  representant: ParticipantRepresentant;
  participantTitleCheckbox?: boolean;
}

export interface SignatureGroup {
  participants: Participant[];
  ruleId: number | null;
  participantTitleCheckbox?: boolean;
}

export interface SignatureDocument {
  id?: string;
  key?: string;
  name: string;
  type?: string;
  format?: string;
  cloudDocumentUuid?: string; // UUID do documento na nuvem
  fileProps?: {
    key: string;
    bucket?: string;
    uri?: string;
    size?: number;
    mimeType?: string;
  };
  folder?: string;
}

export interface CreateSignatureRequest {
  title: string;
  description: string;
  ref: string;
  module: string;
  documents: Array<{ cloudFileUuid: string }>;
  groups: Array<{
    sequence: number;
    ruleId: number | null;
    participants: Array<{
      accountId?: number;
      cpf: string;
      email: string;
      name: string;
      titleParticipant: string;
      typeValidation?: string;
      typeValidateIcp?: string;
      representant?: ParticipantRepresentant | null;
      marcationRubric: string;
      marcationSign: string;
      marcationSigns: Array<{
        docToSignUuid: string;
        height: number;
        width: number;
        numberPage: number;
        positionX: number;
        positionY: number;
        signType: string;
      }>;
      marcationRubrics: Array<{
        docToSignUuid: string;
        height: number;
        width: number;
        numberPage: number;
        positionX: number;
        positionY: number;
        signType: string;
        allPages: boolean;
      }>;
    }>;
  }>;
  orderParticipants: boolean;
  typeRegistration: string;
  codeBpms?: string | null;
  titleParticipant?: string;
}

export interface SearchedUser {
  id: number;
  name: string;
  numberDocument: string;
  email?: string;
  contact?: string;
  urlPhotoPerfil?: string;
}

export interface SignatureRule {
  id: number;
  name: string;
  description: string;
}
