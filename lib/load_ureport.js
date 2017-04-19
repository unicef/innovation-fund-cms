#!/usr/bin/env node

var config = require('../configs/config');
var bluebird = require('bluebird');

exports.load_ureport = function(db) {
  return new Promise(function(resolve, reject) {
    var projects  = require('../public/youth_engagement.json');

    db.ref('ureport_all').once('value').then(function(snapshot) {
      var orgs = snapshot.val().orgs;
      var records = {};
      var countries = [];
      var users_per_country = {};

      var title_index = projects[0].findIndex(function(e){
        return e.match(/name/i);
      });

      var slug_index = projects[0].findIndex(function(e){
        return e.match(/slug/i);
      });

      var country_index = projects[0].findIndex(function(e){
        return e.match(/country/i);
      });
      var project_country_lookup = {};
      // Only get countries in the fund
      countries = projects.filter(function(e) {
        if (e[title_index] && e[title_index].match(/u-report/i)) {
          // Counting on a ureport project having just one country.
          project_country_lookup[compact_country_name(e[country_index])] = e[slug_index];
          return true;
        }
      }).map(function(e) {
        return compact_country_name(e[country_index]);
      });

      countries.forEach(function(country) {
        var months = getMonths(orgs, [country]);
        var dataSet = [];

        Object.keys(months).forEach(function(m) {
          var a = [m];
          var org_sum_for_month = 0;

          Object.keys(orgs).forEach(function(o) {
            var compact_country = orgs[o].name.toLowerCase().replace(/\s+/g, '');

            if (o === country || compact_country === country) {
              users_per_country[country] = orgs[o].reporters_count;
              orgs[o].registration_stats.forEach(function(e) {
                if (m === formatDate(e.label)) {
                  org_sum_for_month = org_sum_for_month +  e.count;
                }
              });
            }
          });
          a.push(org_sum_for_month);
          dataSet.push(a);
        });
        console.log(dataSet);
        records[country] = {
          kind: 'ureport',
          data: dataSet,
          reporters_count: users_per_country[country],
          data_pretty: prettify_data(dataSet),
          country: country,
          project: project_country_lookup[country]
        };
      });
      bluebird.map(Object.keys(project_country_lookup), function(country) {
        console.log(records[country])
        return set_ureport_chart(records[country], db)
      }, {concurrency: 1}).then(function() {
        resolve();
      });
      // refUReport.set(records, function(err) {
      //   if (err) {
      //     return reject(err);
      //   }
      //   console.log('resolved!');
      //   resolve();
      // });
    });
  });
};
function compact_country_name(country) {
  return country.replace(/\s+/g,'').toLowerCase();
}

function set_ureport_chart(record, db) {
  return new Promise(function(resolve, reject) {
    var path = 'chart_data/' + record.project + '/' + record.country + '/';
    var refUReport = db.ref(path); // Storing fund orgs
    refUReport.set({
      account: record.project,
      kind: record.kind,
      data: record.data,
      country: record.country,
      reporters_count: record.reporters_count,
      data_pretty: record.data_pretty,
      label: 'Registered users over time'
    }, function(err) {
      if (err) {
        return reject(err);
      }
      console.log('resolved!');
      resolve();
    });
  });
}

function formatDate(d){
  var parts = d.split(/\//);
  return '20' + parts[2] + '-' + parts[0];
}

function getMonths(orgs, countries){
  var months = {};
  Object.keys(orgs).forEach(function(k) {
    Object.keys(orgs[k].registration_stats).forEach(function(k2) {
      var compact_country = orgs[k].name.toLowerCase().replace(/\s+/g, '');
      if (countries.indexOf(k) > -1 || countries.indexOf(compact_country) > -1) {
        var label = formatDate(orgs[k].registration_stats[k2].label);
        months[label] = 1;
      }
    });
  });
  return months;
}

function prettify_data(data) {
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  months = months.reduce(
    function(hash, elem, index){
      hash[index++] = elem;
      return hash;
    }, {});
  return data.map(function(set) {
    var yyyymm = set[0].split('-');
    var mm = parseInt(yyyymm[1].replace(/^0/, ''));
    var mm = months[mm - 1];
    return [mm + ' ' + yyyymm[0], set[1]];
  });
}
