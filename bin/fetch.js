var config = require('../configs/config');
var firebase = require('firebase-admin');
var fb_config = require('../configs/firebase_service_account');
var ArgumentParser = require('argparse').ArgumentParser;

var iogt = require('./sources/iogt');
var saycel = require('./sources/saycel');
var somleng = require('./sources/somleng');

var content = require('./content/content');
var dashboard = require('./content/dashboard');
var formatted_data = require('./content/formatted_data');
var portfolio = require('./content/portfolio');
var repositories = require('./content/repositories');
var stories = require('./content/stories');
var ureport = require('./content/ureport');
var youth_engagement = require('./content/youth_engagement');

var parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'Aggregate a csv of airport by admin 1 and 2'
});

parser.addArgument(
  ['-e', '--env'],
  {help: 'Name of environment'}
);

parser.addArgument(
  ['-s', '--source'],
  {help: 'Name of startup'}
);

parser.addArgument(
  ['-r', '--repository_source'],
  {help: 'Name of repository source'}
);

var args = parser.parseArgs();
var env = args.env;
var source = args.source;
var repository_source = args.repository_source;


var db_url;
if (env === 'staging') {
  db_url = process.env.firebase_url_staging || config.firebase.staging.url;
  fb_config = fb_config.staging;
} else {
  db_url = process.env.firebase_url_production || config.firebase.production.url;
  fb_config = fb_config.production;
}
// Initialize the app with a custom auth variable, limiting the server's access

firebase.initializeApp({
  credential: firebase.credential.cert(fb_config),
  databaseURL: db_url
});


var db = firebase.database();

switch (source) {
case 'content':
  content.fetch(db).then(process.exit)
  break;
case 'dashboard':
  dashboard.fetch(db).then(process.exit)
  break;
case 'formatted_data':
  formatted_data.fetch(db).then(process.exit)
  break;
case 'portfolio':
  portfolio.fetch(db).then(process.exit)
  break;
case 'repositories':
  repositories.fetch(db, repository_source).then(process.exit)
  break;
case 'ureport':
  ureport.fetch(db).then(process.exit)
  break;
case 'stories':
  stories.fetch(db).then(process.exit)
  break;
case 'youth_engagement':
  youth_engagement.fetch(db).then(process.exit)
  break;
case 'somleng':
  somleng.fetch(db).then(process.exit)
  break;
case 'saycel':
  saycel.fetch(db).then(process.exit);
  break;
case 'iogt':
  iogt.fetch(db, firebase).then(process.exit);
  break;
default:
  console.log('Sorry, we are out of ' + source + '.');
}
