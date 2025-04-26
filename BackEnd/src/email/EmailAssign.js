require("dotenv").config();
const nodemailer = require("nodemailer");


function validateEnvVariables() {
  if (!process.env.MY_EMAIL || !process.env.MY_PASSWORD) {
    throw new Error("Missing required environment variables for email configuration.");
  }
}
async function sendClassEnrollmentEmail(recipient_email, class_name, instructor_name) {
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
    subject: `Enrollment Confirmation for ${class_name}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Class Enrollment Notification</title>
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
          <p>Congratulations! You have successfully enrolled in the class <strong>${class_name}</strong> with instructor <strong>${instructor_name}</strong>.</p>
          <p>We are excited to have you in this class. Get ready to learn and engage with your instructor and classmates!</p>
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
    return { message: "Enrollment email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send enrollment email");
  }
}

async function sendInstructorAssignmentEmail(instructor_email, class_name, students) {
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

  // Tạo bảng HTML cho danh sách học sinh
  const studentTable = `
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <thead>
          <tr style="background-color:#f2f2f2;">
            <th style="border:1px solid #ddd;padding:8px;text-align:left;">Student Name</th>
            <th style="border:1px solid #ddd;padding:8px;text-align:left;">Email</th>
            <th style="border:1px solid #ddd;padding:8px;text-align:left;">Grade</th>
          </tr>
        </thead>
        <tbody>
          ${students
      .map(
        (student) => `
                <tr>
                  <td style="border:1px solid #ddd;padding:8px;">${student.fullName}</td>
                  <td style="border:1px solid #ddd;padding:8px;">${student.email}</td>
                  <td style="border:1px solid #ddd;padding:8px;">${student.grade}</td>
                </tr>
              `
      )
      .join("")}
        </tbody>
      </table>
    `;

  const mail_configs = {
    from: process.env.MY_EMAIL,
    to: instructor_email,
    subject: `Teaching Assignment for ${class_name}`,
    html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Teaching Assignment Notification</title>
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
            <p style="font-size:1.1em">Dear Instructor,</p>
            <p>Congratulations! You have been selected to teach the class <strong>${class_name}</strong>.</p>
            <p>Below is the list of students enrolled in your class:</p>
            ${studentTable}
            <p>We are excited to have you lead this class. Please prepare to engage with your students and deliver an excellent learning experience!</p>
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
    return { message: "Instructor assignment email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send instructor assignment email");
  }
}

module.exports = {
  sendClassEnrollmentEmail,
  sendInstructorAssignmentEmail
};