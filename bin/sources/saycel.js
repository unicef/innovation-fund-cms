// node bin/fetch -s say_cel -e production
// node bin/fetch -s say_cel -e staginv

var config = require('../../configs/config');
var request = require('request');
var moment = require('moment');

var api_url = config.api.say_cel;

var current_year = new Date().getFullYear();
var path = 'chart_data/saycel/pings';
var url = 'http://' + api_url + '/pearl-lagoon/query/' + current_year;

exports.fetch = function(db) {
  return new Promise((resolve, reject) => {
    var ref = db.ref(path); // Storing fund orgs
    var pings = {
      account: 'saycel',
      label: 'Pings per month',
      kind: 'custom'
    };

    request(url, function (error, response, body) {
      if (error) {
        console.log(error);
        process.exit();
      }
      if (!error && response.statusCode == 200) {
        var records = JSON.parse(response.body);
        var dates = records.reduce((h, r) => {
          var date = moment(r.date).format('YYYY-MM');
          h[date] = h[date] ? h[date] + 1 : 1;
          return h;
        }, {});

        var data = Object.keys(dates).map( d => {
          return [d, dates[d]];
        });

        if (data.length === 1) {
          var proxy_date = data[0][0];
          data.unshift([moment(proxy_date).subtract(1, 'months').format('YYYY-MM'), 0]);
        }

        var data_pretty = data.map( e => {
          return [moment(e[0]).format('MMM YYYY'), e[1]];
        });
        pings.data = data;
        pings.data_pretty = data_pretty;
        ref.set(pings , function(err) {
          if (err) {
            return reject(err);
          }
          console.log('resolved!');
          resolve();
        });
      }
    });
  });
};
