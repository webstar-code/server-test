const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Razorpay = require('razorpay');
const app = express()
const rzp_key_id = "rzp_test_z0YkACPaTVanaP"
const rzp_key_secret = "6JX49RGrpXUcqKwl5KqSw9J2";
const webpush = require('web-push') //requiring the web-push module

const movieRouter = require("./routes/movies");
const mongoUtil = require("./mongoUtil");
const wotRouter = require("./routes/wot");



mongoUtil.connectToServer(function (err, client) {
  if (err) console.log(err);
  // start the rest of your app here
  console.log("mongo connected")


  // these things wont't be availbale until mongo connects
  app.use(cors());
  app.use(bodyParser.json());
  app.use(movieRouter);
  app.use(wotRouter);


});






var instance = new Razorpay({
  key_id: rzp_key_id,
  key_secret: rzp_key_secret,
});


app.post("/rzp-checkout", async (req, res) => {
  const data = req.body;
  console.log(data);
  // var options = {

  //   receipt: "order_rcptid_11"
  // };
  // const order = await instance.orders.create(options);
  // return order.id
  return "123"
})

app.get("/", (req, res) => {
  console.log("Home at 5000")
  res.send("Hello from 8000")
})
const vapidKeys = {
  publicKey:
    'BIGhUDUNcV0ubA7D4otgCQrl07VySWdjO0hEwmHI6qslVdQqzwdEYrK6i4gYhQfvjM-erm8fNs3_ZAOH5_M8wn0',
  privateKey: 'zlQLApXs5KA8c-DPnfJhg4dshXwZ1CZxqrDno879Fmc',
}
//setting our previously generated VAPID keys
webpush.setVapidDetails(
  'mailto:myuserid@email.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)
//function to send the notification to the subscribed device
const sendNotification = (subscription, dataToSend = '') => {
  let s = { "endpoint": "https://fcm.googleapis.com/fcm/send/dxLonzstaTo:APA91bGvT4zZvgbA3mklc2DqmpPcpruDyLq5KH8KK9J3K4ONmaG4yKtUAgsJBVMsVlKZRKAfr1Z3fkQs9CSVulA3iGroO84CXx-6UfcaEpCVHrBiuHRCE-2ZPvBQa0kiF6buq7eV7g9A", "expirationTime": null, "keys": { "p256dh": "BE99S6zI5es4lSioeiQ5IvzasL5g4uAHbRxNghPNegVuYEoPUB3Wb1qnrvqhOzVfC06xIFIqAokJtnHpBMuSzqg", "auth": "MKYJQVx8TQnrSb4edhn1hw" } }

  webpush.sendNotification(subscription, dataToSend)
}
// let dummyDb = {
//   subscription: { "endpoint": "https://fcm.googleapis.com/fcm/send/cBVZEgf17iI:APA91bHGTXmycE6Q3uTps3uxw_pJ5Pph7fw6JWhVFgMCof1z_P-sUBVd8dFqjDrf1Lq-JBeQNBrEElOFQWMowRCWWFuF5UCQpQuOEHf9cp6yby00kQQeRr1MHvdnfZtbrfbDgLekJQwl", "expirationTime": null, "keys": { "p256dh": "BKht5cel3F87xIy120UWRtBLWRl5iSL2yDCT77xfA0g_BH6wBW82FAa_TJ0j8YQY6OESgJNemBNKRl3JbiQV0Us", "auth": "P9e3KuW9hezalKxN4zmecg" } }

// }

const dummyDb = { subscription: null } //dummy in memory store

const saveToDatabase = async subscription => {
  dummyDb.subscription = subscription
}

app.post("/save-subscription", async (req, res) => {
  const subscription = req.body
  console.log(subscription);
  await saveToDatabase(subscription)
  res.json({ message: 'success' })
})


app.get('/send-notification', (req, res) => {
  const subscription = dummyDb.subscription //get subscription from your databse here.
  const message = 'Hello World'
  sendNotification(subscription, message)
  res.json({ message: 'message sent' })
})

const port = parseInt(process.env.PORT) || 8000;
app.listen(port, () => console.log(`Example app listening on port 8000`))
