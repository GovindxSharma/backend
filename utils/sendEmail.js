const nodeMailer=require('nodemailer');

const sendEmail=async(options)=>{

    const transporter = nodeMailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_MAIL,
            pass:"ppgi bena woid mhug"
            // pass: "kgtj tovi wtpg knrv"
        }
    });

    const mailOptions={
        from :process.env.SMTP_MAIL,
        to:options.email,
        subject:options.subject,
        text:options.message
    }

    await transporter.sendMail(mailOptions)
}

module.exports=sendEmail;