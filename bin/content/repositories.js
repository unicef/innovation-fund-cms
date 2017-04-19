#!/usr/bin/env node
// Fetches github respository locations from spreadsheet
// then queries github api for commits per repository.

// node bin/fetch_repositories -s github -e staging
// node bin/fetch_repositories -s github -e production
// node bin/fetch_repositories -s bitbucket -e staging
// node bin/fetch_repositories -s bitbucket -e production

var bluebird = require('bluebird');
var config = require('../../configs/config');

var fetch = require('../../lib/fetch_from_spreadsheets');
var repo = require('../../lib/get_repo_data');

function get_repositories(db, source) {
  console.log(source)
  return new Promise((resolve, reject) => {
    fetch.get_spreadsheet_data(
      source,
      process.env.projects_spreadsheetId ||
      config.projects_spreadsheetId,
      process.env[source + '_worksheetId'] ||
      config.worksheet_id[source]
    ).then(function(obj) {

      var rows = Object.keys(obj).map(
        function(e) {
          console.log(e);
          return obj[e];
        });

      // Get spreadsheet column names
      var columns = rows.shift();

      bluebird.map(rows, function(obj) {
        var row = Object.keys(obj).reduce(   //{ '1': 'name', '2': 'repository_root', '3': 'repository_url', '4': 'repository name' }
          function(h, e, i) {
            h[columns[i+1]] = obj[e]; return h;
          }, {concurrency: 1});
        return fetch_commits(row);
      }, {concurrency: 1}).then(function() {
        console.log('Done with repositories!');
        process.exit();
      });
    });

    function fetch_commits(row) {
      return new Promise(function(resolve, reject) {
        repo.get_repo_data(row, source, db).then(function() {
          resolve();
        });
      });
    }
  })
}
exports.fetch = (db, repository_source) => {
  return new Promise((resolve, reject) => {
    get_repositories(db, repository_source)
    .then(resolve)
  })
}
