var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
    spotifyId: {
        type: String,
    },
    userToken: {
        type: String,
    },
    email: {
        type: String,
    },
    user_id: {
        type: String,
    },
   songID: [{
       type: Array,
       unique: true 
   }],
   songName: [{
    type: Array,
    unique: true 
    }]
})

var User = module.exports = mongoose.model(
    'User', UserSchema
);