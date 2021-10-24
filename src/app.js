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

function getDateAndTimeWithMilliseconds() {
  var tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
  var localISOTime = new Date(Date.now() - tzoffset).toISOString().slice(0, -1);
  return localISOTime;
}

async function run() {
  try {
    watchObj.watch = await ScraperService.getWatch();
    let scrapedWatch = JSON.stringify(watchObj, null, 4);
    let storedWatch = fs.readFileSync('stored_watch.json', 'utf8');
    const colors = {
      blue: '\x1b[36m',
      yellow: '\x1b[33m',
      green: '\x1b[32m',
      white: '\x1b[0m',
    };
    const line = colors.blue + '-'.repeat(process.stdout.columns) + colors.white;

    console.log(line);
    console.log(`${colors.green}Time: ${getTime()}${colors.white}`);
    console.log(`${colors.yellow}Scraped${colors.white}: ${scrapedWatch}`);
    console.log(`${colors.yellow}Data stored${colors.white}: ${storedWatch}`);
    console.log(`${line}\n`);

    if (storedWatch != scrapedWatch) {
      let emailText = `${watchObj.watch}\n\nDetta mail skickades: ${getTime()}`;
      await NotificationService.sendKernelNotification(emailText);
      console.log(`Time with milliseconds after NotificationService.sendErrorNotification(): ${getDateAndTimeWithMilliseconds()}`);
      console.log(`Email sent ${getTime()}`);

      // Write to stored watch file
      fs.writeFile('stored_watch.json', JSON.stringify(watchObj, null, 4), function (err) {
        if (err) throw err;
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
