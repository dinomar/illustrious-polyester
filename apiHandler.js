const request = require('request');

const KEY = process.env.APIKEY;


const call = (stockSymbol, next) => {
  let options = { uri: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=' + stockSymbol + '&apikey=' + KEY,
                 method: 'GET',
                 headers: { 'Accept': 'application/json', 'Accept-Charset': 'utf-8' }
                };
  
  request(options, (err, res, body) => {
    if (err) { return console.log('Api network error: ' + err) }
    let json = JSON.parse(body);
    
    if(json.hasOwnProperty('Error Message')) {
      console.log('Api: Error: ' + JSON.stringify(json));
      return next({});
    }
    
    const jsonKeys = Object.keys(json);
    const jsonMetaKeys = Object.keys(json[jsonKeys[0]]);
    const jsonDataKeys = Object.keys(json[jsonKeys[1]]);
    
    const symbol = json[jsonKeys[0]][jsonMetaKeys[1]];
    const price = json[jsonKeys[1]][jsonDataKeys[0]]['1. open'];
    
    return next({symbol: symbol, price: price});
  });
}

module.exports.call = call;