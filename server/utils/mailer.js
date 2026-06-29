const nodemailer = require("nodemailer");

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "supportlostfound@gmail.com";

const getTransporter = async () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);

  if (user && pass) {
    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      }),
      from: `"Lost & Found App" <${user}>`,
      isTest: false,
    };
  }

  const testAccount = await nodemailer.createTestAccount();
  return {
    transporter: nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    }),
    from: `"Lost & Found App" <no-reply@lostandfound.local>`,
    isTest: true,
  };
};

const sendEmail = async ({ to = SUPPORT_EMAIL, subject, text, html, replyTo }) => {
  const { transporter, from, isTest } = await getTransporter();
  const info = await transporter.sendMail({
    from,
    to,
    replyTo,
    subject,
    text,
    html,
  });

  if (isTest) {
    console.log(`Email sent to Ethereal test inbox: ${nodemailer.getTestMessageUrl(info)}`);
  }

  return info;
};

module.exports = {
  SUPPORT_EMAIL,
  sendEmail,
};
