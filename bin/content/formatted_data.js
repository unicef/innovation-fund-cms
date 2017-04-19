#!/usr/bin/env node
var jsonfile  = require('jsonfile');
var config = require('../../configs/config');
var fetch = require('../../lib/fetch_from_spreadsheets');
var load = require('../../lib/load_firebase.js');
var bluebird = require('bluebird');

var pages = [{parent: 'content/submit_content', node: 'country_offices'}, {parent: 'content/submit_content', node: 'startups'}];

exports.fetch = (db) => {
  return new Promise((resolve, reject) => {
    bluebird.map(pages, function(page) {
      return fetch_content(page, db);
    }, {concurrency: 1})
    .catch(function(err) { console.log(err);})
    .then(function() {
      console.log('done!');
      resolve();
    });
  })
}


function fetch_content(page, db) {
  console.log(page)
  return new Promise(function(resolve, reject) {
    fetch.get_spreadsheet_data(
      page.node,
      process.env.portfolio_content_spreadsheetId ||
      config.spreadsheet_id.content,
      process.env['portfolio_' + page.node + '_worksheetId'] ||
      config.worksheet_id[page.node]
    ).catch(function(err){ console.log(err);})
    .then(function(){
      console.log('Content fetched, about to load...');
      return load.load_json(page, db)
      .catch(
        function(err) { return reject(err); }
      )
      .then(function(){
        console.log('Done loading', page);
        resolve();
      });
    });
  });
}
