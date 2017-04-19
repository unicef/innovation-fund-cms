#!/usr/bin/env node

var load = require('../../lib/load_portfolio');
var ureport = require('../../lib/load_ureport');

exports.fetch = (db) => {
  return new Promise((resolve, reject) => {
    load.load_portfolio('youth_engagement', db)
    .catch(console.log)
    .then(() => {
      return ureport.load_ureport(db)
      .catch(console.log)
      .then(resolve);
    });

  })
}
