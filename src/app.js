// src/app.js
'use strict';
const config = require('./config');
const ScraperService = require('./services/ScraperService');
const NotificationService = require('./services/NotificationService');
const fs = require('fs');

let watchObj = {
  watch: '',
};

function getTime() {
  return new Date().toLocaleString();
}

async function run() {
  try {
    watchObj.watch = await ScraperService.getWatch();
    let formattedJSON = JSON.stringify(watchObj, null, 4);
    console.log(`Scraped: ${formattedJSON}`);

    let storedWatch = fs.readFileSync('stored_watch.json', 'utf8');
    console.log(`Data stored: ${storedWatch}`);

    if (storedWatch != formattedJSON) {
      let emailText = `${watchObj.watch}. Detta mail mail skickades: ${getTime()}`;
      await NotificationService.sendKernelNotification(emailText);
      console.log(`Email sent ${getTime()}`);

      // Write to stored watch file
      fs.writeFile('stored_watch.json', JSON.stringify(watchObj, null, 4), function (err) {
        if (err) {
          throw err;
        }
        console.log('Wrote to stored_watch.json successfully');
      });

      // Email logging
      fs.appendFile('email_logs.txt', `Email sent: ${getTime()}\nWatch name & date: ${watchObj.watch}\n\n`, function (err) {
        if (err) throw err;
        console.log('Wrote successfully to email_logs.txt');
      });
    }
    setTimeout(run, config.interval);
  } catch (err) {
    // Exit application if something went wrong
    try {
      await NotificationService.sendErrorNotification(err);
    } catch (err) {
      console.error('Sending error notification failed!');
    }
    console.error(err);
    console.log('Program exit');
    process.exitCode = 1;
  }
}

run();
