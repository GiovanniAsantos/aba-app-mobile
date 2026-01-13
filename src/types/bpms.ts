export interface BpmsStatusData {
    statusEnum: 'SUCCESS' | 'CLOSED' | 'SIGNATURE' | 'NO_EFFECT';
    statusNamePt: string;
    statusNameEn: string;
    statusColor: string;
    quantity: number;
}

export interface BpmsStatusResponse {
    content: BpmsStatusData[];
    message: string;
    status: number;
    timestamp: string;
}

export interface BpmsTask {
    taskId: number;
    protocol: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    creatorPhoto: Array<{
        path: string;
        typePhoto: string;
        size: number;
    }>;
    openedBy: boolean;
    atchAmount: number;
    stepsAmount: number;
    
    // Flow information
    flowName: string;
    flowColor: string;
    flowIconName: string;
    flowIconPath: string;
    
    // Current step information
    currentStepId: number;
    currentStepName: string;
    currentStepColor: string;
    currentStepPosition: number;
    
    // Status and dates
    emailStatus: string;
    dateFinal: string;
    sla: any | null;
    
    // Backward compatibility (deprecated, use specific fields above)
    status?: string;
    statusEnum?: string;
    currentStage?: string;
    workflow?: string;
    workflowId?: number;
    dueDate?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assignedTo?: string;
    isDelayed?: boolean;
    formData?: Record<string, any>;
}

export interface BpmsTasksResponse {
    content: BpmsTask[];
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface TaskFormField {
    id?: string;
    stepFieldId?: number;
    initialFieldId?: number;
    name: string;
    label?: string;
    type: 'TEXT' | 'TEXT_AREA' | 'NUMBER' | 'DATE' | 'DATETIME' | 'DATE_TIME' | 'MULTIPLE_CHOICE' | 'ONLY_CHOICE' | 'ATTACHMENT' | 'EMAIL' | 'LINK' | 'TELEPHONE' | 'CPF' | 'CNPJ' | 'COIN' | 'BOOLEAN';
    required?: boolean;
    notNull?: boolean; // API v2 usa notNull ao invés de required
    value?: any;
    response?: any; // API v2 response
    options?: { label: string; value: string }[];
    placeholder?: string;
    description?: string;
    helpText?: string;
    sharedInfo?: boolean;
    size?: number | null;
    sequence?: number;
    regexValidation?: string;
    attConfig?: any;
    fieldValidatorAccount?: any[];
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        message?: string;
    };
}

export interface TaskHistory {
    id: number;
    action: string;
    actionType: 'CREATED' | 'UPDATED' | 'COMPLETED' | 'CANCELLED' | 'RETURNED' | 'ACCEPTED';
    performedBy: string;
    performedAt: string;
    comments?: string;
    fromStage?: string;
    toStage?: string;
}

export interface TaskDetails extends BpmsTask {
    fields: TaskFormField[];
    history: TaskHistory[];
    attachments?: {
        id: number;
        name: string;
        url: string;
        size: number;
        uploadedAt: string;
    }[];
    availableActions: {
        canAccept: boolean;
        canReturn: boolean;
        canCancel: boolean;
        canEdit: boolean;
        nextSteps?: string[];
    };
}

export interface BpmsFlow {
    flowId: number;
    name: string;
    description?: string;
    releasedAt?: string;
    createdAt: string;
    formInitial?: {
        formInitialId: number;
        fields: TaskFormField[];
    };
}

export interface BpmsFlowsResponse {
    content: BpmsFlow[];
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

// Tipos para resposta da API v2
export interface TaskDetailsV2 {
    task: {
        taskId: number;
        name: string;
        protocol: string;
        createdAt: string;
        updatedAt: string;
        createdBy: {
            name: string;
            photo: any[];
        };
        exec: {
            execConfirmed: boolean;
            execCancelled: boolean;
        };
        files: any[];
        sla: any;
    };
    flow: {
        name: string;
        currentStep: {
            stepId: number;
            name: string;
            description: string;
            sequence: number;
            initialStep: boolean;
            finalStep: boolean;
            typeFinalStep: string;
            color: string;
            time: number | null;
            timeUnit: string;
            timeWorkingDays: boolean;
            sharedInfo: boolean;
            ignoreHierarchy: boolean;
            validatedBy: any[];
            validatedExternalBy: any[];
            validatedFieldBy: any[];
        };
        movsEnabled: Array<{
            stepId: number;
            name: string;
        }>;
    };
    form: {
        initialFields: any[];
        stepsFields: TaskFormField[];
    };
    layout: {
        id: number;
        name: string;
        title: string;
        description: string;
        buttonName: string;
        buttonColor: string;
        logo: any;
        background: {
            name: string;
            enumTag: string;
            url: string;
            thumbnail: string;
        };
    };
    actions: any[];
}
