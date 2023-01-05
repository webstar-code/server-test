const express = require("express");
const { ObjectId } = require("mongodb");
const wotRouter = express.Router();
var mongoUtil = require('../mongoUtil');




wotRouter.post("/addClass", async (req, res) => {
  var db = mongoUtil.getWotDb();
  const userClass = req.body;
  try {
    const classes = db.collection("classes");
    const result = await classes.insertOne({
      ...userClass,
      _id: ObjectId()
    })
    res.json(result);
  } catch (err) {
    console.log(err)
  }
})

async function subscribe() {
  console.log("subsbried")
  var db = mongoUtil.getWotDb();
  const collection = db.collection('classes');
  const changeStream = collection.watch();
  changeStream.on('change', async next => {
    // process next document
    console.log(next);
    let operationType = next.operationType;
    let fullDocument = next.fullDocument;
    try {
      var db = mongoUtil.getWotDb();
      const jobs = db.collection('scheduledJobs');
      const result = await jobs.insertOne({ docId: fullDocument._id, triggerAt: "2023-01-04T23:18:19.165Z" })
      console.log(result);
      await db.collection('scheduledJobs').createIndex({ "triggerAt": 1 }, { expireAfterSeconds: 10 })
    } catch (err) {
      console.log(err);
    }
  });
}
wotRouter.get("/getAllClasses", async (req, res) => {
  var db = mongoUtil.getWotDb();
  try {
    const classes = db.collection("classes");
    const result = await classes.find({}).toArray();
    res.json(result);

    subscribe();
  } catch (err) {
    console.log(err)
  }
})

module.exports = wotRouter;