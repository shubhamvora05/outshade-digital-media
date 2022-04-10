const express = require('express')
//app.use(cors());
var bodyParser = require('body-parser')
const mongoose = require('mongoose');
var User = require("./models/userModel");
var Event = require("./models/eventModel");
var Invites = require("./models/invitation");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose =
        require("passport-local-mongoose");

mongoose.connect( 
    'mongodb+srv://shubhamvora05:Stockdata@stockdata.lrlgm.mongodb.net/outShade?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to database');
  })
  .catch((err) => {
    console.log('Error connecting to DB', err.message);
  });

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.json());
const port = 3000

app.use(require("express-session")({
    secret: "Shubham is a developer",
    resave: false,
    saveUninitialized: false
}));


  app.use(passport.initialize());
  app.use(passport.session());
   
passport.use(User.createStrategy());
 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());

 // home root
 app.get("/",isLoggedIn,function (req, res) {
     res.send("Hello user! you are loggedin successfully!")
 });

 // when user make post request to register
 app.post("/register", function (req, res) {
    console.log(req.body.username);
    //console.log(req.body.password);
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.send("error in registration process");
        }
        passport.authenticate("local")(req, res, function(){
            res.send("Rregistered successfully");
        });
    });
});

// making get request on login
app.get("/login", function (req, res) {
    res.send("please! try to login again.");
});

// to login
app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
}), function (req, res) {
});

// to logout
app.get("/logout", function (req, res) {
    req.logout();
    res.send("User Logout successfully");
});

// to change password
app.post("/changePassword", isLoggedIn, function(req,res){
    User.findByUsername(req.body.username).then(function(sanitizedUser){
        if (sanitizedUser){
            sanitizedUser.setPassword(req.body.password, function(){
                sanitizedUser.save();
                res.send('password reset successful');
            });
        } else {
            res.send('User does not exists');
        }
    },function(err){
        console.error(err);
    });
});

// to get all events of current user
app.get("/:userid",isLoggedIn,function (req, res) {
    var creator_id=req.params.userid;
    //console.log(creator_id);
    var EventDetails=Event.find({creator_Id:creator_id});
    EventDetails.exec()
    .then(createdEvents=>{
            res.json({
                message:"All fetched events for current user.",
                CreatedEvents:createdEvents,
            });
        })  
    .catch(err=>{
        res.json(err);
    })
});

// to get all events in which user is invited
app.get("/invitedEvents/:userid",isLoggedIn,function (req, res) {

    var inviteDetails = Invites.find({invitedUser:req.params.userid});
    inviteDetails.exec()
    .then(invitedevents=>{
        var invitations = [];
        invitedevents.forEach((events)=>{
            invitations.push(events.event_id);
        });
        //console.log(invitations);
        var EventDetails=Event.find({_id:invitations});
            EventDetails.exec()
            .then(InvitedEvents=>{
                res.json({
                    invitation:"All events in which current user invited.",
                    invitationEvents:InvitedEvents
                });  
            })       
    })
    .catch(err=>{
        res.json(err);
    })
});

// to create event
app.post("/createEvent",isLoggedIn,function(req,res){
    //console.log(req.body.eventName);
    //console.log(req.body.creator_id);
    var eventDetails=new Event({eventname:req.body.eventName,creator_Id:req.body.creator_id});
    eventDetails.save()
    .then(doc=>{
        res.json({
            message:"Event created Successfully",
            results:doc
        });
    })
    .catch(err=>{
        console.log(err);
        res.json(err);
    });
});

// to invite user
app.post("/inviteUser/:eventId",isLoggedIn,function(req,res){
   var inviteDetails=new Invites({
    event_id:req.params.eventId,
    invitedUser:req.body.inviteduser
  });
  inviteDetails.save()
.then(doc=>{
    res.status(201).json({
        message:"Invitation sent Successfully",
        results:doc
    });
})
.catch(err=>{
    res.json(err);
});
});

// to update the event
app.post("/updateevent/:eventId",isLoggedIn,function(req,res){
    Event.findById(req.params.eventId,function(err,dataToUpdate){
        dataToUpdate.eventname=req.body.eventname;
        dataToUpdate.save()
        .then(doc=>{
            res.json({
               message:"event updated successfully.",
               results:doc
            });
        })
        .catch(err=>{
            res.json(err);
        });
    })
});

// middleware function to check user is loggedin or not
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.send("please! logIn first.");
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})