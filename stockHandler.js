const dbHandler = require('./dbHandler.js');
const api = require('./apiHandler.js');

const handleOne = (query, next) => {
  api.call(query.stock, (apiData) => {
    if (!apiData) { return { 'Error': 'Api Error'}; }
    if(query.like == 'true') {
      dbHandler.getAndLike(apiData, query.ip, (stockData) => {
        return next({stockData: stockData});
      });
    } else {
      dbHandler.get(apiData, (stockData) => {
        return next({stockData: stockData});
      });
    }
  });
}

const handleMultiple = (query, next) => {
  apiCallTwo(query, (apiDataArr) => {
    if(query.like == 'true') {
      dbHandler.getAndLike(apiDataArr[0], query.ip, (fstockData) => {
        if (!fstockData) {return {}}
        dbHandler.getAndLike(apiDataArr[1], query.ip, (sstockData) => {
          if (!fstockData) {return {}}
          return next({ stockData: getRelLikes([fstockData, sstockData])});
        });
      });
    } else {
      dbHandler.get(apiDataArr[0], (fstockData) => {
        if (!fstockData) {return {}}
        dbHandler.get(apiDataArr[1], (sstockData) => {
          if (!sstockData) {return {}}
          return next({ stockData: getRelLikes([fstockData, sstockData])});
        });
      });
    }
  });
}

const apiCallTwo = (query, next) => {
  api.call(query.stock[0], (firstApiData) => {
    if (!firstApiData) { return { 'Error': 'Api Error'}; }
    api.call(query.stock[1], (secondApiData) => {
      if (!secondApiData) { return { 'Error': 'Api Error'}; }
      return next([firstApiData, secondApiData]);
    });
  });
}

const getRelLikes = (stockDataArr) => {
  const fDiff = stockDataArr[0].likes - stockDataArr[1].likes;
  const sDiff = stockDataArr[1].likes - stockDataArr[0].likes;
  
  stockDataArr[0].rel_likes = fDiff;
  stockDataArr[1].rel_likes = sDiff;
  
  delete stockDataArr[0].likes;
  delete stockDataArr[1].likes;
  return stockDataArr;
}

//rel_likes
//[ { stockData: { stock: 'ibm', price: '143.2400', likes: 0 } },
//{ stockData: { stock: 'msft', price: '107.8000', likes: 0 } } ]

//{ stock: [ 'goog', 'msft' ], ip: '41.144.41.23' }
module.exports.handleOne = handleOne;
module.exports.handleMultiple = handleMultiple;