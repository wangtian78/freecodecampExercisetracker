const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Agu","Sept","Oct","Nov","Dec"];
const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

var Schema = mongoose.Schema;
var trackerSchema = new Schema({
  username: String,
  userId: Number,
  log: [{duration: Number, description: String, date: String}]
});
var Tracker = mongoose.model("Tracker",trackerSchema,'exerciseTracker');//use existing collection
/*
var tracker = new Tracker({
  username: 'user01',
  userId:  1,
  uration: 5,
  escription: 'this is a testing',
  data: Date().toString()
});
*/
//tracker.save();
app.route("/api/exercise/new-user").post(function(req,res){
  let username = req.body.username;
  Tracker.findOne({username: username},function(err,data){
    if (data){res.send("username already taken");}
    else {
      Tracker.count({},function(err,length){
        let document = new Tracker({
          username: username,
          userId: (length + 1),
          log: []
        });
        document.save(function(err){
          if (err) console.log(err);
          else {
            res.json({username: username, userId: document.userId});
          }
        });
      });
    }
  });
});
app.route("/api/exercise/add").post(function(req,res){
  let description = req.body.description;
  let duration = req.body.duration;
  let time = req.body.date;
  
  if (!description){
    return res.send('description is required');
  }
  if (!duration){
    return res.send('duration is required');
  }
  let userId = req.body.userId;
  Tracker.findOne({userId: userId},function(err,data){
    if (data) {
      if (!time){//no date input, use now time
        time = new Date();
      }
      else {
        time = new Date(time);
      }
      let day = weekdays[time.getDay()];
      let month = months[time.getMonth()];
      let date = time.getDate();
      let year = time.getFullYear();
      let finalTime = day + " " + month + " " + date + " " + year;
      let newLog = {duration: duration, description: description,date: finalTime};
      data.log.push(newLog);
      data.save(function(err){
        if (err) console.log(err);
        else {
          res.json({username: data.username, userId: data.userId, description: description, duration: duration, date: finalTime});
        }
      });
      //res.send(finalTime);
    }
    else{
      res.send("unkown id");
    }
  });
});
app.route("/api/exercise/log").get(function(req,res){
  let userId = req.query.userId;
  let from = req.query.from;
  let to = req.query.to;
  let limit = req.query.limit;
  if (!userId) return res.send("Unkown UserId");
  Tracker.findOne({userId: userId},function(err,data){
    if (data){//existing user
      let logs=data.log;
      let outputLogs = [];
      //following is just different conditions based on "from", "to" and "limit" paramters
      if (from && to && limit){
        let fromTime = new Date(from);
        let toTime = new Date(to);
        for (let i in logs){
              let curTime = new Date(logs[i].date);
              if (curTime.getTime()>=fromTime && curTime.getTime()<=toTime){
                let temp = {description: logs[i].description, duration: logs[i].duration, date: logs[i].date}
                outputLogs.push(temp);
              }
            }
        let n = Math.min(limit,outputLogs.length);
        outputLogs = outputLogs.slice(0,n);
        return res.json({userId: data.userId,username:data.username,count: outputLogs.length, log: outputLogs});
      }
      if (from && to){
        let fromTime = new Date(from);
        let toTime = new Date(to);
        for (let i in logs){
              let curTime = new Date(logs[i].date);
              if (curTime.getTime()>=fromTime && curTime.getTime()<=toTime){
                let temp = {description: logs[i].description, duration: logs[i].duration, date: logs[i].date}
                outputLogs.push(temp);
              }
            }
        return res.json({userId: data.userId,username:data.username,count: outputLogs.length, log: outputLogs});
      }
      if (from && limit){
        let fromTime = new Date(from);
        for (let i in logs){
              let curTime = new Date(logs[i].date);
              if (curTime.getTime()>=fromTime){
                let temp = {description: logs[i].description, duration: logs[i].duration, date: logs[i].date}
                outputLogs.push(temp);
              }
            }
        let n = Math.min(limit,outputLogs.length);
        outputLogs = outputLogs.slice(0,n);
        return res.json({userId: data.userId,username:data.username,count: outputLogs.length, log: outputLogs});
      }
      if (to && limit){
        let toTime = new Date(to);
        for (let i in logs){
              let curTime = new Date(logs[i].date);
              if (curTime.getTime()<=toTime){
                let temp = {description: logs[i].description, duration: logs[i].duration, date: logs[i].date}
                outputLogs.push(temp);
              }
            }
        let n = Math.min(limit,outputLogs.length);
        outputLogs = outputLogs.slice(0,n);
        return res.json({userId: data.userId,username:data.username,count: outputLogs.length, log: outputLogs});
      }
      if (from){
        let fromTime = new Date(from);
        for (let i in logs){
              let curTime = new Date(logs[i].date);
              if (curTime.getTime()>=fromTime){
                let temp = {description: logs[i].description, duration: logs[i].duration, date: logs[i].date}
                outputLogs.push(temp);
              }
            }
        return res.json({userId: data.userId,username:data.username,count: outputLogs.length, log: outputLogs});
      }
      if (to){
        let toTime = new Date(to);
        for (let i in logs){
              let curTime = new Date(logs[i].date);
              if (curTime.getTime()<=toTime){
                let temp = {description: logs[i].description, duration: logs[i].duration, date: logs[i].date}
                outputLogs.push(temp);
              }
            }
        return res.json({userId: data.userId,username:data.username,count: outputLogs.length, log: outputLogs});
      }
      if (limit){
        for (let i in logs){
          if (logs[i].description){
            let temp = {description: logs[i].description, duration: logs[i].duration, date: logs[i].date}
            outputLogs.push(temp);
          }
        }
        let n = Math.min(limit,logs.length);
        outputLogs = outputLogs.slice(0,n);
        return res.json({userId: data.userId,username:data.username,count: outputLogs.length, log: outputLogs});
      }
      //only userId is available
      for (let i in logs){
        if (logs[i].description){//if without this condtion, return many empty object, don't know why
          let temp = {description: logs[i].description, duration: logs[i].duration, date: logs[i].date}
          outputLogs.push(temp);
        }
      }
        return res.json({userId: data.userId,username:data.username,count: outputLogs.length, log: outputLogs});
    }
    else {res.send("Unkown UserId");}//user not exist
  });
  //res.send(userId+from+to+limit);
});
// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
