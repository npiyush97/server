const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
const hostname = process.env.HOSTNAME || "localhost";
const PORT = process.env.PORT || 5000;
require("dotenv").config();
var accountSid = process.env.SID;
var authToken = process.env.AUTH;
const twilio = require("twilio")(accountSid, authToken);

const db = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
    timezone: 'utc'
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/get", (req, res) => {
  const sqlData = "SELECT * FROM contacts";
  db.query(sqlData, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

app.post("/api/post", (req, res) => {
  const { first_name, last_name, phone } = req.body;
  const sqlInsert =
    "INSERT INTO contacts (first_name,last_name,phone) VALUES (?,?,?)";
  db.query(sqlInsert, [first_name, last_name, phone], (error, result) => {
    if (error) {
      console.log(error);
    }
    res.send(result);
  });
});

app.get("/api/get/:id", (req, res) => {
  const { id } = req.params;
  const sqlGet = "SELECT first_name,last_name,phone FROM contacts where id = ?";
  db.query(sqlGet, id, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});
app.put("/put/:id", (req, res) => {
  const { id } = req.params;
  const otp = req.body.randomNum;
  let time = new Date();
  let date = time.getDate()
  let month = time.getMonth() + 1
  let year = time.getFullYear()
  let hour = time.getHours()  > 12 ? `${time.getHours - 12} PM` : time.getHours()
  let minute = time.getMinutes()
  let today = `${date}-${month}-${year}:${hour}:${minute}`;
  twilio.messages
    .create({
      from: process.env.TWILIO_NUMBER,
      to: `+91${id}`,
      body: `Hi! Your OTP is ${otp}`,
    })
    .then((res) => {
      console.log("Message Sent");
    })
    .catch((err) => {
      console.log("Error");
    });
  const sqlUpdate = "UPDATE contacts SET otp=?,datetime=? WHERE phone=?";
  db.query(sqlUpdate, [otp, today, id], (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

app.put("/api/edit:id", (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, phone } = req.body.user;
  const sqlUpdate =
    "UPDATE contacts SET first_name=?,last_name=?,phone=? WHERE ID=?";
  db.query(sqlUpdate, [first_name, last_name, phone, id], (error, result) => {
    if (error) {
      console.log(error);
    }
    res.send(result);
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://${hostname}:${PORT}`);
});
