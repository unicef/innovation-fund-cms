#!/usr/bin/env node
var q          = require('q');
var google     = require('googleapis');
var analytics  = google.analytics('v3');
var key       = require('../../configs/ga_service_account');
var config = require('../../configs/config');
var bluebird = require('bluebird');
var moment = require('moment');

var db_url = config.firebase_database_url || process.env.firebase_database_url;
var ga_accounts = [];
if (process.env.ga_accounts) {
  ga_accounts = process.env.ga_accounts.split(',');
} else {
  ga_accounts = config.ga_accounts;
}

var firebase_path = 'iogt_all/';
var usersFetch = require('../../lib/fetch_iogt_users');
var jwtClient = new google.auth.JWT(
  key.client_email,
  null,key.private_key,
  ['https://www.googleapis.com/auth/analytics.readonly']
);
var promises = [];

exports.fetch = function(db, firebase_ref) {
  return new Promise((resolve, reject) => {
    // Attach an asynchronous callback to read the data at our posts reference
    firebase_ref.database().ref('iogt_all').once('value').then(function(snapshot) {
    // sitesRef.once("value", function(snapshot) {
      var sites = snapshot.val();

      bluebird.map(ga_accounts, function(account) {
        console.log('Account:', account);
        return get_property(account)
        .then(ary => {return add_names(ary, db, firebase_ref, sites);});
      }, {concurrency: 1})
      .then(() => {
        load_iogt_for_site(db)
        .then(process.exit);
      });
    });
  });
};

// What does this do?
function add_names(ary, db, firebase_ref, sites, counter) {
  var refUpdate = db.ref('last_updated_iogt');
  return new Promise((resolve, reject) => {
    bluebird.map(ary, site => {
      var ga_id = site.id;
      var name  = site.websiteUrl.replace('http://', '').split(/\./).slice(0,2).join('-');
      var date  = moment().subtract(3, 'months').toDate(); //new Date(site.created);
      // return usersFetch.users_language(db, firebase_path, name, ga_id, date, 'newUsers', 'region')
      return usersFetch.users_info(db, firebase_path, name, ga_id, date, 'users', 0, sites)
      // .then(function(){return usersFetch.users_info(db, firebase_path, name, ga_id, date, 'users', 0, sites)})
      // .then(function(){return usersFetch.users_info(db, firebase_path, name, ga_id, date, 'newUsers', 0, sites)})
      // .then(function(){return usersFetch.with_dimension(db, firebase_path, name, ga_id, date, 'uniquePageviews', 'pageTitle', 0, sites)})
      // .then(function(){return usersFetch.users_language(db, firebase_path, name, ga_id, date, 'newUsers', 'language')})
      // .then(function(){return usersFetch.users_language(db, firebase_path, name, ga_id, date, 'newUsers', 'operatingSystem')})
      // .then(function(){return usersFetch.users_language(db, firebase_path, name, ga_id, date, 'newUsers', 'browser')})
      // .then(function(){return usersFetch.users_language(db, firebase_path, name, ga_id, date, 'newUsers', 'deviceCategory')})

      // .then(function(){return usersFetch.with_dimension(ref, name, ga_id, date, 'sessions', 'percentNewSessions')})
      // .then(function(){return usersFetch.with_dimension(ref, name, ga_id, date, 'sessions', 'sessionsPerUser')})
      // .then(function(){return usersFetch.with_dimension(ref, name, ga_id, date, 'sessions', 'sessions')})
      // .then(function(){return usersFetch.with_dimension(ref, name, ga_id, date, 'hits', 'hits')})
      // .then(function(){return usersFetch.with_dimension(ref, name, ga_id, date, 'hits', 'bounces')})
      // .then(function(){return usersFetch.with_dimension(ref, name, ga_id, date, 'hits', 'bounceRate')})
      // .then(function(){return usersFetch.with_dimension(ref, name, ga_id, date, 'time', 'avgTimeOnPage')})
      // .then(function(){return usersFetch.with_dimension(ref, name, ga_id, date, 'time', 'timeOnPage')})
      // .then(function(){return usersFetch.with_dimension(ref, name, ga_id, date, 'views', 'uniquePageviews')})
      // .then(function(){return usersFetch.with_dimension(ref, name, ga_id, date, 'views', 'pageviewsPerSession')})
      // .then(function(){return usersFetch.with_dimension(ref, name, ga_id, date, 'views', 'pageviews')})
      // .then(function(){add_names(ary, db, ref, sites, counter+1);})

    }, {concurrency: 1})
    .then(() => {
      refUpdate.set({value:  firebase_ref.database.ServerValue.TIMESTAMP}, function(err){
        setTimeout(() => {resolve();}, 1000);
      });
    });
  });
}

// Returns all sites of property;
function get_property(account_num){
  return new Promise((resolve, reject) => {
    // Get all sites for property
    analytics.management.profiles.list({
      auth: jwtClient,
      accountId: account_num,
      webPropertyId: '~all',
      fields: 'items(id, websiteUrl, created)'
    }, function(err, result){
      if(!!result && !!result.items) {
        resolve(result.items);
      } else {
        resolve([]);
      }
    });
  });
}

function load_iogt_for_site(db) {
  console.log('load_iogt_for_site ****');
  return new Promise((resolve, reject) => {
    var refIOGT = db.ref('iogt');
    db.ref('iogt_all/users').once('value').then(function(snapshot) {
      var users = snapshot.val();
      var months  = {};
      Object.keys(users).forEach(
        c => {
          if (users[c].months) {
            Object.keys(users[c].months).forEach(
              m => {
                months[m] = 0;
              }
            );
          }
        }
      );

      Object.keys(users).forEach(
        c => {
          if (users[c].months) {
            Object.keys(users[c].months).forEach(
              m => {
                months[m] = months[m] + parseInt(users[c].months[m].value.totalsForAllResults['ga:users']);
              }
            );
          }
        }
      );

      var dataSet = Object.keys(months).sort().map(
        function(e){return [e.substr(0,7),  parseInt(months[e]/1000)];
        }
      );
      refIOGT.set(dataSet, function(err) {
        if (err) {
          console.log(err);
          return reject(err);
        }
        console.log('done!!!!')
        resolve();
      });
    });
  });
}
