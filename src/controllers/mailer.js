const nodemailer = require("nodemailer");

exports.mailer = async (to, sub, msg, callback) => {
    let transporter = nodemailer.createTransport({
      // host: process.env.MAIL_HOST,
      // port: process.env.MAIL_PORT,
      // secure: false,
      // auth: {
      //   user: process.env.senderMail,
      //   pass: process.env.senderPassword
      // }
      host: 'smtp.gmail.com',
      port: 587,
      // Secure:	STARTTLS,
      auth: {
          user: 'jdaniles940@gmail.com',
          pass: 'JDaniles@07'
      }
    });
  
    var err = "";
    var response = "";
    let info = await transporter.sendMail({
      from: 'no-reply@wisher.com <no-reply@enigmailer.com>', // sender address
      to: to,
      subject: sub,
      text: msg,
      html: msg
    }, (error, info) => {
          if (error) {
            err = error;
            callback(error, err);
          }
          else{
            response = info.response;
            var data = {
              response : info.response,
              msgId : info.messageId
            }
            var obj = data;
            callback(null, obj);
          }
    });
  }