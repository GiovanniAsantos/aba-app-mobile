export interface Notification {
  id: number;
  title: string;
  description: string;
  type: string;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  userId?: number;
  metadata?: {
    icon?: string;
    iconBg?: string;
    iconColor?: string;
    [key: string]: any;
  };
}

export interface NotificationResponse {
  content: Notification[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
