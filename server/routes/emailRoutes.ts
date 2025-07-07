import express from 'express';
import { EmailService } from '../services/emailService.js';
import { loadAccount, listEmails, loadEmail } from '../utils/fileSystem.js';
import { SendEmailRequest } from '../types/email.js';

const router = express.Router();

// Sync emails for an account
router.post('/:accountId/sync', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { folder = 'INBOX', limit = 50 } = req.body;

    const account = await loadAccount(accountId);
    if (!account) {
      return res.status(404).json({
        error: 'Account not found',
        success: false
      });
    }

    const emailService = new EmailService();
    const emails = await emailService.fetchEmails(account, folder, limit);
    emailService.disconnect();

    // Update account last sync time
    account.lastSync = new Date().toISOString();
    await saveAccount(account);

    res.json({
      emails,
      synced: emails.length,
      success: true
    });
  } catch (error) {
    console.error('Error syncing emails:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to sync emails',
      success: false
    });
  }
});

// Get emails for an account
router.get('/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const account = await loadAccount(accountId);
    if (!account) {
      return res.status(404).json({
        error: 'Account not found',
        success: false
      });
    }

    const emails = await listEmails(accountId);
    
    res.json({
      emails,
      total: emails.length,
      success: true
    });
  } catch (error) {
    console.error('Error getting emails:', error);
    res.status(500).json({
      error: 'Failed to get emails',
      success: false
    });
  }
});

// Get specific email
router.get('/:accountId/:emailId', async (req, res) => {
  try {
    const { accountId, emailId } = req.params;
    
    const email = await loadEmail(accountId, emailId);
    if (!email) {
      return res.status(404).json({
        error: 'Email not found',
        success: false
      });
    }

    res.json({
      email,
      success: true
    });
  } catch (error) {
    console.error('Error getting email:', error);
    res.status(500).json({
      error: 'Failed to get email',
      success: false
    });
  }
});

// Send email
router.post('/:accountId/send', async (req, res) => {
  try {
    const { accountId } = req.params;
    const emailData: SendEmailRequest = req.body;

    const account = await loadAccount(accountId);
    if (!account) {
      return res.status(404).json({
        error: 'Account not found',
        success: false
      });
    }

    if (!emailData.to || !emailData.subject) {
      return res.status(400).json({
        error: 'Recipient and subject are required',
        success: false
      });
    }

    const emailService = new EmailService();
    const messageId = await emailService.sendEmail(account, emailData);
    emailService.disconnect();

    res.json({
      messageId,
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to send email',
      success: false
    });
  }
});

// Get all emails across all accounts (for unified inbox)
router.get('/', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    const accounts = await listAccounts();
    const allEmails = [];

    for (const account of accounts) {
      const emails = await listEmails(account.id);
      allEmails.push(...emails);
    }

    // Sort by date (most recent first) and apply limit
    allEmails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const limitedEmails = allEmails.slice(0, Number(limit));

    res.json({
      emails: limitedEmails,
      total: limitedEmails.length,
      success: true
    });
  } catch (error) {
    console.error('Error getting all emails:', error);
    res.status(500).json({
      error: 'Failed to get emails',
      success: false
    });
  }
});

export { router as emailRoutes };