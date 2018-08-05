/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var stockHandler = require('../stockHandler.js');

//const CONNECTION_STRING = process.env.DB;
//const API_KEY = process.env.APIKEY;

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
    if(!req.query.stock) { return res.end('missing params') }
    
    const query = req.query;
    query.ip = req.headers['x-forwarded-for'].split(',')[0];
    
    if(Array.isArray(query.stock)){
      stockHandler.handleMultiple(query, (stockDataArr) => {
        res.json(stockDataArr);
      });
    } else {
      stockHandler.handleOne(query, (stockData) => {
        console.log(stockData);
        res.json(stockData);
      });
    }
    
  });
}
//{ stock: [ 'goog', 'msft' ] }
//{ stock: 'goog' }

//[ { symbol: 'ibm', price: '143.2400' },
  //{ symbol: 'ibm', price: '143.2400' } ]
