#!/usr/bin/env node

// Fetches youth_engagement projects from spreadsheets and writes to public and then loads to firebase
// Then runs load_ureport which uses youth_enggagment.json before loading to firebase.

var config = require('../configs/config');
var fetch = require('./fetch_from_spreadsheets');
var load_projects = require('./load_projects');
// var git = require('./get_git_commits');

exports.load_portfolio = function(portfolio, db) {
  return new Promise(function(resolve, reject) {
    fetch.get_spreadsheet_data(
      portfolio,
      process.env.projects_spreadsheetId ||
      config.projects_spreadsheetId,
      process.env[portfolio + '_worksheetId'] ||
      config.worksheet_id[portfolio]
    )
    .catch(function(err){return reject(err);})
    .then(function() {
      return load_projects.load_projects(portfolio, db)
      .catch(function(err){ return reject(err);})
      .then(function() {
        resolve();
      });
    });
  });
};
