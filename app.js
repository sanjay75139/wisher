const nodemailer = require('nodemailer');
const express = require('express');
const schedule = require('node-schedule');
const fs = require('fs');
const bodyParser = require("body-parser");
const path = require("path");
const { get_cookies } = require('./src/controllers/misc.controller');
require('./src/controllers/misc.controller');
require('dotenv').config({});
const runner = require('./src/runner/schedule.runner');

const app = express();
app.use(express.static("public"));

const sch = schedule.scheduleJob('*/1 * * * *' ,() => {
  runner.run();
  return;
  console.log("Job Started! => " + getDateTime());
});

function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + "/" + month + "/" + day + "-" + hour + ":" + min + ":" + sec;
}

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({extended : true}))
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

app.get('/', function(req, res){
  if(get_cookies(req)['auth'] !== undefined && get_cookies(req)['auth'] !== null && get_cookies(req)['auth'])
    res.render("index", {loggedIn: true})
  else
    res.render("index", {loggedIn: false})
});

app.get('/signin', function(req, res){
  if(get_cookies(req)['auth'] === undefined || get_cookies(req)['auth'] === null || !get_cookies(req)['auth'])
    res.render("signin", {err: false})
  else
    res.render("index", {loggedIn: true})
});

app.get('/signup', function(req, res){
  if(get_cookies(req)['auth'] === undefined || get_cookies(req)['auth'] === null || !get_cookies(req)['auth'])
    res.render("signup", {err: false})
  else
    res.render("index", {loggedIn: true})
});

app.get('/reset', function(req, res){
  // if(get_cookies(request)['auth'] === undefined && get_cookies(request)['auth'] === null && !get_cookies(request)['auth'])
  //   res.render("signup")
  // else
  //   res.render("index", {loggedIn: true})
});

app.get('/guest-user', function(req, res){
  res.render("guest-login", {err: false})
});

app.get('/verify/:type/:vk', function(req, res){
  res.render("verify", {verificationKey: req.params.vk, type: req.params.type, invalidCode:false})
});

app.get('/new', function(req, res){
  if(get_cookies(req)['auth'] !== undefined && get_cookies(req)['auth'] !== null && get_cookies(req)['auth'])
    res.render("new-schedule")
  else
    res.render("signin", {err: false})
});

app.get('/features', function(req, res){
  if(get_cookies(req)['auth'] !== undefined && get_cookies(req)['auth'] !== null && get_cookies(req)['auth'])
    res.render("features", {loggedIn: true})
  else
    res.render("features", {loggedIn: false})
});

app.get('/logout', (req, res) => {
  res.clearCookie('auth');
  res.clearCookie('emailId');
  res.redirect('/')
})

app.get('/forget-password', (req, res) => {
  res.render("forget-password", {err: false})
})

app.get('/reset-password/:vk', (req, res) => {
  res.render("reset-password", {err: false, verificationKey: req.params.vk})
})

require("./src/routes/app.routes")(app);

let port = process.env.PORT || 3000

app.listen(port, function(){
  console.log("Server is up and running at port " + port);
});
