const nodemailer = require("nodemailer");

const sendEmail = async (email, otp) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Gym System" <${process.env.EMAIL}>`,
    to: email,
    subject: "OTP Verification",
    text: `Your OTP is ${otp}`
  });

};

module.exports = sendEmail;