import fs from 'fs-extra';
import path from 'path';
import { EmailMessage } from '../types/email.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const EMAILS_DIR = path.join(DATA_DIR, 'emails');
const ACCOUNTS_DIR = path.join(DATA_DIR, 'accounts');
const ATTACHMENTS_DIR = path.join(DATA_DIR, 'attachments');

export async function setupDirectories() {
  await fs.ensureDir(EMAILS_DIR);
  await fs.ensureDir(ACCOUNTS_DIR);
  await fs.ensureDir(ATTACHMENTS_DIR);
  console.log('📁 Storage directories created');
}

export async function saveEmailAsJSON(email: EmailMessage): Promise<string> {
  const accountDir = path.join(EMAILS_DIR, email.accountId);
  await fs.ensureDir(accountDir);
  
  const jsonPath = path.join(accountDir, `${email.id}.json`);
  await fs.writeJSON(jsonPath, email, { spaces: 2 });
  
  return jsonPath;
}

export async function saveEmailAsEML(emailId: string, accountId: string, emlContent: string): Promise<string> {
  const accountDir = path.join(EMAILS_DIR, accountId);
  await fs.ensureDir(accountDir);
  
  const emlPath = path.join(accountDir, `${emailId}.eml`);
  await fs.writeFile(emlPath, emlContent, 'utf8');
  
  return emlPath;
}

export async function saveAttachment(
  accountId: string, 
  emailId: string, 
  attachmentId: string, 
  filename: string, 
  content: Buffer
): Promise<string> {
  const attachmentDir = path.join(ATTACHMENTS_DIR, accountId, emailId);
  await fs.ensureDir(attachmentDir);
  
  const filePath = path.join(attachmentDir, `${attachmentId}_${filename}`);
  await fs.writeFile(filePath, content);
  
  return filePath;
}

export async function loadEmail(accountId: string, emailId: string): Promise<EmailMessage | null> {
  try {
    const jsonPath = path.join(EMAILS_DIR, accountId, `${emailId}.json`);
    return await fs.readJSON(jsonPath);
  } catch (error) {
    return null;
  }
}

export async function loadEMLContent(accountId: string, emailId: string): Promise<string | null> {
  try {
    const emlPath = path.join(EMAILS_DIR, accountId, `${emailId}.eml`);
    return await fs.readFile(emlPath, 'utf8');
  } catch (error) {
    return null;
  }
}

export async function listEmails(accountId: string): Promise<EmailMessage[]> {
  try {
    const accountDir = path.join(EMAILS_DIR, accountId);
    const files = await fs.readdir(accountDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const emails: EmailMessage[] = [];
    for (const file of jsonFiles) {
      try {
        const email = await fs.readJSON(path.join(accountDir, file));
        emails.push(email);
      } catch (error) {
        console.error(`Error reading email file ${file}:`, error);
      }
    }
    
    return emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    return [];
  }
}

export async function saveAccount(account: any): Promise<void> {
  const accountPath = path.join(ACCOUNTS_DIR, `${account.id}.json`);
  await fs.writeJSON(accountPath, account, { spaces: 2 });
}

export async function loadAccount(accountId: string): Promise<any | null> {
  try {
    const accountPath = path.join(ACCOUNTS_DIR, `${accountId}.json`);
    return await fs.readJSON(accountPath);
  } catch (error) {
    return null;
  }
}

export async function listAccounts(): Promise<any[]> {
  try {
    const files = await fs.readdir(ACCOUNTS_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const accounts: any[] = [];
    for (const file of jsonFiles) {
      try {
        const account = await fs.readJSON(path.join(ACCOUNTS_DIR, file));
        accounts.push(account);
      } catch (error) {
        console.error(`Error reading account file ${file}:`, error);
      }
    }
    
    return accounts;
  } catch (error) {
    return [];
  }
}