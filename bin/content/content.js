#!/usr/bin/env node
var config = require('../../configs/config');
var fetch = require('../../lib/fetch_from_spreadsheets');
var load = require('../../lib/load_firebase.js');
var bluebird = require('bluebird');

exports.fetch = function(db) {
  return new Promise((resolve, reject) => {
    var pages = ['content'];

    bluebird.map(pages, function(page) {
      return fetch_content(page, db);
    }, {concurrency: 1})
    .catch(function(err) { console.log(err);})
    .then(function(){
      console.log('done!');
      resolve();
    });

  })
};

function fetch_content(page, db) {
  return new Promise(function(resolve, reject) {
    fetch.get_spreadsheet_data(
      page,
      process.env.portfolio_content_spreadsheetId ||
      config.spreadsheet_id[page],
      process.env['portfolio_' + page + '_worksheetId'] ||
      config.worksheet_id[page]
    ).catch(function(err){ console.log(err);})
    .then(function(){
      console.log('Content fetched, about to load...');
      return load.load_content(page, db)
      .catch(function(err){ return reject(err); })
      .then(function(){
        console.log('Done loading', page);
        resolve();
      });
    });
  });
}
