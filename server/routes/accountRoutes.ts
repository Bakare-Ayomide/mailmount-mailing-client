import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { EmailAccount } from '../types/email.js';
import { EMAIL_PROVIDERS, detectProvider, createCustomProvider } from '../config/providers.js';
import { saveAccount, loadAccount, listAccounts } from '../utils/fileSystem.js';
import { EmailService } from '../services/emailService.js';

const router = express.Router();

// Get all email providers
router.get('/providers', (req, res) => {
  res.json({
    providers: EMAIL_PROVIDERS,
    success: true
  });
});

// Detect provider from email address
router.post('/detect-provider', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      error: 'Email address is required',
      success: false
    });
  }

  const provider = detectProvider(email);
  res.json({
    provider,
    success: true
  });
});

// Test email account connection
router.post('/test-connection', async (req, res) => {
  try {
    const { email, password, provider } = req.body;

    if (!email || !password || !provider) {
      return res.status(400).json({
        error: 'Email, password, and provider are required',
        success: false
      });
    }

    const testAccount: EmailAccount = {
      id: 'test',
      email,
      password,
      provider,
      displayName: email.split('@')[0],
      createdAt: new Date().toISOString()
    };

    const emailService = new EmailService();
    
    // Test IMAP connection
    await emailService.connectIMAP(testAccount);
    
    // Test SMTP connection
    await emailService.connectSMTP(testAccount);
    
    emailService.disconnect();

    res.json({
      success: true,
      message: 'Connection successful'
    });
  } catch (error) {
    console.error('Connection test failed:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Connection failed',
      success: false
    });
  }
});

// Add new email account
router.post('/', async (req, res) => {
  try {
    const { email, password, displayName, provider } = req.body;

    if (!email || !password || !provider) {
      return res.status(400).json({
        error: 'Email, password, and provider are required',
        success: false
      });
    }

    const accountId = uuidv4();
    const account: EmailAccount = {
      id: accountId,
      email,
      password,
      provider,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString()
    };

    // Test connection before saving
    const emailService = new EmailService();
    await emailService.connectIMAP(account);
    await emailService.connectSMTP(account);
    emailService.disconnect();

    await saveAccount(account);

    // Return account without password
    const { password: _, ...accountResponse } = account;
    res.json({
      account: accountResponse,
      success: true
    });
  } catch (error) {
    console.error('Error adding account:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to add account',
      success: false
    });
  }
});

// Get all accounts
router.get('/', async (req, res) => {
  try {
    const accounts = await listAccounts();
    
    // Remove passwords from response
    const accountsWithoutPasswords = accounts.map(({ password, ...account }) => account);
    
    res.json({
      accounts: accountsWithoutPasswords,
      success: true
    });
  } catch (error) {
    console.error('Error listing accounts:', error);
    res.status(500).json({
      error: 'Failed to list accounts',
      success: false
    });
  }
});

// Get specific account
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

    // Remove password from response
    const { password, ...accountResponse } = account;
    res.json({
      account: accountResponse,
      success: true
    });
  } catch (error) {
    console.error('Error loading account:', error);
    res.status(500).json({
      error: 'Failed to load account',
      success: false
    });
  }
});

// Create custom provider
router.post('/custom-provider', (req, res) => {
  try {
    const {
      name,
      imapHost,
      imapPort,
      imapSecure,
      smtpHost,
      smtpPort,
      smtpSecure
    } = req.body;

    if (!name || !imapHost || !imapPort || !smtpHost || !smtpPort) {
      return res.status(400).json({
        error: 'All provider details are required',
        success: false
      });
    }

    const provider = createCustomProvider(
      name,
      imapHost,
      parseInt(imapPort),
      Boolean(imapSecure),
      smtpHost,
      parseInt(smtpPort),
      Boolean(smtpSecure)
    );

    res.json({
      provider,
      success: true
    });
  } catch (error) {
    console.error('Error creating custom provider:', error);
    res.status(400).json({
      error: 'Failed to create custom provider',
      success: false
    });
  }
});

export { router as accountRoutes };