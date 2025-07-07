export interface EmailAccount {
  id: string;
  email: string;
  password: string;
  provider: EmailProvider;
  displayName: string;
  imapConfig?: IMAPConfig;
  smtpConfig?: SMTPConfig;
  createdAt: string;
  lastSync?: string;
}

export interface EmailProvider {
  name: string;
  type: 'predefined' | 'custom';
  imap: {
    host: string;
    port: number;
    secure: boolean;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
  };
}

export interface IMAPConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

export interface EmailMessage {
  id: string;
  messageId: string;
  accountId: string;
  subject: string;
  from: EmailAddress[];
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  date: string;
  body: {
    text?: string;
    html?: string;
  };
  attachments: EmailAttachment[];
  headers: Record<string, string>;
  folder: string;
  flags: string[];
  uid: number;
  size: number;
  read: boolean;
  starred: boolean;
  important: boolean;
  category?: string;
  emlPath: string;
  jsonPath: string;
  createdAt: string;
}

export interface EmailAddress {
  name?: string;
  address: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  cid?: string;
  content?: Buffer;
  path?: string;
}

export interface SendEmailRequest {
  accountId: string;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  body: {
    text?: string;
    html?: string;
  };
  attachments?: EmailAttachment[];
  replyTo?: string;
  inReplyTo?: string;
}