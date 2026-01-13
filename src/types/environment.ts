export interface Environment {
  id: number;
  name: string;
  initials?: string;
  apiKey: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'DELETED';
  isCurrent?: boolean;
  logo?: string;
  createdAt?: string;
  updatedAt?: string;
  plan?: {
    id: number;
    name: string;
    type: string;
  };
}

export interface EnvironmentInvite {
  id: number;
  environmentId: number;
  environmentName: string;
  environmentKey: string;
  email?: string;
  sentDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  type: 'SENT' | 'RECEIVED';
}

export interface CreateEnvironmentData {
  name: string;
  description?: string;
  logo?: string;
}

export interface SwitchEnvironmentData {
  environmentKey: string;
}

export interface SendInviteData {
  environmentKey: string;
  email?: string;
}

export interface InviteActionData {
  inviteId: number;
  action: 'ACCEPT' | 'REJECT';
}
