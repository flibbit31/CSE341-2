//set up google authentication

const { google } = require("googleapis");

const oAuthClient = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL);

const scopes = ["https://www.googleapis.com/auth/userinfo.profile"];

const authURL = oAuthClient.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    include_granted_scopes: true
});

//console.log(authURL);

module.exports = { oAuthClient, authURL };