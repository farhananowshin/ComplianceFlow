import nodemailer from 'nodemailer';
import { env } from './env.js';

let transporter: nodemailer.Transporter | null = null;

/**
 * Get or initialize Nodemailer SMTP Transporter
 */
export const getTransporter = (): nodemailer.Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST || 'smtp.gmail.com',
      port: env.SMTP_PORT || 587,
      secure: env.SMTP_PORT === 465,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASS,
            }
          : undefined,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return transporter;
};

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send Automated Email via SMTP Transport
 */
export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
  try {
    const mailer = getTransporter();
    const recipient = Array.isArray(options.to) ? options.to.join(', ') : options.to;

    // In dev mode without configured SMTP credentials, simulate email dispatch log gracefully
    if (!env.SMTP_USER || !env.SMTP_PASS) {
      console.log(`[SMTP SIMULATION] Email to '${recipient}' | Subject: '${options.subject}'`);
      return true;
    }

    const info = await mailer.sendMail({
      from: env.EMAIL_FROM,
      to: recipient,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>?/gm, ''),
    });

    console.log(`✉️ Email successfully dispatched to ${recipient} (Message ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to deliver email to ${options.to}:`, error);
    return false;
  }
};

export default sendEmail;
