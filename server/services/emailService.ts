import Imap from 'imap';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { EmailAccount, EmailMessage, SendEmailRequest, EmailAttachment } from '../types/email.js';
import { saveEmailAsJSON, saveEmailAsEML, saveAttachment } from '../utils/fileSystem.js';

export class EmailService {
  private imapConnection: Imap | null = null;
  private smtpTransporter: nodemailer.Transporter | null = null;

  async connectIMAP(account: EmailAccount): Promise<Imap> {
    return new Promise((resolve, reject) => {
      const imapConfig: any = {
        user: account.email,
        password: account.password,
        host: account.provider.imap.host,
        port: account.provider.imap.port,
        tlsOptions: { rejectUnauthorized: false },
        connTimeout: 60000, // 60 seconds connection timeout
        authTimeout: 30000, // 30 seconds authentication timeout
        keepalive: true
      };

      // Handle SSL/TLS configuration properly
      if (account.provider.imap.secure) {
        // For secure connections (port 993), use implicit SSL - don't set tls
        // The library handles implicit SSL automatically on secure ports
      } else {
        // For non-secure connections (port 143), enable STARTTLS
        imapConfig.tls = true;
      }

      const imap = new Imap(imapConfig);

      imap.once('ready', () => {
        this.imapConnection = imap;
        resolve(imap);
      });

      imap.once('error', (err: Error) => {
        reject(err);
      });

      imap.connect();
    });
  }

  async connectSMTP(account: EmailAccount): Promise<nodemailer.Transporter> {
    const transporter = nodemailer.createTransporter({
      host: account.provider.smtp.host,
      port: account.provider.smtp.port,
      secure: account.provider.smtp.secure,
      auth: {
        user: account.email,
        pass: account.password
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.verify();
    this.smtpTransporter = transporter;
    return transporter;
  }

  async fetchEmails(account: EmailAccount, folder: string = 'INBOX', limit: number = 50): Promise<EmailMessage[]> {
    const imap = await this.connectIMAP(account);
    
    return new Promise((resolve, reject) => {
      imap.openBox(folder, true, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        const totalMessages = box.messages.total;
        const start = Math.max(1, totalMessages - limit + 1);
        const end = totalMessages;

        if (start > end) {
          resolve([]);
          return;
        }

        const fetch = imap.seq.fetch(`${start}:${end}`, {
          bodies: '',
          struct: true
        });

        const emails: EmailMessage[] = [];

        fetch.on('message', (msg, seqno) => {
          let emailData: any = {};

          msg.on('body', (stream, info) => {
            let buffer = '';
            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8');
            });

            stream.once('end', async () => {
              try {
                const parsed = await simpleParser(buffer);
                const emailId = uuidv4();

                // Process attachments
                const attachments: EmailAttachment[] = [];
                if (parsed.attachments) {
                  for (const att of parsed.attachments) {
                    const attachmentId = uuidv4();
                    let filePath: string | undefined;
                    
                    if (att.content) {
                      filePath = await saveAttachment(
                        account.id,
                        emailId,
                        attachmentId,
                        att.filename || 'attachment',
                        att.content
                      );
                    }

                    attachments.push({
                      id: attachmentId,
                      filename: att.filename || 'attachment',
                      contentType: att.contentType || 'application/octet-stream',
                      size: att.size || 0,
                      cid: att.cid,
                      path: filePath
                    });
                  }
                }

                const email: EmailMessage = {
                  id: emailId,
                  messageId: parsed.messageId || `${emailId}@mailmount.local`,
                  accountId: account.id,
                  subject: parsed.subject || '(No Subject)',
                  from: parsed.from?.value || [],
                  to: parsed.to?.value || [],
                  cc: parsed.cc?.value || [],
                  bcc: parsed.bcc?.value || [],
                  date: parsed.date?.toISOString() || new Date().toISOString(),
                  body: {
                    text: parsed.text,
                    html: parsed.html
                  },
                  attachments,
                  headers: parsed.headers || {},
                  folder,
                  flags: emailData.flags || [],
                  uid: emailData.uid || seqno,
                  size: buffer.length,
                  read: emailData.flags?.includes('\\Seen') || false,
                  starred: emailData.flags?.includes('\\Flagged') || false,
                  important: false, // Could be enhanced with provider-specific logic
                  category: this.categorizeEmail(parsed.subject || '', parsed.from?.value?.[0]?.address || ''),
                  emlPath: '',
                  jsonPath: '',
                  createdAt: new Date().toISOString()
                };

                // Save as JSON and EML
                const jsonPath = await saveEmailAsJSON(email);
                const emlPath = await saveEmailAsEML(emailId, account.id, buffer);
                
                email.jsonPath = jsonPath;
                email.emlPath = emlPath;
                
                // Update the JSON with the paths
                await saveEmailAsJSON(email);

                emails.push(email);
              } catch (parseError) {
                console.error('Error parsing email:', parseError);
              }
            });
          });

          msg.once('attributes', (attrs) => {
            emailData.uid = attrs.uid;
            emailData.flags = attrs.flags;
          });
        });

        fetch.once('error', (err) => {
          reject(err);
        });

        fetch.once('end', () => {
          imap.end();
          resolve(emails.reverse()); // Most recent first
        });
      });
    });
  }

  async sendEmail(account: EmailAccount, emailData: SendEmailRequest): Promise<string> {
    const transporter = await this.connectSMTP(account);

    const mailOptions = {
      from: `${account.displayName} <${account.email}>`,
      to: emailData.to.map(addr => `${addr.name || ''} <${addr.address}>`).join(', '),
      cc: emailData.cc?.map(addr => `${addr.name || ''} <${addr.address}>`).join(', '),
      bcc: emailData.bcc?.map(addr => `${addr.name || ''} <${addr.address}>`).join(', '),
      subject: emailData.subject,
      text: emailData.body.text,
      html: emailData.body.html,
      attachments: emailData.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType
      })),
      replyTo: emailData.replyTo,
      inReplyTo: emailData.inReplyTo
    };

    const info = await transporter.sendMail(mailOptions);
    return info.messageId;
  }

  private categorizeEmail(subject: string, fromAddress: string): string {
    const subjectLower = subject.toLowerCase();
    const fromLower = fromAddress.toLowerCase();

    // Simple categorization logic
    if (subjectLower.includes('sale') || subjectLower.includes('offer') || subjectLower.includes('deal')) {
      return 'Promotions';
    }
    
    if (fromLower.includes('noreply') || fromLower.includes('no-reply') || subjectLower.includes('newsletter')) {
      return 'Promotions';
    }

    if (subjectLower.includes('work') || subjectLower.includes('meeting') || subjectLower.includes('project')) {
      return 'Work';
    }

    if (subjectLower.includes('invoice') || subjectLower.includes('payment') || subjectLower.includes('bank')) {
      return 'Finance';
    }

    return 'Primary';
  }

  disconnect(): void {
    if (this.imapConnection) {
      this.imapConnection.end();
      this.imapConnection = null;
    }
    if (this.smtpTransporter) {
      this.smtpTransporter.close();
      this.smtpTransporter = null;
    }
  }
}