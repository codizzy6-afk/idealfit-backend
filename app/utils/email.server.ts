import nodemailer from "nodemailer";

export type MerchantWelcomeEmail = {
  to: string;
  shopDomain: string;
  username: string;
  password: string;
  dashboardUrl: string;
};

function getSmtpConfig() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
    MAIL_FROM,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.warn(
      "SMTP environment variables are missing. Skipping email delivery. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS to enable onboarding emails."
    );
    return null;
  }

  const port = Number.parseInt(SMTP_PORT, 10);
  const secure =
    typeof SMTP_SECURE === "string"
      ? ["true", "1", "yes"].includes(SMTP_SECURE.toLowerCase())
      : port === 465;

  return {
    transportOptions: {
      host: SMTP_HOST,
      port,
      secure,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    },
    from: MAIL_FROM || SMTP_USER,
  } as const;
}

export async function sendMerchantWelcomeEmail(
  payload: MerchantWelcomeEmail
) {
  const smtp = getSmtpConfig();
  if (!smtp) {
    return false;
  }

  const transporter = nodemailer.createTransport(smtp.transportOptions);

  const subject = "Your IdealFit merchant dashboard credentials";

  const text = `Hi there!

Your store ${payload.shopDomain} has successfully installed the IdealFit app.

Here are your credentials for the merchant dashboard:

URL: ${payload.dashboardUrl}
Username: ${payload.username}
Password: ${payload.password}

For security, please sign in and change this password as soon as possible.

Thanks,
IdealFit Team`;

  const html = `
    <p>Hi there!</p>
    <p>Your store <strong>${payload.shopDomain}</strong> has successfully installed the IdealFit app.</p>
    <p>Here are your credentials for the merchant dashboard:</p>
    <ul>
      <li><strong>URL:</strong> <a href="${payload.dashboardUrl}">${payload.dashboardUrl}</a></li>
      <li><strong>Username:</strong> ${payload.username}</li>
      <li><strong>Password:</strong> ${payload.password}</li>
    </ul>
    <p>For security, please sign in and change this password as soon as possible.</p>
    <p>Thanks,<br/>IdealFit Team</p>
  `;

  try {
    await transporter.sendMail({
      from: smtp.from,
      to: payload.to,
      subject,
      text,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send merchant welcome email:", error);
    return false;
  }
}
