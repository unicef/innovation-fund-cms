#!/usr/bin/env node
var request_json = require('request-json');
var bluebird = require('bluebird');
var client = request_json.createClient('http://www.unicefstories.org/');

var tags = [
  {fbase_node: 'stories', tag: 'coverage'},
  {fbase_node: 'announcements', tag: 'newprojects'}
];

exports.fetch = (db) => {
  return new Promise((resolve, reject) => {
    bluebird.map(tags, function(tag) {
      return fetch_stories(tag, db);
    }, {concurrency: 1}).then(function(){
      console.log('Done!');
      resolve();
    });
  })
}

function fetch_stories(set, db) {
  console.log('About to fetch', set);
  var node = set.fbase_node;
  var tag = set.tag;
  var ref = db.ref(node);
  return new Promise(function(resolve, reject) {
    client.get('category/' + tag +'/?json=1', function(err, response, body) {
      if (err || !body) {
        console.log(err);
        return reject(err);
      }
      if (Array.isArray(body.posts)) {
        ref.set(body.posts.slice(0,6), function(){
          console.log(body.posts.length, 'stories retrieved!');
          resolve();
        });
      } else {
        console.log('no go');
      }
    });
  });
}
