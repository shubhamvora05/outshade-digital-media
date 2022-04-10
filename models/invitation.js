var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

const InvitationSchema = new mongoose.Schema({
    event_id: String,
    invitedUser:String,
    date:{
        type: Date, 
        default: Date.now },
  })

  InvitationSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Invites", InvitationSchema);