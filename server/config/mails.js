require("dotenv").config();
const mails = {
  default: process.env.Mail || 'gmail',
  gmail: {
    service: "gmail",
    auth: {
      user: process.env.MAILUSER || "",
      pass: process.env.MAILPASS || "",
    },
    tls: {
      ciphers:'SSLv3'
    }
  },
  smtp: {
    pool: true,
    host: process.env.MAILHOST || "",
    port: process.env.MAILPORT || "",
    secureConnection: false, // use SSL
    auth: {
      user: process.env.MAILUSER || "",
      pass: process.env.MAILPASS || "",
    },tls: {
      ciphers:'SSLv3'
    }
  },postmark:{
    auth: {
      apiKey: process.env.POSTMARKAPIKEY || "",
    }
  }
};

module.exports = mails;
