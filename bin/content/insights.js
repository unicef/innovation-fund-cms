#!/usr/bin/env node
// Fetches github respository locations from spreadsheet
// then queries github api for commits per repository.

// node bin/fetch_repositories -s github -e staging
// node bin/fetch_repositories -s github -e production
// node bin/fetch_repositories -s bitbucket -e staging
// node bin/fetch_repositories -s bitbucket -e production
var moment = require('moment');
var bluebird = require('bluebird');
var config = require('../../configs/config');
var fetch = require('../../lib/fetch_from_spreadsheets');
var repo = require('../../lib/get_repo_data');
request = require('request-json');

function get_insights(db, source) {
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
        return fetch_custom_charts(db, row);
      }, {concurrency: 1}).then(function() {
        console.log('Done with repositories!');
        process.exit();
      });
    });

    function update_firebase(db, row, set) {
      return new Promise((resolve, reject) => {
        var path = 'chart_data/' + row.slug + '/' + set.account;
        var ref = db.ref(path);
        console.log('1111')
        ref.set(set , function(err) {
        console.log('2222')
          if (err) {
            console.log(err, '!!!!')
            return reject(err);
          }
          console.log('resolved!');
          resolve();
        });
      })
    }

    function fetch_custom_charts(db, row) {
      return new Promise(function(resolve, reject) {
        var client = request.createClient(row.url);
        client.get('', function(err, res, data_set) {
          var set = data_set.reduce((h, data) => {
            var account = data.label.replace(/\s/g, '_').toLowerCase()
            data.account = account
            var data_pretty = data.data.map( e => {
              return [moment(e.Date).format('MMM YYYY'), e.Value];
            });
            data.data = data.data.map( e => {
              return [e.Date, e.Value];
            });
            data.kind = 'custom'
            data.data_pretty = data_pretty
            h[account] = data;
            return h
          }, {})

          bluebird.each(Object.keys(set), key => {
            return update_firebase(db, row, set[key]);
          }, {concurrency: 1})
          .then(() => {
            console.log('Done with', row)
          resolve();
          })

        });
      });
    }
  })
}
exports.fetch = (db) => {
  return new Promise((resolve, reject) => {
    get_insights(db, 'insights')
    .then(resolve)
  })
}
