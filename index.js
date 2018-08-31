// const express = require('express')
var SpotifyWebApi = require('spotify-web-api-node');//New----------------

var path = require('path')
var PORT = process.env.PORT || 5000
var User = require('./model/user.js');
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var SpotifyStrategy = require('passport-spotify').Strategy;
var mongoose = require('mongoose');
var session = require("express-session"),
    bodyParser = require("body-parser");

var users = []

var client_id = '3a997abe41e0424a9e695eaba828b0c5'; // Your client id
var client_secret = 'dc0c57ad59db447c99e257589f1b7e2d'; // Your secret
// var redirect_uri = 'http://localhost:5000/callback'; // Your redirect uri
// var redirect_uri = 'http://10.151.2.165:5000/callback'; // Your redirect uri
var redirect_uri = 'https://limitless-basin-60883.herokuapp.com/callback'; // Your redirect uri

mongoose.connect('mongodb+srv://test:testing123@surround-cluster-srb1q.gcp.mongodb.net/test?retryWrites=true')

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';
var app = express();

app.use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser())
  .use(bodyParser())
  .use(session({ secret: 'keyboard cat' }))
  .use(passport.initialize())
  .use(passport.session())
  // .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))

  // var Hosting = 'gurenmarkv';



const processToMongo = function (accessToken,refreshToken ) {
  console.log("1");
  if (newUser !== undefined && topTracks !== undefined) {
    console.log("2");
    const record = {
      spotifyId: newUser.spotifyId,
      songID: [topTracks[0].id, topTracks[1].id, topTracks[2].id, topTracks[3].id, topTracks[4].id],
      songName: [topTracks[0].name, topTracks[1].name, topTracks[2].name, topTracks[3].name, topTracks[4].name],
    }
    console.log(topTracks[0].id);
    console.log(topTracks[0].name)
    // Add tracks to a playlist

    var spotifyApi = new SpotifyWebApi({
      client_id: client_id,
      client_secret: client_secret,
      redirect_uri: redirect_uri
    })
    console.log("5");
    // Set the access token New-----------------------------------------
    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);
    console.log("4525");
    
    spotifyApi.addTracksToPlaylist('12178079282', '49OLhf99lkcK0zO7F7X9Yp', ["spotify:track:0e7ipj03S05BNilyu5bRzt", "spotify:track:1301WleyT98MSxVHPZCA6M"])
    .then(function(data) {
      console.log('Added tracks to playlist!');
    }, function(err) {
      console.log("ss5");
      console.log('Something went wrong!', err);  //Error - need log
    });

    users.push(record);
    console.log('USERS', users);
    // for (var i = 0; i < 5; i++) {
    //   var tempSongs = users.songs.topTracks[i].id;
    //   console.log(tempSongs);
    // }
  }
}


// function addTracks(users, accessToken, refreshToken) {
//   var spotifyApi = new SpotifyWebApi({
//     client_id: client_id,
//     client_secret: client_secret,
//     redirect_uri: redirect_uri
//   })
//   // Set the access token New-----------------------------------------
//   spotifyApi.setAccessToken(accessToken);
//   spotifyApi.setRefreshToken(refreshToken);

//   spotifyApi.getMyTopTracks()
//       .then(function(data) {
//             topTracks = [data.body.items[0], data.body.items[1], data.body.items[2], data.body.items[3], data.body.items[4]]                
            
//       })
//       .catch(function(err) {
//             console.log('Something went wrong ', err.message);
//       });
// spotify:user:12178079282:playlist:49OLhf99lkcK0zO7F7X9Yp

//   spotifyApi.addTracksToPlaylist(profile.id + '49OLhf99lkcK0zO7F7X9Yp', 'spotify:track:' + data.body.items[0].id, 'spotify:track:' + data.body.items[1].id, 'spotify:track:' + data.body.items[2].id );
//   console.log(spotifyApi.addTracksToPlaylist);
// } console.log("");

console.log("3");
var topTracks;
var newUser;
passport.use(
  new SpotifyStrategy(
    {
      clientID: client_id,
      clientSecret: client_secret,
      callbackURL: redirect_uri
    },
    function(accessToken, refreshToken, expires_in, profile, done) {
      if (accessToken) console.log ("ACCESS TOKEN IS HERE " + accessToken);
      if (refreshToken) console.log("refresh TOken " + refreshToken);
      // console.log(accessToken, profile); //This is to make it cleaner, get rid of all nonsense
      if (expires_in) console.log("YEEEEEET expired time " + expires_in);
      if (profile) console.log("YA WE GOT A PROFILE " + profile.id);
      // mongoose
      console.log("4");
      //New-----------------------------------------
      var spotifyApi = new SpotifyWebApi({
        client_id: client_id,
        client_secret: client_secret,
        redirect_uri: redirect_uri
      })
      console.log("5");
      // Set the access token New-----------------------------------------
      spotifyApi.setAccessToken(accessToken);
      spotifyApi.setRefreshToken(refreshToken);
      //New-----------------------------------------
      spotifyApi.getMyTopTracks()
      .then(function(data) {
        console.log("6");
            topTracks = [data.body.items[0], data.body.items[1], data.body.items[2], data.body.items[3], data.body.items[4]]    
            console.log("7");            
            console.log('TOP SONG FOR ' + profile.id + ' is ' + data.body.items[0].name);
            //processToMongo()
            addTracks(accessToken, refreshToken)
      })
      .catch(function(err) {
            console.log('Something went wrong ', err.message);
      });
      console.log("USER INFO TOP SECRET")
      // sequelize
      // done(null, {name: 'John', id: '123'});
      User.find({spotifyId: profile.id}, (user_found)=>{
        console.log("8");
        // if (spotifyId === Hosting)
        // {
        //   addTracks(topTracks, accessToken, refreshToken);
        // }
        // else {
        //   console.log("No Host Available");
        // }

        if (user_found){
          console.log('user already exists')
          return done(err, profile);
        }
        else {
          newUser = new User ({
            spotifyId: profile.id,
            userToken: accessToken,
            email: profile.email,
            // name1: topTracks[0],
          })
          console.log (" NEW USER CREATED: " + newUser);
          console.log("mongoo");
          newUser.save( function (err){
            if(err) console.log (err)
            else {
              // console.log('user saved')
              return done(err, profile);
            }
            console.log("monoggogo");
            // processToMongo()
            console.log("manago");
          })
        }
        //Here??
      })

      // User.findOrCreate({ spotifyId: profile.id }, function(err, user) {
      //   // return done(err, user);
      //   if(err) console.log("ERROR: " + err)
      //   console.log("USER")
      //   console.log(user)
      // });
    }
  )
);

//////////////////////////////////////////////////////////////////
passport.serializeUser(function(user, done) {
  done(null, user);
});
console.log("99");
passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.get('/login', passport.authenticate('spotify', {
  scope: ['user-read-email', 'user-read-private', 'user-top-read', 'playlist-modify-public', 'playlist-modify-private', 'playlist-read-collaborative', 'playlist-read-private', 'user-follow-modify', 'user-library-modify' , 'user-read-recently-played'],
  showDialog: true

}), 
function(req, res) {

});
console.log("100");
app.get(
  '/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  function(req, res) {
    
    res.redirect('/');
  }
);
console.log("11");
app.get('/users', function (req, res) {
  res.send(users)
})

// console.log('Listening on 80');
// app.listen(PORT)
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
  

function addTracks(accessToken, refreshToken){
      
  console.log('Got here');  //Gets to this point
  
  var spotifyApi = new SpotifyWebApi({
    client_id: client_id,
    client_secret: client_secret,
    redirect_uri: redirect_uri
  });   

  // Set the access token
  spotifyApi.setAccessToken(accessToken);
  spotifyApi.setRefreshToken(refreshToken);
  
  spotifyApi.addTracksToPlaylist('12178079282', '49OLhf99lkcK0zO7F7X9Yp', ["spotify:track:0e7ipj03S05BNilyu5bRzt", "spotify:track:415pd34peNClAFFl5jYwKt"])
    .then(function(data) {

      
      console.log('Tracks added to playlist');

  }, function(err) {
      console.log('Something went wronger ', err.message);
  });

}