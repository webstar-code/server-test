const express = require("express");
const client = require("..");
const MovieModel = require("../models/movies");
const movieRouter = express.Router();
var mongoUtil = require('../mongoUtil');


movieRouter.get("/getMovies", async (req, res) => {
  var db = mongoUtil.getDb();

  console.log("Get movies");
  // console.log(MovieModel.find({}));

  const movies = db.collection("movies");

  // const data = await movies.find({}).limit(10);
  // res.send(data);
  const findResult = await movies.find({}).limit(20).toArray();
  // console.log('Found documents =>', findResult);
  res.send(findResult);

  // // query for movies that have a runtime less than 15 minutes
  // const query = { runtime: { $lt: 15 } };
  // const options = {
  //   // sort returned documents in ascending order by title (A->Z)
  //   sort: { title: 1 },
  //   // Include only the `title` and `imdb` fields in each returned document
  //   projection: { _id: 0, title: 1, imdb: 1 },
  // };
  // const cursor = movies.find(query, options);
  // // print a message if no documents were found
  // if ((await cursor.count()) === 0) {
  //   console.log("No documents found!");
  // }
  // // replace console.dir with your callback to access individual elements
  // //  await cursor.forEach(console.dir);

  // res.send(cursor.map((item) => item));



})


movieRouter.get("/getFacetsByGenres", async (req, res) => {

  const agg = [
    {
      '$facet': {
        'categorizebyGenres': [
          {
            '$unwind': '$genres'
          }, {
            '$sortByCount': '$genres'
          }
        ]
      }
    }
  ];

  var db = mongoUtil.getDb();
  const movies = db.collection("movies");

  let result = await movies.aggregate(agg).toArray();
  res.send(result);
})


movieRouter.get("/getByGenre", async (req, res) => {
  const queryParams = req.query.genre;
  let genres = [];

  if (Array.isArray(queryParams)) {
    genres = queryParams;
  } else {
    genres.push(queryParams);
  }

  const agg = [{
    $match: {
      $and: genres.map((genre) => (
        {
          genres: {
            $elemMatch: {
              $eq: genre
            }
          }
        }
      )
      )
    }
  }]

  var db = mongoUtil.getDb();
  const movies = db.collection("movies");

  let result = await movies.aggregate(agg).limit(20).toArray();
  res.send(result);

})


module.exports = movieRouter;