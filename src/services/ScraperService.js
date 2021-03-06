// web_scraper/src/srvices/ScraperService.js

'use strict';
const config = require('../config');
const cheerio = require('cheerio');
const rp = require('request-promise');

module.exports = {
  async getWatch() {
    const response = await rp({
      uri: config.uri,
    });

    const $ = cheerio.load(response);
    const watchName = $('.contentRow-title')
      .children()
      .first()
      .text()
      .replace(/Tillbakadragen|Avslutad|Säljes|OHPF|Bytes|\//gi, '') // Remove sale status of the watch
      .trim();
    if (watchName === '') throw new Error('Watch name not found');

    const date = $('.u-dt').attr('data-date-string');

    const watchLink = $('.contentRow-title').children().first().attr('href');

    let watchInfo = `${watchName} ${date} https://klocksnack.se${watchLink}`;
    return watchInfo;
  },
};
