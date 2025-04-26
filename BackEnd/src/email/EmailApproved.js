require("dotenv").config();
const nodemailer = require("nodemailer");

function validateEnvVariables() {
  if (!process.env.MY_EMAIL || !process.env.MY_PASSWORD) {
    throw new Error("Missing required environment variables for email configuration.");
  }
}

async function sendApprovalEmail(recipient_email) {
  validateEnvVariables();

  let transporter;
  try {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  } catch (error) {
    console.error("Error creating transporter:", error);
    throw new Error("Failed to create email transporter");
  }

  const mail_configs = {
    from: process.env.MY_EMAIL,
    to: recipient_email,
    subject: "TutorVerse Account Approval",
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Account Approval Notification</title>
    </head>
    <body>
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:0 auto;width:70%;padding:20px 0">
        <div style="text-align:center;">
          <a href="https://imgbb.com/">
            <img src="https://i.ibb.co/XkbPk2b/logo.png" alt="logo" border="0" style="width:150px;height:auto;">
          </a>
        </div>
        <div style="border-bottom:1px solid #eee">
          <a href="#" style="font-size:1.4em;color: #ffa64d;text-decoration:none;font-weight:600">TutorVerse</a>
        </div>
        <p style="font-size:1.1em">Hi,</p>
        <p>Congratulations! Your account has been approved and activated. You can now log in and start using our tutoring services.</p>
        <p>Thank you for joining TutorVerse. We are excited to have you on board.</p>
        <p style="font-size:0.9em;">Best Regards,<br />TutorVerse Team</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          <p>TutorVerse - nhom 4</p>
          <p>FPT University</p>
          <p>Ho Chi Minh city</p>
        </div>
      </div>
    </div>
    </body>
    </html>`,
  };

  try {
    await transporter.sendMail(mail_configs);
    return { message: "Approval email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send approval email");
  }
}
async function sendDenialEmail(recipient_email) {
  validateEnvVariables();

  let transporter;
  try {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  } catch (error) {
    console.error("Error creating transporter:", error);
    throw new Error("Failed to create email transporter");
  }

  const mail_configs = {
    from: process.env.MY_EMAIL,
    to: recipient_email,
    subject: "TutorVerse Account Denial",
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Account Denial Notification</title>
    </head>
    <body>
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:0 auto;width:70%;padding:20px 0">
        <div style="text-align:center;">
          <a href="https://imgbb.com/">
            <img src="https://i.ibb.co/XkbPk2b/logo.png" alt="logo" border="0" style="width:150px;height:auto;">
          </a>
        </div>
        <div style="border-bottom:1px solid #eee">
          <a href="#" style="font-size:1.4em;color: #ffa64d;text-decoration:none;font-weight:600">TutorVerse</a>
        </div>
        <p style="font-size:1.1em">Hi,</p>
        <p>We regret to inform you that your account approval request has been denied. If you have any questions or need further assistance, please contact our support team.</p>
        <p>Thank you for your interest in TutorVerse. We wish you the best in your future endeavors.</p>
        <p style="font-size:0.9em;">Best Regards,<br />TutorVerse Team</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          <p>TutorVerse - nhom 4</p>
          <p>FPT University</p>
          <p>Ho Chi Minh city</p>
        </div>
      </div>
    </div>
    </body>
    </html>`,
  };

  try {
    await transporter.sendMail(mail_configs);
    return { message: "Denial email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send denial email");
  }
}
module.exports = { sendApprovalEmail, sendDenialEmail };
