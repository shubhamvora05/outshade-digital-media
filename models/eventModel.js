var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

const EventSchema = new mongoose.Schema({
    eventname: String,
    creator_Id: String,
    date:{
        type: Date, 
        default: Date.now },
  })

EventSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Events", EventSchema);