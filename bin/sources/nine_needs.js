
var config = require('../../configs/config');
var curl = require('curl-cmd');
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

exports.fetch = function(db) {
  return new Promise((resolve, reject) => {


  var url = config.nine_needs[0];
  var command = 'curl -i ' + url;

  execute_curl(command).then(output => {

    resolve();
  })
})
  // var commits = require('../public/nine_needs.json');
  //
  // var commits_in_order = commits.reverse();
  // var output = format_private_git_data(commits_in_order);
  // var output_pretty = format_private_git_data(commits, 1);
  // var repo_account = 'consent-global';
  // var repo_name = 'ECD-PROTO';
  // var kind = 'git-private';
  // var repo_label = 'number of commits';
  // var project_name = 'nine_needs';
  // var url = '/chart_data/' + project_name + '/' + repo_name;
  //
  // db.ref(url).set(
  //   {
  //     account: repo_account,
  //     kind: kind,
  //     data: output,
  //     data_pretty: output_pretty,
  //     label: repo_label
  //   }, function(err, response) {
  //   if (err) {
  //     console.log(err);
  //   }
  //   console.log(output_pretty);
  //   console.log('success');
  //   process.exit();
  // });
}

function format_private_git_data(commits, pretty) {
  var humanized_months = [];
  var output = commits.sort(function(a, b) {
    return new Date(a.commit.author.date) - new Date(b.commit.author.date)
  }).reduce(function(h, e) {
    console.log(e.commit.author.date)
    var month = new Date(e.commit.author.date).getMonth();
    var year = new Date(e.commit.author.date).getFullYear();

    var label;
    if (pretty) {
      label = months[month] + ' ' + year;
    } else {
      label = year + '-' + format_month(month + 1);
    }

    humanized_months.push(label);
    h[label] = h[label] ? h[label] += 1 : 1;
    return h;

  }, {})

  var labels = humanized_months.filter(
    function(item, i, ar) {
      return ar.indexOf(item) === i;
    }
  );

  return labels.map(function(l) {
    return [l, output[l]];
  });
}

function execute_curl(command) {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
      }
      resolve(stdout.split('\n').join(' '));
    });
  });
}

function format_month(month) {
  if (String(month).length == 1) {
    return '0' + String(month);
  }
  return month;
}
