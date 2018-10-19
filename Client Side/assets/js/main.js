// Initialize Firebase
var config = {
  /**
   * your config data here
   */
};


firebase.initializeApp(config);


// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();
let checkInInfo; 

// Disable deprecated features
db.settings({
  timestampsInSnapshots: true
});


//watch for any changes in the databse 
db.collection("mifare_checkins")
  .onSnapshot(function (snapshot) {
    //there was a change snapshot is the item that changed, in the inital if we make sure it's not the page that's booting up
    if (snapshot.docChanges().length <= 1) {
      //for each change (which is only 1 )
      snapshot.docChanges().forEach(function (change) {
        //if there was added data to the mifare checkins then we run this code
        if (change.type === "added") {
          //we give the passed trough data to a variable 
          let data = change.doc.data();
          //we place this data also in a variable outside this function, this to get information about the checkin later on
          checkInInfo = data;
          //we go look which user is conected to the mifare id that just checked in
          db.collection("mifares").where("mifareId", "==", `${data.mifareId}`).onSnapshot({
            // Listen for document metadata changes
            includeMetadataChanges: true
          }, (querySnapshot2) => {
            //we get all the data of that document in wich the person and the mifare id are linked
            querySnapshot2.docChanges().forEach(function (change) {
              //we apply the person id to a variable this to make it look less confusing 
              personId = change.doc.data().personId
              //we look in the database persons list wich person just checked in
              db.collection("persons").doc(`${personId}`).get().then(function (doc) {
                //if there is a person
                if (doc.exists) {
                  //we triger an external function and pass the data from the firestore document (name, email, etc.)
                  showOnPage(doc.data())
                } else {
                  // doc.data() will be undefined in this case
                  console.log("No such document!");
                }
              }).catch(function (error) {
                console.log("Error getting document:", error);
              });
            });
          });


        }




        //the same happens if a data entery is modified but this isn't suposed to happen when using raspbery pi to check in people
        if (change.type === "modified") {
          let data = change.doc.data();
          checkInInfo = data;
          db.collection("mifares").where("mifareId", "==", `${data.mifareId}`).onSnapshot({
            // Listen for document metadata changes
            includeMetadataChanges: true
          }, (querySnapshot2) => {
            querySnapshot2.docChanges().forEach(function (change) {
              personId = change.doc.data().personId
              db.collection("persons").doc(`${personId}`).get().then(function (doc) {
                if (doc.exists) {
                  showOnPage(doc.data())
                } else {
                  // doc.data() will be undefined in this case
                  console.log("No such document!");
                }
              }).catch(function (error) {
                console.log("Error getting document:", error);
              });
            });
          });
        }
        //if this happens there is an issue and it should get fixed 
        if (change.type === "removed") {
          console.log("hmmmn something went wrong");
        }

      });
    }

  });


//the external function that puts everything on a webpage
function showOnPage(data) {

  //create a bunch of element variables
  let image = document.getElementById("image")
  let firstName = document.getElementById("firstName")
  let lastName = document.getElementById("lastName")
  let mail = document.getElementById("mail")
  let checkedInTime = document.getElementById("checkedInTime")

  //make a usuable DateTime out of the entery we got from firebase 
  var timeUTC = new Date(checkInInfo.checkedIn.seconds * 1000);

  //creating the day, month etc variables 
  let day = timeUTC.getDay()
  let month = timeUTC.getMonth()
  let year = timeUTC.getFullYear()
  let hour = timeUTC.getHours()
  let min = timeUTC.getMinutes()

  //making sure a 1:2 hour becomes 01:02 
  day = (day < 10 )? `0${day}` : day
  month = (month < 10 )? `0${month}` : month
  hour = (hour < 10 )? `0${hour}` : hour
  min = (min < 10 )? `0${min}` : min

  //placing everything into the front page  
  image.innerHTML = `<img src="https://www.freeiconspng.com/uploads/grab-vector-graphic-person-icon--imagebasket-13.png" alt="person picture" />`
  firstName.innerHTML = `${data.firstName}`
  lastName.innerHTML = `${data.lastName}`
  mail.innerHTML = `${data.emailSchool}`
  checkedInTime.innerHTML = `${day}/${month}/${year}   ${hour}:${min}`

}