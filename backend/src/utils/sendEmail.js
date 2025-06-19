const nodemailer = require('nodemailer');

exports.sendEmail = async ({ email, subject, message }) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html: message,
  };

  await transporter.sendMail(mailOptions);
};
