const API_BASE_URL = 'http://localhost:3001/api';

export interface EmailAccount {
  id: string;
  email: string;
  displayName: string;
  provider: EmailProvider;
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
  path?: string;
}

class ApiService {
  private async fetch(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Account Management
  async getProviders() {
    return this.fetch('/accounts/providers');
  }

  async detectProvider(email: string) {
    return this.fetch('/accounts/detect-provider', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async testConnection(email: string, password: string, provider: EmailProvider) {
    return this.fetch('/accounts/test-connection', {
      method: 'POST',
      body: JSON.stringify({ email, password, provider }),
    });
  }

  async addAccount(email: string, password: string, displayName: string, provider: EmailProvider) {
    return this.fetch('/accounts', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName, provider }),
    });
  }

  async getAccounts(): Promise<{ accounts: EmailAccount[]; success: boolean }> {
    return this.fetch('/accounts');
  }

  async getAccount(accountId: string): Promise<{ account: EmailAccount; success: boolean }> {
    return this.fetch(`/accounts/${accountId}`);
  }

  async createCustomProvider(
    name: string,
    imapHost: string,
    imapPort: number,
    imapSecure: boolean,
    smtpHost: string,
    smtpPort: number,
    smtpSecure: boolean
  ) {
    return this.fetch('/accounts/custom-provider', {
      method: 'POST',
      body: JSON.stringify({
        name,
        imapHost,
        imapPort,
        imapSecure,
        smtpHost,
        smtpPort,
        smtpSecure,
      }),
    });
  }

  // Email Management
  async syncEmails(accountId: string, folder = 'INBOX', limit = 50) {
    return this.fetch(`/emails/${accountId}/sync`, {
      method: 'POST',
      body: JSON.stringify({ folder, limit }),
    });
  }

  async getEmails(accountId?: string): Promise<{ emails: EmailMessage[]; total: number; success: boolean }> {
    const endpoint = accountId ? `/emails/${accountId}` : '/emails';
    return this.fetch(endpoint);
  }

  async getEmail(accountId: string, emailId: string): Promise<{ email: EmailMessage; success: boolean }> {
    return this.fetch(`/emails/${accountId}/${emailId}`);
  }

  async sendEmail(
    accountId: string,
    to: EmailAddress[],
    subject: string,
    body: { text?: string; html?: string },
    cc?: EmailAddress[],
    bcc?: EmailAddress[],
    attachments?: EmailAttachment[]
  ) {
    return this.fetch(`/emails/${accountId}/send`, {
      method: 'POST',
      body: JSON.stringify({
        accountId,
        to,
        cc,
        bcc,
        subject,
        body,
        attachments,
      }),
    });
  }

  // Health Check
  async healthCheck() {
    return this.fetch('/health');
  }
}

export const apiService = new ApiService();