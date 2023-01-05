const MongoClient = require('mongodb').MongoClient;

// for hosted/cloud db
const uri = "mongodb+srv://rest:rest123@cluster0.wym0q.mongodb.net/?retryWrites=true&w=majority"

// for local db
// const uri = "mongodb://localhost:27017"
var _db;
var _wotdb;

module.exports = {

  connectToServer: function (callback) {
    MongoClient.connect(uri, { useNewUrlParser: true }, function (err, client) {
      _db = client.db('sample_mflix');
      _wotdb = client.db('wot');
      return callback(err);
    });
  },

  getDb: function () {
    return _db;
  },

  getWotDb: function () {
    return _wotdb;
  }
};