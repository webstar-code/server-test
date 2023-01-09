const express = require("express");
const { ObjectId } = require("mongodb");
const wotRouter = express.Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const axios = require("axios");
const dotenv = require("dotenv");
var mongoUtil = require("../mongoUtil");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/callback",
    },
    function (accessToken, refreshToken, profile, cb) {
      user = { profile: profile.id };
      return cb(null, user);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

wotRouter.get("/auth", passport.authenticate("google", { scope: ["profile"] }));

wotRouter.get(
  "/auth/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

wotRouter.post("/zoom", async (req, res) => {
  var token = "";
  var meeting_data = JSON.stringify({
    agenda: "My Meeting",
    default_password: false,
    duration: 60,
    password: "123456",
    pre_schedule: false,
    recurrence: {
      end_date_time: "2023-04-02T15:59:00Z",
      end_times: 7,
      monthly_day: 1,
      monthly_week: 1,
      monthly_week_day: 1,
      repeat_interval: 1,
      type: 1,
      weekly_days: "1",
    },
    schedule_for: process.env.EMAIL,
    settings: {
      additional_data_center_regions: ["TY"],
      allow_multiple_devices: true,
      calendar_type: 1,
      close_registration: false,
      contact_email: process.env.EMAIL,
      contact_name: "dev",
      email_notification: true,
      encryption_type: "enhanced_encryption",
      focus_mode: true,
      host_video: true,
      jbh_time: 0,
      join_before_host: false,
      meeting_authentication: true,
      meeting_invitees: [
        {
          email: process.env.EMAIL,
        },
      ],
      mute_upon_entry: false,
      participant_video: false,
      private_meeting: false,
      registrants_confirmation_email: true,
      registrants_email_notification: true,
      registration_type: 1,
      show_share_button: true,
      use_pmi: false,
      waiting_room: false,
      watermark: false,
      host_save_video_order: true,
      alternative_host_update_polls: true,
    },
    start_time: "2023-03-25T07:32:55Z",
    topic: "My Meeting",
  });
  //generate a new access token
  var config = {
    method: "post",
    url: "https://zoom.us/oauth/token",
    headers: {
      Authorization: "Basic " + process.env.CLIENT_ID_SECRET,
    },
    params: {
      grant_type: "account_credentials",
      account_id: process.env.ACCOUNT_ID,
    },
  };

  axios(config)
    .then(function (response) {
      token = response.data.access_token;

      var config2 = {
        method: "post",
        url: "https://api.zoom.us/v2/users/me/meetings",
        headers: {
          Authorization: "Bearer " + response.data.access_token,
          "Content-Type": "application/json",
        },
        data: meeting_data,
      };
      console.log("Access Token" + response.data.access_token);

      //generate a meeting url.
      axios(config2)
        .then(function (response) {
          res.send({ message: "Successful", meeting_id: response.data.id });
        })
        .catch(function (error) {
          res.status(400).send(error);
          console.log(error);
        });
    })
    .catch(function (error) {
      res.status(400).send(error);
      console.log(error);
    });
});

wotRouter.post("/addClass", async (req, res) => {
  var db = mongoUtil.getWotDb();
  const userClass = req.body;
  try {
    const classes = db.collection("classes");
    const result = await classes.insertOne({
      ...userClass,
      _id: ObjectId(),
    });
    res.json(result);
  } catch (err) {
    console.log(err);
  }
});

async function subscribe() {
  console.log("subsbried");
  var db = mongoUtil.getWotDb();
  const collection = db.collection("classes");
  const changeStream = collection.watch();
  changeStream.on("change", async (next) => {
    // process next document
    console.log(next);
    let operationType = next.operationType;
    let fullDocument = next.fullDocument;
    try {
      var db = mongoUtil.getWotDb();
      const jobs = db.collection("scheduledJobs");
      const result = await jobs.insertOne({
        docId: fullDocument._id,
        triggerAt: "2023-01-04T23:18:19.165Z",
      });
      console.log(result);
      await db
        .collection("scheduledJobs")
        .createIndex({ triggerAt: 1 }, { expireAfterSeconds: 10 });
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
    console.log(err);
  }
});

module.exports = wotRouter;
