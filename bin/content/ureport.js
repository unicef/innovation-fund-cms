#!/usr/bin/env node
// Fetches ureport data from Nyruka api
// Loads it to firebase

// node bin/fetch_ureport staging
// node bin/fetch_ureport production
var request   = require('request');
var fb = 'ureport_all/orgs/';
var orgs = [];

function get_url(url){
  return new Promise(function(resolve, reject) {
    request({
      url: url,
      json: true
    }, function (error, response, body) {
      if (error) {
        return reject(error);
      }
      if (!error && response.statusCode === 200) {
        orgs.push(body.results);
        resolve([body.next || false, orgs]);
      }
    });
  });
}

function fetch_source(url, orgs) {
  return new Promise(function(resolve, reject) {
    get_url(url).then(function(set){
      var url = set[0];
      var orgs = set[1];
      if (url) {
        resolve(fetch_source(url, orgs));
      } else {
        resolve(orgs);
      }
    });
  });
}

function store_source(db, source){
  return new Promise(function(resolve, reject) {
    var promises = [];
    var url = 'http://' + source + '.ureport.in/api/v1/orgs/?format=json&page=1';
    fetch_source(url, orgs).then(function(orgs){
      [].concat.apply([], orgs).forEach(function(org){
        if(!org.subdomain)
          org.subdomain = 'global';
        promises.push(
          new Promise(function(resolve, reject) {
            var ref = db.ref(fb + org.subdomain);
            console.log(org);
            ref.set(org, function(err) {
              if (err) {
                return reject(err);
              }
              resolve();
            });
          })
        );
      });
      Promise.all(promises).then(function() {
        resolve();
      });
    });
  });
}

exports.fetch = (db) => {
  return new Promise((resolve, reject) => {
    store_source(db, 'uk')
    .then(() => {
      return store_source(db, 'nigeria');
    })
    .then(resolve);
  })
}
