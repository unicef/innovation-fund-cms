#!/usr/bin/env node
var writeJson    = require('write-json');
var jsonfile     = require('jsonfile');
var rows         = null;
var Spreadsheet  = require('edit-google-spreadsheet');
var fs           = require('fs');
var config = require('../configs/config');


exports.get_spreadsheet_data = function (kind, spread_id, work_id) {
  console.log(kind, spread_id, work_id);
  return new Promise(function(resolve, reject){
    Spreadsheet.load({
      debug: true,
      spreadsheetId: spread_id,
      worksheetId: work_id,
      oauth2: {
        client_id:     process.env.client_id     || config.oauth2.client_id,
        client_secret: process.env.client_secret || config.oauth2.client_secret,
        refresh_token: process.env.refresh_token || config.oauth2.refresh_token
      }
    }, function sheetReady(err, spreadsheet) {
      console.log(err)
      if (err) throw err;

      spreadsheet.receive({ getValues: true }, function(err, rows) {
        if (err) {
          return reject(err);
        }

        var arry = [];
        Object.keys(rows).forEach(function(e){
          var ary = [];
          Object.keys(rows[e]).forEach(function(k){
            ary[k-1] = rows[e][k];
          });
          arry.push(ary);
        });

        writeJson('./public/' + kind + '.json', arry, function(error) {
          if (error) {
            console.log(error);
            return reject(error.message);
          } else {
            console.log(kind, 'written to public');
            return resolve(rows);
          }
        });
      });
    });
  });
};
