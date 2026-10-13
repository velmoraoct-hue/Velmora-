import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateCustomerEmailHtml, generateAdminAlertEmailHtml } from './src/lib/emailTemplates.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Transporter configuration for email notifications
function getMailer() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || process.env.MAIL_USER || '';
  const pass = process.env.SMTP_PASS || process.env.MAIL_PASS || '';

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

// API endpoint to dispatch booking emails
app.post('/api/bookings/notify', async (req, res) => {
  try {
    const booking = req.body;
    if (!booking || !booking.id || !booking.customerName || !booking.customerPhone) {
      return res.status(400).json({ error: 'Missing required booking information' });
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'velmora.oct@gmail.com';
    const fromAddress = process.env.SMTP_FROM || `"VELMORA Aesthetics" <${process.env.SMTP_USER || 'notifications@velmora-aesthetics.eg'}>`;

    const mailer = getMailer();

    // 1. Prepare Customer Email
    let customerResult = { sent: false, note: 'No email provided' };
    if (booking.customerEmail && booking.customerEmail.includes('@')) {
      const customerContent = generateCustomerEmailHtml(booking);
      if (mailer) {
        try {
          await mailer.sendMail({
            from: fromAddress,
            to: booking.customerEmail,
            subject: customerContent.subject,
            html: customerContent.html,
            text: customerContent.text
          });
          customerResult = { sent: true, note: 'Dispatched via SMTP' };
        } catch (err: any) {
          console.error('Customer email delivery error:', err);
          customerResult = { sent: false, note: err.message };
        }
      } else {
        customerResult = { sent: true, note: 'Simulated dispatch (configure SMTP in .env to deliver live)' };
      }
    }

    // 2. Prepare Admin Email
    let adminResult = { sent: false, note: '' };
    const adminContent = generateAdminAlertEmailHtml(booking, adminEmail);
    if (mailer) {
      try {
        await mailer.sendMail({
          from: fromAddress,
          to: adminEmail,
          subject: adminContent.subject,
          html: adminContent.html,
          text: adminContent.text
        });
        adminResult = { sent: true, note: 'Dispatched via SMTP' };
      } catch (err: any) {
        console.error('Admin alert email delivery error:', err);
        adminResult = { sent: false, note: err.message };
      }
    } else {
      adminResult = { sent: true, note: 'Simulated dispatch (configure SMTP in .env to deliver live)' };
    }

    console.log(`[VELMORA Email Dispatch] Booking ${booking.id}:`, { customerResult, adminResult });

    return res.json({
      success: true,
      bookingId: booking.id,
      customer: customerResult,
      admin: adminResult,
      simulated: !mailer
    });
  } catch (error: any) {
    console.error('Error handling booking notification:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Setup Vite middleware or Static files
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VELMORA Server running on port ${PORT}`);
  });
}

startServer();
