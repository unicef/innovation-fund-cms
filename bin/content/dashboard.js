#!/usr/bin/env node
var jsonfile  = require('jsonfile');
var config = require('../../configs/config');
var fetch = require('../../lib/fetch_from_spreadsheets');



function load_budget(refBudget) {
  return new Promise((resolve, reject) => {
    jsonfile.readFile('./public/dashboard.json', (err, obj) => {
      if (err) {
        return reject(err);
      }

      if (obj){
        var spents = {};
        var totals = {};
        // Remove first null element
        obj[0].shift();
        var index_youth_engagement = obj[0].findIndex(function(e){return e.match(/youth_engagement/i);}) + 1;
        var index_real_time_data = obj[0].findIndex(function(e){return e.match(/real_time_data/i);}) + 1;
        var index_infrastructure = obj[0].findIndex(function(e){return e.match(/infrastructure/i);}) + 1;

        totals.youth_engagement = obj[1][index_youth_engagement].replace(/[$,]/g, '');
        totals.realtime_information = obj[1][index_real_time_data].replace(/[$,]/g, '');
        totals.infrastructure = obj[1][index_infrastructure].replace(/[$,]/g, '');

        spents.youth_engagement = obj[2][index_youth_engagement].replace(/[$,]/g, '');
        spents.realtime_information = obj[2][index_real_time_data].replace(/[$,]/g, '');
        spents.infrastructure = obj[2][index_infrastructure].replace(/[$,]/g, '');

        refBudget.set({totals: totals, spents: spents}, function(err) {
          if (err) {
            return reject(err);
          }
          console.log('Done with dashboard');
          resolve(obj);
        });
      }
    });
  });
}

function portfolio_summaries(obj, refSummary) {
  return new Promise((resolve, reject) => {
    var labels = obj.shift();
    var total_index = labels.findIndex(function(e){return e.match(/total/i);});
    var index_co_funding = labels.findIndex(function(e){return e.match(/co_funding/i);});

    var availables = obj[0];
    var investeds = obj[1];
    var remains = obj[2];
    var num_projects = obj[3][1];
    var num_countries = obj[4][1];

    var total_available = availables[total_index+1];
    var co_funding = remains[index_co_funding+1];

    refSummary.set({
      stats:{
        total_available: total_available,
        co_funding: co_funding,
        total_invested: investeds[1],
        num_projects: num_projects,
        num_countries: num_countries
      },
      portfolios:{
        invested_youth_engagement: {
          amount: investeds[3],
          label: 'Products for youth',
          color: '#ffcc33'
        },
        invested_real_time_information: {
          amount: investeds[4],
          label: 'Real-time Information',
          color: '#ff3366'
        },
        invested_infrastructure: {
          amount: investeds[5],
          label: 'Infrastructure',
          color: '#66cc66'
        },
        management_and_operational_research: {
          amount: investeds[6],
          label: 'Management and Operational Research',
          color: '#555555'
        }
      }
    }, function(err) {
      if (err) {
        return reject(err);
      }
      console.log('Portfolio summaries done!');
      resolve();
    });

  });
}

exports.fetch = (db) => {
  return new Promise((resolve, reject) => {
    var refBudget = db.ref('budget');
    var refSummary = db.ref('summary');
    fetch.get_spreadsheet_data(
      'dashboard', // THIS is right
      config.projects_spreadsheetId,
      config.dashboard_worksheetId
    ).catch(console.log)
    .then(() => {
      return load_budget(refBudget);
    }).catch(console.log)
    .then(function(obj){
      return portfolio_summaries(obj, refSummary);
    })
    .then(() => {
      console.log('Dashboard loaded!');
      resolve();
    });
  })
}
