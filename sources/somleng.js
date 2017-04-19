// node bin/fetch_saycel -s somleng -e production
// node bin/fetch_saycel -s somleng -e staging

var bluebird = require('bluebird');
var request = require('request');
var moment = require('moment');

var calls = {
  account: 'somleng',
  data: [],
  data_pretty: [],
  label: 'Total calls'
};
exports.fetch = function(db) {
  var current_year = new Date().getFullYear();
  var path = 'chart_data/' + 'chat_box' + '/calls';
  var url = 'http://rtd.somleng.org/api/real_time_data?';
  var ref = db.ref(path); // Storing fund orgs


  return new Promise((resolve, reject) => {
    var dates = [];
    var date_start = moment('2016-11-01');
    while (date_start.format('YYYY-MM') <= moment().format('YYYY-MM')) {
      var start_end = [
        date_start.clone(),
        date_start.clone().add(1, 'months').date(1).subtract(1, 'days')
      ];
      dates.push(start_end);
      date_start = date_start.add(1, 'months');
    }

    bluebird.each(dates, pair => {
      return fetch_data(url, pair);
    }, {concurrency: 1})
    .then(() => {
      ref.set(calls , function(err) {
        if (err) {
          return reject(err);
        }
        console.log('resolved!');
        resolve();
      });
    });
  });
};


function fetch_data(url, start_end_dates) {
  var get_url = url +
    'StartDate=' +
    start_end_dates[0].format('YYYY-MM-DD') +
    '&EndDate=' +
    start_end_dates[1].format('YYYY-MM-DD');
  return new Promise((resolve, reject) => {
    console.log(get_url)
    request(get_url, function (error, response, body) {
      var records = JSON.parse(response.body);
      calls.data.push([start_end_dates[0].format('YYYY-MM'), records.calls_count]);
      calls.data_pretty.push([start_end_dates[0].format('MMM YYYY'), records.calls_count]);
      if (!error && response.statusCode == 200) {
        resolve();
      }
    });
  });
}
