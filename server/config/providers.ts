import { EmailProvider } from '../types/email.js';

export const EMAIL_PROVIDERS: Record<string, EmailProvider> = {
  gmail: {
    name: 'Gmail',
    type: 'predefined',
    imap: {
      host: 'imap.gmail.com',
      port: 993,
      secure: true
    },
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false // STARTTLS
    }
  },
  yahoo: {
    name: 'Yahoo Mail',
    type: 'predefined',
    imap: {
      host: 'imap.mail.yahoo.com',
      port: 993,
      secure: true
    },
    smtp: {
      host: 'smtp.mail.yahoo.com',
      port: 587,
      secure: false
    }
  },
  outlook: {
    name: 'Outlook.com',
    type: 'predefined',
    imap: {
      host: 'outlook.office365.com',
      port: 993,
      secure: true
    },
    smtp: {
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false
    }
  },
  hotmail: {
    name: 'Hotmail',
    type: 'predefined',
    imap: {
      host: 'outlook.office365.com',
      port: 993,
      secure: true
    },
    smtp: {
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false
    }
  },
  zoho: {
    name: 'Zoho Mail',
    type: 'predefined',
    imap: {
      host: 'imap.zoho.com',
      port: 993,
      secure: true
    },
    smtp: {
      host: 'smtp.zoho.com',
      port: 587,
      secure: false
    }
  },
  protonmail: {
    name: 'ProtonMail',
    type: 'predefined',
    imap: {
      host: '127.0.0.1', // Requires ProtonMail Bridge
      port: 1143,
      secure: false
    },
    smtp: {
      host: '127.0.0.1', // Requires ProtonMail Bridge
      port: 1025,
      secure: false
    }
  }
};

export function detectProvider(email: string): EmailProvider | null {
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!domain) return null;
  
  const domainMap: Record<string, string> = {
    'gmail.com': 'gmail',
    'googlemail.com': 'gmail',
    'yahoo.com': 'yahoo',
    'yahoo.co.uk': 'yahoo',
    'yahoo.fr': 'yahoo',
    'outlook.com': 'outlook',
    'hotmail.com': 'hotmail',
    'hotmail.co.uk': 'hotmail',
    'live.com': 'outlook',
    'msn.com': 'outlook',
    'zoho.com': 'zoho',
    'zohomail.com': 'zoho',
    'protonmail.com': 'protonmail',
    'protonmail.ch': 'protonmail',
    'pm.me': 'protonmail'
  };
  
  const providerKey = domainMap[domain];
  return providerKey ? EMAIL_PROVIDERS[providerKey] : null;
}

export function createCustomProvider(
  name: string,
  imapHost: string,
  imapPort: number,
  imapSecure: boolean,
  smtpHost: string,
  smtpPort: number,
  smtpSecure: boolean
): EmailProvider {
  return {
    name,
    type: 'custom',
    imap: {
      host: imapHost,
      port: imapPort,
      secure: imapSecure
    },
    smtp: {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure
    }
  };
}