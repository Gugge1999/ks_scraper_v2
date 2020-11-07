// web_scraper/src/srvices/NotificationService.js
'use strict';
const config = require('../config');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.eu',
  port: 465,
  secure: true,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

console.log('user: ' + config.email.user + ' Password: ' + config.email.pass);

module.exports = {
  async sendKernelNotification(watch) {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.EMAILTO,
      subject: `Ny klocka tillgänglig`,
      text: watch,
    });
  },
  async sendErrorNotification(err) {
    await transporter.sendMail({
      from: config.email.user,
      to: config.email.emailTo,
      subject: `Web_Scraper: An error occured!`,
      text: `Error message:\n\n${err}`,
    });
  },
};
