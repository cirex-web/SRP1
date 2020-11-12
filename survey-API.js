//
var CLIENT_ID =
  "466507230299-6pdb8p8dlqt7bt29kq27r5rad7s9ginu.apps.googleusercontent.com";
var API_KEY = "AIzaSyD9piW3OuD1gPwUsgkR7Q9AH1jawlf8yq4";
var DISCOVERY_DOCS = [
  "https://sheets.googleapis.com/$discovery/rest?version=v4"
];
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";
//https://www.googleapis.com/auth/spreadsheets.readonly
/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    })
    .then(
      function() {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        getQuestions();
      },
      function(e) {
        console.log(e);
      }
    );
}
function getQuestions() {
  gapi.client.sheets.spreadsheets.values
    .get({
      spreadsheetId: "17BsJMVpO4Pkg8yc66X1FZxhXGwMbAvmyz2Nzde_vk5s",
      range: "Questions!A2:C99"
    })
    .then(
      function(response) {
        createEverything(response.result.values);
      },
      function(response) {
        console.log("Error: " + response.result.error.message);
      }
    );
}
function updateSigninStatus(isSignedIn) {
  if (isSignedIn && slide == 0) {
    move();
  } else if (!isSignedIn) {
    //TODO have the sign in screen reappear
  }
}

function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}
