// This is where we'll probably store projects, i.e. not in the form page.
exports.load_projects = function(portfolio, db) {
  return new Promise(function(resolve, reject) {
    // var db_url;
    // if (env === 'staging') {
    //   db_url = process.env.firebase_url || config.firebase.staging.url;
    //   fb_config = fb_config.staging;
    // } else {
    //   db_url = process.env.firebase_url || config.firebase.production.url;
    //   fb_config = fb_config.production;
    // }
    //
    // // Initialize the app with a custom auth variable, limiting the server's access
    // firebase.initializeApp({
    //   credential: firebase.credential.cert(fb_config),
    //   databaseURL: db_url
    // }, 'projects');
    //
    // var db = firebase.app('projects').database();

    var projects = [];
    var projects_hash = {};
    var obj  = require('../public/' + portfolio + '.json');

    if (obj) {
      var slug_index = obj[0].findIndex(function(e){
        return e.match(/slug/i);
      });

      var order_index = obj[0].findIndex(function(e){
        return e.match(/order/i);
      });

      var investment_status_index = obj[0].findIndex(function(e){
        return e.match(/investment_status/i);
      });

      var new_investment_index = obj[0].findIndex(function(e){
        return e.match(/investment_status/i);
      });
      var amount_index = obj[0].findIndex(function(e) {
        return e.match(/amount/i);
      });
      // var github_index = obj[0].findIndex(function(e) {
      //   return e.match(/github/i);
      // });

      // var columns = obj.shift();
      var columns = obj[0];

      var new_projects = [];
      var active_projects = [];
      var past_projects = [];

      obj.slice(1, obj.length).forEach(function(line) {
        // if (line[amount_index]) {
        var project = line.reduce(function(h, e, i) { h[columns[i]] = line[i] || ''; return h;}, {});

        if (project['new_investment'] == 1) {
          new_projects.push(project);
        } else if (project['investment_status'] == 'active') {
          active_projects.push(project);
        } else {
          past_projects.push(project);
        }
        projects_hash[line[slug_index]] = project;
      });
      var all_projects = [];

      [new_projects, active_projects, past_projects ].forEach(function(ar) {
        ar.sort(function(a, b) {
          return a.order - b.order;
        }).forEach(function(p) {
          all_projects.push(p);
        });
      });

      all_projects.forEach(function(proj, i) {
        projects_hash[proj.slug].order = i;
      });
      // Save projects as array
      // Also save projects as hash for featured projects
      db.ref('portfolio_projects/' + portfolio).set({
        projects_hash,
      }, function(err) {

        if (err) {
          console.log('problem!');
          return reject(err);
        }
        resolve();
      });
    } else {
      return reject('No json for', portfolio);
    }

  });
};
