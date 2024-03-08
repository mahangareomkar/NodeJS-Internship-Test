const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
});


const sendLink = async(email,id) => {
    try {    
        const info = await transporter.sendMail({
            from:`"Omkar" <${process.env.EMAIL}>`,
            to:email,
            subject:"Link to reset password",
            text: `Your link to reset password is ${process.env.HOST_BASE_URL}/reset-password/${id}`
        })
    } catch (error) {
        console.log("Error")    
    }
}
  
module.exports = sendLink;  