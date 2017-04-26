var config = require('../configs/config');
var jsonfile  = require('jsonfile');

exports.load_json = function(page, db) {
  var ref = db.ref(page.parent + '/' + page.node);
  var page = page.node;
  var mode = 0;
  var current_array = '';
  var current_object = {};
  var slug = '';
  return new Promise(function(resolve, reject) {
    console.log('About to read json file in public');
    jsonfile.readFile('./public/' + page + '.json', (err, obj) => {
      if (err) {
        return reject(err);
      }
      var hash = {};
      // Keys are row numbers
      Object.keys(obj).forEach(k => {
        // Look for value with capital letters
        var match = obj[k][0].toString().match(/([A-Z]+)/);
        // An orphan key value
        if (obj[k].length > 1 && mode === 0) {
          hash[obj[k][0]] = obj[k].slice(1, obj[k].length);
        }

        // This is an array
        if (match) {
          slug = obj[k][0].toLowerCase().replace(/\s+/g, '_');
          hash[slug] = [];
          current_array = slug;
          mode = 1;
        }

        // This is an object (bullet)
        if (obj[k].length > 1 && mode === 1) {
          var key = obj[k][0];
          // Make sure there is both a key and value
          if (obj[k].length > 1) {
            current_object[key] = obj[k].slice(1, obj[k].length);
          }
        }
        // No more assumptions mode
        if (obj[k][0].toString().match(/----------/)) {
          hash = clone_and_add_to_hash(current_object, current_array, hash);
          mode = 0;
        }

        // // Start of new object
        if (typeof obj[k][0] === 'number' && mode == 1) {
          if (obj[k][0] === 1) {
            current_object = {};
          } else {
            hash = clone_and_add_to_hash(current_object, current_array, hash);
          }
        }
      });

      ref.set(
        hash
      , err => {
        if (err) {
          return reject(err);
        }
        console.log('Firebase Set!');
        resolve();
      });
    });
  });
};

function clone_and_add_to_hash(obj, ary, hash) {
  var clone = extend(obj);
  hash[ary].push(clone);
  return hash;
}

exports.load_content = function(page, db) {
  var promises = [];
  return new Promise((resolve, reject) => {
    console.log('About to read json file in public');
    jsonfile.readFile('./public/' + page + '.json', function(err, obj) {
      if (err) {
        return reject(err);
      }
      console.log('About to set in firebase');

      // Create hash where keys are first word in phrases of values in column A
      // For instance: {about:1,all:1,db:1,featured:1,footer:1....}
      var nodes = obj.reduce(function(h, e){
        var node = e[0].split(/_/)[0];
        h[node] = 1;
        return h;
      }, {});

      var hash = {};
      var nodes = Object.keys(nodes).map(function(col_a_value) {
        // Values of keys in hash are the whole phrase in column a, for instance
        // { about_description: [ 'The UNICEF Innovation Fund
        sub_hash = obj.reduce(function(h, e) {
          var node = e[0].split(/_/)[0];
          if (col_a_value === node) {
            h[e[0]] = e.slice(1, e.length);
          }
          return h;
        }, {});
        hash[col_a_value] = sub_hash;
      });
      // Load each node individually instead of setting all at once to avoid wiping out other nodes
      // added by other scripts.
      Object.keys(hash).forEach(e => {
        promises.push(update_firebase(e, hash[e], page, db));
      });

      Promise.all(promises).then(values => {
        console.log('done!!!!');
        resolve();
      });
    });
  });
};

function update_firebase(key, value, page, db) {
  return new Promise((resolve, reject) => {
    var ref = db.ref(page + '/' + key);
    ref.set(
      value
    , function(err) {
      if (err) {
        return reject(err);
      }
      console.log('Firebase Set!', page + '/' + key);
      resolve();
    });
  });
}

// extends 'from' object with members from 'to'. If 'to' is null, a deep clone of 'from' is returned
function extend(from, to)
{
  if (from == null || typeof from != "object") return from;
  if (from.constructor != Object && from.constructor != Array) return from;
  if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
    from.constructor == String || from.constructor == Number || from.constructor == Boolean)
    return new from.constructor(from);

  to = to || new from.constructor();

  for (var name in from)
  {
    to[name] = typeof to[name] == "undefined" ? extend(from[name], null) : to[name];
  }

  return to;
}
