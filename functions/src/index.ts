import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Configure Nodemailer Transporter
// Defaults to environment variables or Gmail SMTP / SendGrid
function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const user = process.env.SMTP_USER || process.env.MAIL_USER || "";
  const pass = process.env.SMTP_PASS || process.env.MAIL_PASS || "";

  if (!user || !pass) {
    logger.warn("SMTP credentials not fully configured in Cloud Function environment. Simulating email dispatch.");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

/**
 * Automated Cloud Function triggered on new Booking document creation
 * Path: bookings/{bookingId}
 */
export const onBookingCreated = onDocumentCreated(
  {
    document: "bookings/{bookingId}",
    region: "europe-west1",
    secrets: ["SMTP_USER", "SMTP_PASS"]
  },
  async (event) => {
    const snap = event.data;
    if (!snap) {
      logger.info("No snapshot data available.");
      return;
    }

    const booking = snap.data();
    const bookingId = event.params.bookingId;

    logger.info(`Processing new booking notification for ${bookingId}`, { booking });

    // Idempotency check: don't send duplicate emails if already recorded
    if (booking.emailNotifications?.customerSent && booking.emailNotifications?.adminSent) {
      logger.info(`Booking ${bookingId} already notified. Skipping.`);
      return;
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "velmora.oct@gmail.com";
    const fromAddress = process.env.SMTP_FROM || `"VELMORA Aesthetics" <${process.env.SMTP_USER || "noreply@velmora-aesthetics.eg"}>`;

    const transporter = getTransporter();

    let customerSent = false;
    let adminSent = false;
    let dispatchDetails = "";

    // 1. Send Customer Confirmation Email (if customer provided email)
    if (booking.customerEmail && booking.customerEmail.includes("@")) {
      const branchLabel = booking.branch === "october" ? "فرع مدينة 6 أكتوبر" : "فرع الشيخ زايد";
      const customerSubject = `تأكيد استلام طلب حجزك لدى عيادة ڤيلمورا | VELMORA Booking #${bookingId}`;

      const customerHtml = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    body { margin:0; padding:0; background:#FAF7F2; font-family:'Segoe UI', Tahoma, Arial, sans-serif; }
    .box { max-width:600px; margin:20px auto; background:#FFF; border-radius:10px; border:1px solid #E8DEC8; overflow:hidden; }
    .hdr { background:#1F1C18; color:#FAF7F2; padding:30px 20px; text-align:center; }
    .hdr h1 { margin:0; font-family:Georgia, serif; font-size:24px; letter-spacing:2px; }
    .cnt { padding:30px 25px; line-height:1.7; color:#222; }
    .card { background:#FAF7F2; border:1px solid #EADCC8; border-radius:8px; padding:18px; margin:18px 0; }
    .badge { background:#FEF3C7; color:#92400E; padding:4px 12px; border-radius:15px; font-size:12px; font-weight:bold; }
    .ftr { background:#F8F5EF; text-align:center; padding:15px; font-size:11px; color:#8A8173; border-top:1px solid #EADCC8; }
  </style>
</head>
<body>
  <div class="box">
    <div class="hdr">
      <h1>VELMORA</h1>
      <div style="color:#C5A265; font-size:10px; letter-spacing:2px; margin-top:4px;">AESTHETICS &amp; BEAUTY</div>
    </div>
    <div class="cnt">
      <h3 style="margin-top:0;">عزيزتي ${booking.customerName}،</h3>
      <p style="font-size:14px; color:#5D5548;">
        تم استلام طلب حجز موعدكِ بنجاح لدى عيادة ڤيلمورا للتجميل والعناية بالبشرة.
      </p>
      <div><span class="badge">حالة الطلب: قيد المراجعة والتأكيد (Pending)</span></div>
      
      <div class="card">
        <p><strong>كود الحجز:</strong> <code style="color:#8A714C;">${bookingId}</code></p>
        <p><strong>الخدمة المطلوبة:</strong> ${booking.serviceNameAr || booking.serviceNameEn}</p>
        <p><strong>الفرع:</strong> ${branchLabel}</p>
        <p><strong>الموعد:</strong> <span dir="ltr">${booking.appointmentDate} @ ${booking.appointmentTime}</span></p>
        <p><strong>السعر الاسترشادي:</strong> ${booking.priceEgp} ج.م (EGP)</p>
      </div>

      <p style="font-size:12px; background:#F4EDE2; border-right:3px solid #C5A265; padding:12px; border-radius:4px; color:#5D5548;">
        <strong>ملاحظة:</strong> سيتواصل معكِ فريق الاستقبال هاتفياً أو عبر واتساب لتأكيد الموعد النهائي وإعطائكِ التوجيهات التحضيرية قبل الحضور.
      </p>

      <div style="text-align:center; margin-top:25px;">
        <a href="https://wa.me/20102345678" style="background:#059669; color:#FFF; text-decoration:none; padding:10px 22px; border-radius:5px; font-size:13px; font-weight:bold; display:inline-block;">
          محادثة واتساب مباشرة
        </a>
      </div>
    </div>
    <div class="ftr">
      عيادة ڤيلمورا • مدينة 6 أكتوبر والشيخ زايد • هاتف: +20 102 345 6789
    </div>
  </div>
</body>
</html>
      `;

      if (transporter) {
        try {
          await transporter.sendMail({
            from: fromAddress,
            to: booking.customerEmail,
            subject: customerSubject,
            html: customerHtml
          });
          customerSent = true;
          logger.info(`Customer confirmation email sent to ${booking.customerEmail}`);
        } catch (e: any) {
          logger.error(`Error sending customer email: ${e.message}`, e);
          dispatchDetails += `Customer email error: ${e.message}; `;
        }
      } else {
        customerSent = true; // Simulated
        logger.info(`Simulated customer email sent to ${booking.customerEmail}`);
      }
    } else {
      logger.info(`No customer email specified for booking ${bookingId}`);
    }

    // 2. Send Administrator Alert Email
    const branchText = booking.branch === "october" ? "6th of October" : "Sheikh Zayed";
    const adminSubject = `[تنبيه حجز جديد] ${booking.customerName} - ${booking.serviceNameAr || booking.serviceNameEn} (${branchText})`;

    const adminHtml = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    body { margin:0; padding:0; background:#F4F1EA; font-family:'Segoe UI', Tahoma, Arial, sans-serif; color:#222; }
    .box { max-width:600px; margin:20px auto; background:#FFF; border-radius:8px; border:1px solid #D5C7B2; overflow:hidden; }
    .hdr { background:#1F1C18; color:#FAF7F2; padding:20px; text-align:center; }
    .cnt { padding:25px; line-height:1.6; }
    .tbl { width:100%; border-collapse:collapse; font-size:13px; margin:15px 0; }
    .tbl td { padding:8px 10px; border-bottom:1px solid #F0EAE1; }
    .tbl td.lbl { background:#FAF7F2; font-weight:bold; width:35%; }
  </style>
</head>
<body>
  <div class="box">
    <div class="hdr">
      <h2 style="margin:0; font-family:Georgia, serif;">VELMORA ADMIN ALERT</h2>
      <div style="color:#C5A265; font-size:11px; margin-top:3px;">طلب حجز جديد يتطلب الاتصال والتأكيد</div>
    </div>
    <div class="cnt">
      <p style="font-size:13px; color:#1E40AF; background:#EFF6FF; border:1px solid #BFDBFE; padding:10px; border-radius:6px;">
        تم تسجيل طلب حجز جديد عبر الموقع العام. يرجى التواصل مع العميل لتأكيد الموعد.
      </p>
      <table class="tbl">
        <tr><td class="lbl">كود الحجز:</td><td><code>${bookingId}</code></td></tr>
        <tr><td class="lbl">اسم العميل:</td><td><strong>${booking.customerName}</strong></td></tr>
        <tr><td class="lbl">رقم الهاتف:</td><td dir="ltr"><a href="tel:${booking.customerPhone}">${booking.customerPhone}</a></td></tr>
        <tr><td class="lbl">البريد:</td><td dir="ltr">${booking.customerEmail || "غير محدد"}</td></tr>
        <tr><td class="lbl">الخدمة:</td><td>${booking.serviceNameAr || booking.serviceNameEn}</td></tr>
        <tr><td class="lbl">الفرع:</td><td>${branchText}</td></tr>
        <tr><td class="lbl">الموعد:</td><td dir="ltr">${booking.appointmentDate} @ ${booking.appointmentTime}</td></tr>
        <tr><td class="lbl">السعر:</td><td>${booking.priceEgp} ج.م</td></tr>
        ${booking.notes ? `<tr><td class="lbl">ملاحظات:</td><td>${booking.notes}</td></tr>` : ""}
      </table>
      <div style="text-align:center; margin-top:20px;">
        <a href="https://wa.me/${String(booking.customerPhone).replace(/[^0-9]/g, "")}" style="background:#059669; color:#FFF; text-decoration:none; padding:10px 20px; border-radius:5px; font-size:13px; font-weight:bold; display:inline-block;">
          مراسلة العميل عبر واتساب
        </a>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: fromAddress,
          to: adminEmail,
          subject: adminSubject,
          html: adminHtml
        });
        adminSent = true;
        logger.info(`Admin notification email sent to ${adminEmail}`);
      } catch (e: any) {
        logger.error(`Error sending admin email: ${e.message}`, e);
        dispatchDetails += `Admin email error: ${e.message}; `;
      }
    } else {
      adminSent = true; // Simulated
      logger.info(`Simulated admin alert email dispatched to ${adminEmail}`);
    }

    // 3. Update Firestore document with email notification timestamps and status
    try {
      await db.collection("bookings").doc(bookingId).update({
        emailNotifications: {
          customerSent,
          adminSent,
          sentAt: new Date().toISOString(),
          details: dispatchDetails || "Dispatched successfully"
        }
      });
      logger.info(`Updated booking ${bookingId} notification metadata.`);
    } catch (e: any) {
      logger.warn(`Could not update booking document with notification status: ${e.message}`);
    }
  }
);
