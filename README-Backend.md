# MailMount Backend

A local email backend supporting all major email providers with regular password authentication.

## Features

- **Universal Provider Support**: Gmail, Yahoo, Outlook, Zoho, ProtonMail, and custom SMTP
- **Regular Password Auth**: No app passwords required
- **Dual Storage**: Emails saved as both JSON and .eml files
- **Full Email Content**: Headers, body, attachments, metadata
- **Local Storage**: All data stored locally for privacy

## Quick Start

1. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Start the backend:**
   ```bash
   npm run dev
   ```

3. **Start both frontend and backend:**
   ```bash
   node start-mailmount.js
   ```

## API Endpoints

### Account Management
- `GET /api/accounts/providers` - Get all email providers
- `POST /api/accounts/detect-provider` - Auto-detect provider from email
- `POST /api/accounts/test-connection` - Test email credentials
- `POST /api/accounts` - Add new email account
- `GET /api/accounts` - List all accounts
- `POST /api/accounts/custom-provider` - Create custom provider

### Email Operations
- `POST /api/emails/:accountId/sync` - Sync emails from server
- `GET /api/emails/:accountId` - Get account emails
- `GET /api/emails` - Get all emails (unified inbox)
- `POST /api/emails/:accountId/send` - Send email
- `GET /api/emails/:accountId/:emailId` - Get specific email

## Supported Providers

### Pre-configured
- **Gmail**: imap.gmail.com, smtp.gmail.com
- **Yahoo**: imap.mail.yahoo.com, smtp.mail.yahoo.com
- **Outlook**: outlook.office365.com, smtp-mail.outlook.com
- **Zoho**: imap.zoho.com, smtp.zoho.com
- **ProtonMail**: Requires ProtonMail Bridge

### Custom SMTP
Add any email provider by specifying:
- IMAP host and port
- SMTP host and port
- Security settings (TLS/SSL)

## Data Storage

All data is stored locally in the `data/` directory:

```
data/
├── emails/
│   └── {accountId}/
│       ├── {emailId}.json    # Structured email data
│       └── {emailId}.eml     # Raw email format
├── accounts/
│   └── {accountId}.json      # Account configuration
└── attachments/
    └── {accountId}/
        └── {emailId}/
            └── {attachmentId}_{filename}
```

## Email Categories

Emails are automatically categorized:
- **Primary**: Personal emails
- **Work**: Work-related emails  
- **Promotions**: Marketing and promotional emails
- **Finance**: Banking and financial emails

## Security Notes

- Passwords are stored locally (consider encryption)
- For Gmail, you may need to enable "Less secure app access"
- ProtonMail requires the ProtonMail Bridge application
- Some providers may require app-specific passwords despite our efforts to use regular passwords

## Development

Backend built with:
- Express.js for API server
- nodemailer for SMTP
- imap for email fetching
- mailparser for email parsing
- fs-extra for file operations