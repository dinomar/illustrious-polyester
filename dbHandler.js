var MongoClient = require('mongodb');
const CONNECTION_STRING = process.env.DB;

//const getAndLike

//get
//exists find
//not exists create find


//get and like
//exists addLike find
//not exists create addLike find

const get = (stock, next) => {
  MongoClient.connect(CONNECTION_STRING, (err, db) => {
    if (err) { return console.log('DB Error: ' + err)}
    const dbo = db.db('freecodecamp');
    const collection = dbo.collection('stockData');
    
    find(collection, stock, (data) => {
      if (data) {
        const likes = filterLikes(data.likes);
        db.close();
        return next({'stock': data.stock, price: stock.price, likes: likes });
      } else {
        createAndFind(collection, stock, (newData) => {
          const likes = filterLikes(newData.likes);
          db.close();
          return next({'stock': newData.stock, price: stock.price, likes: likes });
        })
      }
    });
    
  });
}

const getAndLike = (stock, userIp, next) => {
  MongoClient.connect(CONNECTION_STRING, (err, db) => {
    if (err) { return console.log('DB Error: ' + err)}
    const dbo = db.db('freecodecamp');
    const collection = dbo.collection('stockData');
    
    find(collection, stock, (data) => {
      if (data) {
        createAndFind(collection, stock, () => {
          const likes = filterLikes(data.likes);
          db.close();
          return next({ 'stock': data.stock, price: stock.price, likes: likes });
        });
      } else {
        createLikeFind(collection, stock, userIp, (newData) => {
          const likes = filterLikes(newData.likes);
          db.close();
          return next({ 'stock': newData.stock, price: stock.price, likes: likes });
        })
      }
    });
  });
}

const find = (collection, stock, next) => {
  collection.findOne({ stock: stock.symbol}, (err, data) => {
    if (err) { return console.log('DB Error: exists: ' + err)}
    return next(data);
  });
}

const create = (collection, stock, next) => {
  const newStock = { stock: stock.symbol, likes: [ { like: 0, ip: '127.0.0.1'} ] };
  collection.insertOne(newStock, (err, data) => {
    if (err) { return console.log('DB Error: create: ' + err)}
    return next();
  });
}

const like = (collection, stock, ip, next) => {
  const query = { stock: stock.symbol };
  const update = { $push: { likes: { like: 1, ip: ip }}};
  collection.updateOne(query, update, (err, likedata) => {
    if (err) { return console.log('DB Error: update like: ' + err)}
    return next();
  });
}

const createAndFind = (collection, stock, next) => {
  create(collection, stock, () => {
    find(collection, stock, (data) => {
      return next(data);
    });
  });
}

const createLikeFind = (collection, stock, ip, next) => {
  create(collection, stock, () => {
    like(collection, stock, ip, () => {
      find(collection, stock, (data) => {
        return next(data);
      });
    });
  });
};



const adddLike = (stock, ip, next) => {
  MongoClient.connect(CONNECTION_STRING, (err, db) => {
    if (err) { throw err; }
    const dbo = db.db('freecodecamp');
    const likequery = { stock: stock.symbol };
    const likeUpdate = { $push: { likes: { like: 1, ip: ip }}};
    dbo.collection('stockData').updateOne(likequery, likeUpdate, (err, likedata) => {
      if (err) { throw err; }
      db.close();
      return next();
    });
  });
};


const creadte = (dbo, stock, next) => {
  const newStock = { stock: stock.symbol, likes: [ { like: 0, ip: '127.0.0.1'} ] };
  dbo.collection('stockData').insertOne(newStock, (err, data) => {
    if (err) { return console.log('DB Error: create: ' + err)}
    return next();
  });
}

const finda = (dbo, stock, next) => {
  const dbquery = { stock: stock.symbol };
  dbo.collection('stockData').findOne( dbquery, (err, data) => {
    if (err) { return console.log('DB Error: create: ' + err)}
    const likes = filterLikes(data.likes);
    return next({ stockData: { 'stock': data.stock, price: stock.price, likes: likes }});
  });
}

const filterLikes = (likesArr) => {
  const filteredLikes = [];
  for(let i = 0; i < likesArr.length; i++) {
    let contains = false;
    for(let j = 0; j < filteredLikes.length; j++) {
      if (likesArr[i].ip == filteredLikes[j].ip) {
        contains = true;
        break;
      }
    }
    if (!contains) {
      filteredLikes.push(likesArr[i]);
    }
  }
  
  const likes = filteredLikes.reduce((acc, cur) => {
    return acc + cur.like;
  }, 0);
  
  return likes;
}


module.exports.get = get;
module.exports.getAndLike = getAndLike;