// // Get an artist's top tracks
// spotifyApi.getArtistTopTracks('0oSGxfWSnnOXhD2fKuz2Gy', 'GB')
//   .then(function(data) {
//     console.log(data.body);
//     }, function(err) {
//     console.log('Something went wrong!', err);
//   });


// // Get a user
// spotifyApi.getUser('petteralexis')
//   .then(function(data) {
//     console.log('Some information about this user', data.body);
//   }, function(err) {
//     console.log('Something went wrong!', err);
//   });

// /* Get followed artists */
// spotifyApi.getFollowedArtists({ limit : 1 })
//   .then(function(data) {
//     // 'This user is following 1051 artists!'
//     console.log('This user is following ', data.body.artists.total, ' artists!');
//   }, function(err) {
//     console.log('Something went wrong!', err);
//   });



// /* Tracks */

// // Get tracks in the signed in user's Your Music library
// spotifyApi.getMySavedTracks({
//     limit : 2,
//     offset: 1
//   })
//   .then(function(data) {
//     console.log('Done!');
//   }, function(err) {
//     console.log('Something went wrong!', err);
//   });





// // Add tracks to the signed in user's Your Music library
// spotifyApi.addToMySavedTracks(["3VNWq8rTnQG6fM1eldSpZ0"])
//   .then(function(data) {
//     console.log('Added track!');
//   }, function(err) {
//     console.log('Something went wrong!', err);
//   });
// });



//   // Retrieve new releases
// spotifyApi.getNewReleases({ limit : 5, offset: 0, country: 'SE' })
//   .then(function(data) {
//     console.log(data.body);
//       done();
//     }, function(err) {
//        console.log("Something went wrong!", err);
//     });
//   });


// curl -X "GET" "https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=10&offset=0" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer BQAkYkV8bHSjK6EsdFZ7nyGhND0vXVFwMgEQxEU2lz5tHoAPHSYf8IeAej01uKTgWoolIMYCKwMgZn_rEUr26kywCP6ue8oZT66nG4NfoSYkDEjxc4GDPB0F4G52uKIYlzu7B05tcge2K4I7o271bGY"

// curl -X "GET" "https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=10&offset=0" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer" + "BQAkYkV8bHSjK6EsdFZ7nyGhND0vXVFwMgEQxEU2lz5tHoAPHSYf8IeAej01uKTgWoolIMYCKwMgZn_rEUr26kywCP6ue8oZT66nG4NfoSYkDEjxc4GDPB0F4G52uKIYlzu7B05tcge2K4I7o271bGY"

// curl -X "GET" "https://api.spotify.com/v1/users/" + "user_id" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer BQAkYkV8bHSjK6EsdFZ7nyGhND0vXVFwMgEQxEU2lz5tHoAPHSYf8IeAej01uKTgWoolIMYCKwMgZn_rEUr26kywCP6ue8oZT66nG4NfoSYkDEjxc4GDPB0F4G52uKIYlzu7B05tcge2K4I7o271bGY"


/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var SpotifyWebApi = require('spotify-web-api-node');

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = '3a997abe41e0424a9e695eaba828b0c5'; // Your client id
var client_secret = 'dc0c57ad59db447c99e257589f1b7e2d'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

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
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-top-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log('test 0.5');
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
        
        getUserData(access_token, refresh_token);

      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

console.log('Listening on 8888');
app.listen(8888);

function getUserData(access_token, refresh_token) {

    var spotifyApi = new SpotifyWebApi({
      clientId: '3a997abe41e0424a9e695eaba828b0c5',
      clientSecret: 'dc0c57ad59db447c99e257589f1b7e2d',
      redirectUri: 'http://localhost:8888/callback'
    });   
 
    // Set the access token
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);
    
    return spotifyApi.getMyTopTracks()
        .then(function(data) {
        
        var topTracks = [data.body.items[0].id, data.body.items[1].id, data.body.items[2].id, data.body.items[3].id, data.body.items[4].id]                
        console.log(data.body.items[0].name);
      })
      .catch(function(err) {
            console.log('Something went wrong ', err.message);
      });
}