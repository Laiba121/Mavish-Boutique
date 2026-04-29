import nodemailer from 'nodemailer';

const createTransporter = () => {
  // Use Gmail SMTP. For production, swap with SendGrid/Mailgun/SES.
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,   // Gmail App Password (not account password)
    },
  });
};

const brandColor = '#b5836a';
const logoHtml = `<span style="font-family:Georgia,serif;font-size:22px;color:${brandColor};font-weight:700;letter-spacing:2px;">Mehrma Boutique</span>`;

const wrapper = (body) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" style="background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.07);">
        <!-- Header -->
        <tr><td style="background:#2c2c2c;padding:28px 40px;text-align:center;">${logoHtml}</td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          ${body}
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f5f0eb;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#888;">© ${new Date().getFullYear()} Mehrma Boutique. All rights reserved.</p>
          <p style="margin:6px 0 0;font-size:12px;color:#888;">15-Km, Hafizabad Road, Gujranwala</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export const sendVerificationEmail = async (email, name, otp) => {
  const html = wrapper(`
    <h2 style="font-family:Georgia,serif;color:#2c2c2c;margin:0 0 8px;">Verify Your Email</h2>
    <p style="color:#555;font-size:15px;line-height:1.6;">Hi <strong>${name}</strong>, welcome to Mehrma Boutique!</p>
    <p style="color:#555;font-size:15px;line-height:1.6;">Please use the code below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
    <div style="text-align:center;margin:32px 0;">
      <div style="display:inline-block;background:#faf7f2;border:2px dashed ${brandColor};border-radius:8px;padding:20px 40px;">
        <span style="font-size:38px;font-weight:700;letter-spacing:10px;color:#2c2c2c;font-family:monospace;">${otp}</span>
      </div>
    </div>
    <p style="color:#888;font-size:13px;">If you didn't create an account, you can safely ignore this email.</p>
  `);

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Mehrma Boutique" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email – Mehrma Boutique',
    html,
  });
};

export const sendPasswordResetEmail = async (email, name, otp) => {
  const html = wrapper(`
    <h2 style="font-family:Georgia,serif;color:#2c2c2c;margin:0 0 8px;">Reset Your Password</h2>
    <p style="color:#555;font-size:15px;line-height:1.6;">Hi <strong>${name}</strong>,</p>
    <p style="color:#555;font-size:15px;line-height:1.6;">We received a request to reset your password. Use the OTP below. It expires in <strong>15 minutes</strong>.</p>
    <div style="text-align:center;margin:32px 0;">
      <div style="display:inline-block;background:#faf7f2;border:2px dashed ${brandColor};border-radius:8px;padding:20px 40px;">
        <span style="font-size:38px;font-weight:700;letter-spacing:10px;color:#2c2c2c;font-family:monospace;">${otp}</span>
      </div>
    </div>
    <p style="color:#888;font-size:13px;">If you didn't request this, please ignore this email. Your account is safe.</p>
  `);

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Mehrma Boutique" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset OTP – Mehrma Boutique',
    html,
  });
};