
export interface I18nNotificationMsg {
  key: string;
}

export type NotificationMessage = string | I18nNotificationMsg;

export interface Notification {
  type: 'success' | 'error';
  message: NotificationMessage;
  persistAfterNavigation?: boolean;
}
