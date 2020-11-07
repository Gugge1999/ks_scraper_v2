// src/app.js
'use strict';
const config = require('./config');
const ScraperService = require('./services/ScraperService');
const NotificationService = require('./services/NotificationService');

var latestWatch = '';

async function run() {
  try {
    const storedWatch = await ScraperService.getWatch();
    console.log(`Current Watch: ${storedWatch}`);

    if (latestWatch.length === 0) {
      /* First start of the web scraper */
      latestWatch = storedWatch;
      console.log('Latest watch in if satement: ' + latestWatch);
    } else if (latestWatch != storedWatch) {
      // Watch changed. Send email to user.
      latestWatch = storedWatch;
      await NotificationService.sendKernelNotification(storedWatch);
      console.log('Email sent' + new Date(Date.now()));
    }
    /* Recall function after milliseconds */
    //console.log('Next check: ', new Date(Date.now() + config.interval).toString());
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
