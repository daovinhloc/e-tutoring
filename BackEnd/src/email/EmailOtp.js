require("dotenv").config();
const nodemailer = require("nodemailer");
const path = require("path");
const https = require("https");
function sendEmail({ recipient_email, OTP }) {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mail_configs = {
      from: process.env.MY_EMAIL,
      to: recipient_email,
      subject: "TutorVerse PASSWORD RECOVERY",
      html: `<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>CodePen - OTP Email Template</title>
  

</head>
<body>
<!-- partial:index.partial.html -->
<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style=" auto;width:70%;padding:20px 0">
      <div style="text-align:center;">
      <a href="https://imgbb.com/">
      <img src="https://i.ibb.co/XkbPk2b/logo.png" alt="logo" border="0" style="width:150px;height:auto;">
         </a>
    </div>
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #ffa64d;text-decoration:none;font-weight:600">TutorVerse</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>This email is being sent to you because there was a request for changing password. Use the following OTP to complete your Password Recovery Procedure. OTP is valid for 5 minutes.</p>
    </br>
    <p>Please do not reply to this email. Thank you for using our service.</p>
    <h2 style="background: #ffa64d;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
    <p style="font-size:0.9em;">Best Regards,<br />TutorVerse Team</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      
      <p>TutorVerse - nhom 4</p>
      <p>FPT University</p>
      <p>Ho Chi Minh city</p>
    </div>
  </div>
</div>
<!-- partial -->
  
</body>
</html>`,
    };
    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        return reject({ message: `An error has occured` });
      }
      return resolve({ message: "Email sent succesfuly" });
    });
  });
}
module.exports =  sendEmail;