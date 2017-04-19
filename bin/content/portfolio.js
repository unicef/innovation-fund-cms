#!/usr/bin/env node
// node bin/fetch_portfolio infrastructure production
var bluebird = require('bluebird');
var load = require('../../lib/load_portfolio');

var portfolios = ['real_time_information', 'knowledge_products', 'infrastructure'];

exports.fetch = db => {
  return new Promise((resolve, reject) => {
    bluebird.map(portfolios, portfolio => {
      return load.load_portfolio(portfolio, db);
    }, {concurrency: 1})
    .catch(console.log)
    .then(resolve);
  })
}
