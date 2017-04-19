var config = require('../configs/config');
var async = require('async');

Array.prototype.flatten = function() {
  var ret = [];
  for(var i = 0; i < this.length; i++) {
    if (Array.isArray(this[i])) {
      ret = ret.concat(this[i].flatten());
    } else {
      ret.push(this[i]);
    }
  }
  return ret;
};

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

months = months.reduce(
  function(hash, elem, index){
    hash[index++] = elem;
    return hash;
  }, {});

var request = require('request');

exports.get_repo_data = function(repo_obj, kind, db) {
  var project_name = repo_obj.slug;
  var repo_account = repo_obj.repository_account;
  var repo_name = repo_obj.repository_name;
  var repo_label = repo_obj.repository_label;
  var repo_url = '';

  if (kind.match(/github/)) {
    repo_url = 'https://api.github.com/repos/' + repo_account + '/' + repo_name + '/stats/commit_activity';
  } else {
    repo_url = 'https://bitbucket.org/api/1.0/repositories/' + repo_account + '/' + repo_name + '/changesets';
  }

  return new Promise(function(resolve, reject) {
    var options = {
      url: repo_url,
      headers: {
        'User-Agent': 'request'
      }
    };

    request(options, function (error, response, body) {
      console.log(response.statusCode);
      if (!error && response.statusCode == 200) {
        var data = JSON.parse(body);
        async.waterfall([
          function (callback) {
            console.log(repo_name);
            var output;
            var output_pretty;
            if (kind === 'github') {
              output = gitPointsAndLabels(data);
              output_pretty = gitPointsAndLabels(data, 1);
            } else {
              output = bitbucketChangeSets(data);
              output_pretty = bitbucketChangeSets(data, 1);
            }

            var url = '/chart_data/' + project_name + '/' + repo_name;
            db.ref(url).set(
              {
                account: repo_account,
                kind: kind,
                data: output,
                data_pretty: output_pretty,
                label: repo_label
              }, function(err) {
              if (err) {
                return reject(err);
              }
              callback(null);
            });
          }
        ], function() {
          console.log('done!');

          setTimeout(function() {
            resolve();
            console.log('waiting complete');},
            5000);
        });
      } else {
        console.log(error, response.statusCode, repo_obj);
        resolve();
      }
    });
  });
};

function bitbucketChangeSets(dataSet, pretty) {
  var humanized_months = [];

  var h = dataSet.changesets.reduce(function(h, c) {
    var month = new Date(c.timestamp).getMonth();
    var year = new Date(c.timestamp).getFullYear();
    var label;
    if (pretty) {
      label = months[month] + ' ' + year;
    } else {
      label = year + '-' + format_month(month + 1);
    }
    humanized_months.push(label);
    h[label] = h[label] ? h[label] += c.files.length : c.files.length;
    return h;
  }, {});

  var labels = humanized_months.filter(
    function(item, i, ar) {
      return ar.indexOf(item) === i;
    }
  );

  var data = labels.map(function(l) {
    return [l, h[l]];
  });

  return data;
}

function gitPointsAndLabels(dataSet, pretty){
  var humanized_months = [];
  var commit_months = {};
  var commits = dataSet; // dataSet[account][repo].commits;

  // var dates = [];
  commits.forEach(function(commit) {
    var temp_date = new Date(commit.week * 1000);
    var month = temp_date.getMonth();
    var year = temp_date.getFullYear();

    var week_sum = commit.days.reduce(function(total, day) {
      return total + day;
    }, 0);
    var label;
    if (pretty) {
      label = months[month] + ' ' + year;
    } else {
      label = year + '-' + format_month(month + 1);
    }

    humanized_months.push(label);

    if (commit_months[label]){
      commit_months[label] += week_sum;
    } else {
      commit_months[label] = week_sum;
    }
  });

  var labels = humanized_months.filter(
    function(item, i, ar) {
      return ar.indexOf(item) === i;
    }
  );

  var data = labels.map(function(l) {
    return [l, commit_months[l]];
  });
  return data;
}

function format_month(month) {
  if (String(month).length == 1) {
    return '0' + String(month);
  }
  return month;
}
