export interface BookingEmailData {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceNameAr: string;
  serviceNameEn: string;
  practitionerName?: string;
  branch: 'october' | 'zayed';
  appointmentDate: string;
  appointmentTime: string;
  priceEgp: number;
  notes?: string;
}

export function generateCustomerEmailHtml(booking: BookingEmailData): { subject: string; html: string; text: string } {
  const branchNameAr = booking.branch === 'october' ? 'فرع مدينة 6 أكتوبر (المحور المركزي)' : 'فرع الشيخ زايد (وصلة دهشور)';
  const branchNameEn = booking.branch === 'october' ? '6th of October City Branch (Central Axis)' : 'Sheikh Zayed Branch (Dahshur Link)';

  const subject = `تأكيد استلام طلب حجزك لدى عيادة ڤيلمورا | VELMORA Booking Request #${booking.id}`;

  const text = `
مرحباً ${booking.customerName}،
تم استلام طلب حجزك لدى عيادة ڤيلمورا للتجميل والعناية بالبشرة (VELMORA AESTHETICS & BEAUTY).

رقم الحجز: ${booking.id}
الخدمة: ${booking.serviceNameAr} (${booking.serviceNameEn})
الفرع: ${branchNameAr}
الموعد: ${booking.appointmentDate} الساعة ${booking.appointmentTime}
السعر الاسترشادي: ${booking.priceEgp} ج.م
الحالة: قيد التأكيد (Pending)

يرجى العلم بأن طلب الحجز قيد المراجعة من قبل فريق الاستقبال، وسنتواصل معكِ هاتفياً أو عبر واتساب لتأكيد الموعد النهائي وإعطائكِ التعليمات التحضيرية للجلسة.

للتواصل والاستفسار السريع:
واتساب: +20 102 345 6789
عيادة ڤيلمورا - 6 أكتوبر & الشيخ زايد
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FAF7F2; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color: #222222; }
    .container { max-width: 600px; margin: 20px auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E8DEC8; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
    .header { background-color: #1F1C18; padding: 35px 25px; text-align: center; color: #FAF7F2; }
    .header h1 { margin: 0; font-size: 26px; font-weight: normal; letter-spacing: 3px; font-family: Georgia, serif; color: #FAF7F2; }
    .header .subtitle { margin-top: 5px; font-size: 10px; letter-spacing: 2px; color: #C5A265; text-transform: uppercase; }
    .content { padding: 35px 28px; line-height: 1.7; }
    .greeting { font-size: 18px; font-weight: 600; color: #1F1C18; margin-bottom: 12px; }
    .status-badge { display: inline-block; background-color: #FEF3C7; color: #92400E; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 20px; border: 1px solid #FDE68A; margin-bottom: 20px; }
    .card { background-color: #FAF7F2; border: 1px solid #EADCC8; border-radius: 10px; padding: 20px; margin: 20px 0; }
    .card-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #EFE6D9; font-size: 13px; }
    .card-row:last-child { border-bottom: none; }
    .label { color: #786F62; }
    .value { font-weight: 600; color: #1F1C18; }
    .notice { background-color: #F4EDE2; border-right: 4px solid #C5A265; padding: 14px 16px; font-size: 12px; color: #5D5548; margin: 22px 0; border-radius: 0 8px 8px 0; }
    .btn-container { text-align: center; margin: 28px 0 10px 0; }
    .btn { display: inline-block; background-color: #1F1C18; color: #FAF7F2 !important; text-decoration: none; padding: 12px 28px; font-size: 13px; font-weight: 600; border-radius: 6px; }
    .whatsapp-btn { display: inline-block; background-color: #059669; color: #FFFFFF !important; text-decoration: none; padding: 10px 22px; font-size: 12px; font-weight: 600; border-radius: 6px; margin-top: 10px; }
    .footer { background-color: #F8F5EF; padding: 20px; text-align: center; font-size: 11px; color: #8A8173; border-top: 1px solid #EADCC8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>VELMORA</h1>
      <div class="subtitle">Aesthetics &amp; Beauty • 6th of October &amp; Sheikh Zayed</div>
    </div>
    
    <div class="content">
      <div class="greeting">عزيزتي ${booking.customerName}،</div>
      <p style="font-size: 14px; color: #524B40;">
        سعداء باختياركِ لعيادة ڤيلمورا. نود إعلامكِ بأننا استلمنا طلب حجز موعدكِ بنجاح، وتفاصيله موضحة أدناه:
      </p>

      <div>
        <span class="status-badge">حالة الطلب: قيد المراجعة والتأكيد (Pending)</span>
      </div>

      <div class="card">
        <div class="card-row">
          <span class="label">رقم الحجز المرجعي:</span>
          <span class="value" style="font-family: monospace; color: #8A714C;">${booking.id}</span>
        </div>
        <div class="card-row">
          <span class="label">الخدمة المطلوبة:</span>
          <span class="value">${booking.serviceNameAr} <br><span style="font-size:11px;color:#7A7265;">${booking.serviceNameEn}</span></span>
        </div>
        ${booking.practitionerName ? `
        <div class="card-row">
          <span class="label">المتخصص المفضل:</span>
          <span class="value">${booking.practitionerName}</span>
        </div>
        ` : ''}
        <div class="card-row">
          <span class="label">فرع العيادة:</span>
          <span class="value">${branchNameAr}</span>
        </div>
        <div class="card-row">
          <span class="label">الموعد والتوقيت:</span>
          <span class="value" dir="ltr">${booking.appointmentDate} @ ${booking.appointmentTime}</span>
        </div>
        <div class="card-row">
          <span class="label">السعر الاسترشادي:</span>
          <span class="value">${booking.priceEgp.toLocaleString()} ج.م (EGP)</span>
        </div>
      </div>

      <div class="notice">
        <strong>تنويه هام:</strong> الحجز الإلكتروني يمثل طلباً مبدئياً يخضع لتأكيد موظف الاستقبال للتأكد من جهوزية الغرفة السريرية وأجهزة التعقيم. سيتواصل معكِ فريقنا هاتفياً أو عبر تطبيق واتساب لتأكيد الموعد النهائي.
      </div>

      <div class="btn-container">
        <a href="https://wa.me/20102345678?text=${encodeURIComponent(`مرحباً عيادة ڤيلمورا، أود الاستفسار عن تأكيد حجزي برقم ${booking.id}`)}" class="whatsapp-btn">
          تواصل فوري عبر واتساب
        </a>
      </div>
    </div>

    <div class="footer">
      <div>عيادة ڤيلمورا للتجميل والعناية بالبشرة (VELMORA AESTHETICS)</div>
      <div style="margin-top: 4px;">فرع 6 أكتوبر: المحور المركزي • فرع الشيخ زايد: وصلة دهشور</div>
      <div style="margin-top: 4px;">جميع الحقوق محفوظة © 2026 VELMORA</div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, html, text };
}

export function generateAdminAlertEmailHtml(booking: BookingEmailData, adminEmail: string): { subject: string; html: string; text: string } {
  const branchName = booking.branch === 'october' ? '6th of October' : 'Sheikh Zayed';

  const subject = `[تنبيه حجز جديد] طلب حجز من ${booking.customerName} - ${booking.serviceNameAr} (${branchName})`;

  const text = `
تنبيه حجز جديد وارد إلى عيادة ڤيلمورا:

كود الحجز: ${booking.id}
اسم العميل: ${booking.customerName}
رقم الهاتف: ${booking.customerPhone}
البريد الإلكتروني: ${booking.customerEmail || 'غير محدد'}
الخدمة: ${booking.serviceNameAr} (${booking.serviceNameEn})
المتخصص: ${booking.practitionerName || 'أي متخصص متاح'}
الفرع: ${branchName}
التاريخ والوقت: ${booking.appointmentDate} @ ${booking.appointmentTime}
السعر: ${booking.priceEgp} ج.م
الملاحظات: ${booking.notes || 'لا توجد ملاحظات'}

يرجى الدخول إلى لوحة التحكم والتواصل مع العميل لتأكيد الموعد.
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F4F1EA; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color: #222222; }
    .container { max-width: 600px; margin: 20px auto; background-color: #FFFFFF; border-radius: 10px; overflow: hidden; border: 1px solid #D5C7B2; }
    .header { background-color: #1F1C18; padding: 22px; color: #FAF7F2; text-align: center; }
    .header h2 { margin: 0; font-size: 20px; font-weight: normal; font-family: Georgia, serif; }
    .header .tag { font-size: 11px; color: #C5A265; font-weight: bold; margin-top: 4px; }
    .content { padding: 25px; }
    .alert-banner { background-color: #EFF6FF; border: 1px solid #BFDBFE; color: #1E40AF; padding: 12px 15px; border-radius: 8px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
    .detail-table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 15px 0; }
    .detail-table td { padding: 10px 12px; border-bottom: 1px solid #F0EAE1; }
    .detail-table td.label { font-weight: 600; color: #645C50; width: 35%; background-color: #FAF7F2; }
    .detail-table td.val { color: #1F1C18; font-weight: 500; }
    .actions { margin-top: 25px; text-align: center; }
    .btn-wa { display: inline-block; background-color: #059669; color: #FFFFFF !important; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: 600; margin: 0 5px; }
    .footer { background-color: #FAF7F2; padding: 15px; text-align: center; font-size: 11px; color: #8A8173; border-top: 1px solid #E8DEC8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>VELMORA CLINICAL ALERT</h2>
      <div class="tag">إشعار حجز جديد قيد التأكيد</div>
    </div>

    <div class="content">
      <div class="alert-banner">
        تم استلام طلب حجز إلكتروني جديد يتطلب الاتصال بالعميل وتأكيد الموعد على السيستم.
      </div>

      <table class="detail-table">
        <tr>
          <td class="label">كود الحجز:</td>
          <td class="val" style="font-family: monospace; font-weight: bold; color: #8A714C;">${booking.id}</td>
        </tr>
        <tr>
          <td class="label">اسم العميل:</td>
          <td class="val" style="font-weight: bold; font-size: 14px;">${booking.customerName}</td>
        </tr>
        <tr>
          <td class="label">رقم الهاتف:</td>
          <td class="val" dir="ltr" style="font-family: monospace; font-size: 14px; color: #047857; font-weight: bold;">
            <a href="tel:${booking.customerPhone.replace(/\\s+/g, '')}" style="color: #047857; text-decoration: none;">${booking.customerPhone}</a>
          </td>
        </tr>
        ${booking.customerEmail ? `
        <tr>
          <td class="label">البريد الإلكتروني:</td>
          <td class="val" dir="ltr"><a href="mailto:${booking.customerEmail}">${booking.customerEmail}</a></td>
        </tr>
        ` : ''}
        <tr>
          <td class="label">الخدمة المطلوبة:</td>
          <td class="val">${booking.serviceNameAr} (${booking.serviceNameEn})</td>
        </tr>
        ${booking.practitionerName ? `
        <tr>
          <td class="label">المتخصص المطلوب:</td>
          <td class="val">${booking.practitionerName}</td>
        </tr>
        ` : ''}
        <tr>
          <td class="label">الفرع:</td>
          <td class="val">${branchName}</td>
        </tr>
        <tr>
          <td class="label">التاريخ والوقت:</td>
          <td class="val" dir="ltr" style="font-weight: bold;">${booking.appointmentDate} @ ${booking.appointmentTime}</td>
        </tr>
        <tr>
          <td class="label">السعر التقديري:</td>
          <td class="val" style="font-weight: bold;">${booking.priceEgp.toLocaleString()} ج.م</td>
        </tr>
        ${booking.notes ? `
        <tr>
          <td class="label">ملاحظات العميل:</td>
          <td class="val" style="color: #6B7280; font-style: italic;">${booking.notes}</td>
        </tr>
        ` : ''}
      </table>

      <div class="actions">
        <a href="https://wa.me/${booking.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً ${booking.customerName}، نتواصل معكِ من عيادة ڤيلمورا (VELMORA) لتأكيد موعد حجزكِ يوم ${booking.appointmentDate} الساعة ${booking.appointmentTime}`)}" class="btn-wa">
          مراسلة العميل عبر واتساب
        </a>
      </div>
    </div>

    <div class="footer">
      نظام الإشعارات الآلي • عيادة ڤيلمورا للتجميل والعناية بالبشرة
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, html, text };
}
