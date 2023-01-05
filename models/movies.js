const { default: mongoose } = require("mongoose");

const movieSchema = new mongoose.Schema({
  plot: String,
  geners: Array,
  runtime: Number,
  cast: Array,
  num_mflix_comments: Number,
  poster: String,
  title: String,
  lastUpdatedAt: String,
  languages: Array,
  released: String,
  directors: Array,
  rated: String,
  awards: Array,
  year: Number,
  imbd: {
    rating: Number,
    votes: Number,
    id: Number
  },
  countries: Array,
  type: String,
  tomatoes: {
    viewer: {
      rating: Number,
      numReviews: Number,
      meter: Number,
    },
    dvd: String,
    lastUpdated: String
  }
})


const MovieModel = mongoose.model("movieModel", movieSchema);
module.exports = MovieModel