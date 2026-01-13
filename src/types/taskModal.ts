// Tipos específicos para a resposta da API v2 do TaskModal
export interface TaskModalFieldV2 {
  stepFieldId: number;
  name: string;
  type: 'TEXT' | 'TEXT_AREA' | 'NUMBER' | 'DATE' | 'DATETIME' | 'DATE_TIME' | 'MULTIPLE_CHOICE' | 'ONLY_CHOICE' | 'ATTACHMENT' | 'EMAIL' | 'LINK' | 'TELEPHONE' | 'CPF' | 'CNPJ' | 'COIN' | 'BOOLEAN';
  notNull: boolean;
  size: number | null;
  sharedInfo: boolean;
  helpText: string;
  description: string;
  regexValidation: string;
  sequence: number;
  response: any;
  attConfig: any;
  fieldValidatorAccount: any[];
  options?: string; // JSON string com as opções para ONLY_CHOICE e MULTIPLE_CHOICE
}

export interface TaskModalStepMovement {
  stepMvmtId: number;
  allowMov: boolean;
  stepId: number;
  stepSequence: number;
  stepCurrent: boolean;
  stepName: string;
  stepColor: string;
}

export interface TaskModalCurrentStep {
  stepId: number;
  name: string;
  description: string;
  sequence: number;
  color: string;
  time: number | null;
  timeUnit: string;
  timeWorkingDays: boolean;
  initialStep: boolean;
  finalStep: boolean;
  typeFinalStep: string;
  sharedInfo: boolean;
  ignoreHierarchy: boolean;
  validatedBy: any[];
  validatedFieldBy: any[];
  validatedExternalBy: any[];
  fieldsValidated?: boolean;
}

export interface TaskModalAction {
  taskActionId: number;
  id?: number;
  action: 'TASK_CREATED' | 'TASK_ACCEPTED' | 'TASK_RETURNED' | 'TASK_CANCELLED' | 'TASK_CLOSED' | 'INFO_INSERTED';
  createdAt: string; // Formato: DD/MM/YYYY HH:mm:ss
  createdBy: string; // Nome do usuário que realizou a ação
  description?: string;
  stepCurrent?: {
    stepId: number;
    name: string;
    sequence: number;
    color: string;
  };
  stepOld?: {
    stepId: number;
    name: string;
    sequence: number;
    color: string;
    fields?: Array<{
      id: number;
      name: string;
      value: any;
      type: string;
      atchs?: Array<{
        name: string;
        size: number;
        cloudUuid?: string;
        key?: string;
        uuid?: string;
      }>;
    }>;
    atchSignature?: {
      files?: Array<{
        name: string;
        size: number;
        cloudUuid?: string;
        key?: string;
        uuid?: string;
      }>;
      signatureInvite?: {
        statusSignature?: string;
        signDocs?: Array<{
          name: string;
          size: number;
          cloudUuid?: string;
        }>;
        crdInfo?: {
          linearId?: string;
        };
      };
    };
  };
}

export interface TaskModalDetailsV2 {
  task: {
    taskId: number;
    protocol: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    createdBy: {
      name: string;
      photo: Array<{
        path: string;
        typePhoto: string;
        size: number;
      }>;
    };
    files: any[];
    exec: {
      execCancelled: boolean;
      execConfirmed: boolean;
    };
    sla: any;
  };
  flow: {
    name: string;
    currentStep: TaskModalCurrentStep;
    movsEnabled: TaskModalStepMovement[];
  };
  form: {
    initialFields: any[];
    stepsFields: TaskModalFieldV2[];
  };
  layout: {
    id: number;
    name: string;
    title: string;
    description: string;
    logo: any;
    buttonName: string;
    buttonColor: string;
    background: {
      enumTag: string;
      name: string;
      url: string;
      thumbnail: string;
    };
  };
  actions: TaskModalAction[];
}
