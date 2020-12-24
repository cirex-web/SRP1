
let resources = {
  provider: undefined,
  storageRef: undefined,
  firestore: undefined,
  user: undefined,
}
let local = {
  questions: [],
  finished: false,
  str: "",
  level: [],
  hasConsentForm: false,
  pos: 0
}
let config = {
  vars: ["PERCENT", "OUTCOME"]
}
function run() {
  updateLocalVar(true);

  resources.provider = new firebase.auth.GoogleAuthProvider();
  resources.storageRef = firebase.storage().ref();
  resources.firestore = firebase.firestore();

  $("#signIn").click(signIn);
  $("#signUp").click(signIn);
  $("#signOut").click(signOut);
  $("#start").click(beginExperiment);

  firebase.auth().onAuthStateChanged(async function (user) {
    resources.user = user;
    if (user) {

      let requests = [getUserData(user.uid), getQuestions(), fetchDocument()];
      Promise.all(requests).then(() => {
        if(local.finished){
          reload();
        }else{
          goToSlide(local.hasConsentForm ? 2 : 1, 0);
          localStorage.setObj('local', local);
          
        }
     });
    } else {
      goToSlide(0, 0);
    }
  });
}
function finishExperiment() {

  uploadUserData(resources.user.uid, localStorage.getObj("user")).then(() => {
    localStorage.removeItem("user");
    reload();
  });
}
function uploadUserData(uid, data) {
  console.log("uploaded: "+data);
  const personRef = resources.firestore.collection("users").doc(uid);
  return personRef.set({
    data: data
  }, {
    merge: true
  });
}
function reload() {
  updateLocalVar();
  console.log("finished: "+local.finished);
  if(local.finished){
    if($("object").length>0){
      console.log("here");
      $("body").html("");
      location = location;
    }else{
      goToSlide(3);
    }
    
  }else{
    $("body").html('<object data="/survey/index.html"/>');

  }
}
async function getUserData(uid) {
  return new Promise(async (re) => {
    let doc = await resources.firestore.collection("users").doc(uid).get();
    if (doc.exists && doc.data().data) {
      local.finished = true;
    } else if (doc.exists) {
      local.level = doc.data().level.split(" ");
      local.finished = false;
      console.log("Obtained level");
    } else {
      await resources.firestore.collection("users").doc(uid).set({
        level: generateLevel()
      });
      await getUserData(uid);
    }

    await generateVarString();
    re();
  });

}
function updateLocalVar(select=false){
  if (localStorage.getObj("local") != null) {
    if(select){
      local.pos = localStorage.getObj("local").pos;
    }else{
      local = localStorage.getObj("local");

    }
  }
}
function generateVarString() {
  return new Promise((re) => {
    let ref = resources.firestore.collection("questions");

    ref.doc("vars").get().then((doc) => {
      let d = doc.data();
      if (local.str[0] == -1) {
        local.str = d.control;
      } else {
        local.str = d.default;
        config.vars.forEach((el, i) => {
          local.str = local.str.replace("[" + el + "]", d[el][parseInt(local.level[i])]);
        });

      }
      console.log(local.str);
      re();
    });
  });

}
function generateLevel() {
  let i = parseInt(Math.random() * 3) - 1;
  let j = parseInt(Math.random() * 2);
  return i + " " + j;
}
function goToSlide(num, delay = 400) {
  $(".container").css("opacity", 0);
  setTimeout(() => {
    $(".container").css("display", "none");
    $("#" + num).css("display", "block");
    setTimeout(() => {
      $("#" + num).css("opacity", 1)
    }, 100);

  }, delay);
}
function fetchDocument() {
  return new Promise(re => {
    resources.storageRef.child(resources.user.uid + "/").listAll().then(function (res) {
      if (res.items.length) {
        local.hasConsentForm = true;
      } else {
        local.hasConsentForm = false;
      }
      re();
    });
  });

}
function signIn() {
  firebase.auth().signInWithRedirect(resources.provider);
}
function signOut() {
  firebase.auth().signOut().then(function () {
    window.localStorage.clear();
  });
}
function getQuestions() {
  return new Promise((re) => {
    let ref = resources.firestore.collection("questions");

    ref.doc("all").get().then((doc) => {
      let data = doc.data();
      local.questions = data;
      re();
    })

  });
}
function addQuestion(arrayName, question, type, options) {
  let ref = resources.firestore.collection("questions").doc("all");
  let data = {
    question: question,
    type: type,
    options: options
  }
  ref.update({
    [arrayName]: firebase.firestore.FieldValue.arrayUnion(data)
  }).then(() => {
    console.log("asd");
  }).catch((e) => {
    console.log(e);
  });
}
function beginExperiment() {
  reload();
}









function dragOverHandler(ev) {
  $("#drop_zone").css("border", "3px solid rgba(3, 155, 229, 1)");
  ev.preventDefault();

}
function dragLeaveHandler(ev) {
  $("#drop_zone").css("border", "3px solid black");
  ev.preventDefault();
}

function dropHandler(ev) {
  $("#drop_zone").css("border", "3px solid black");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
  handleFiles(ev.dataTransfer.files);
}
async function handleFiles(files) {
  const dT = new DataTransfer();
  dT.items.add(files[0]);
  let type = files[0].type;
  //.pdf,image/*
  if (type.split('.').pop() == "pdf" || type.split('/')[0] == "image" || type.split('/').pop() == "pdf") {
    document.getElementById("submit-file").files = dT.files;
    processFileInput(document.getElementById("submit-file"));
  } else {

    $("#drop_zone").css("border", "3px solid red");
    $("#error").html("File type " + type + " not supported. If you think this is an error, try manually uploading your file");
    await wait(1000);
    $("#drop_zone").css("border", "3px solid black");
  }

}

async function processFileInput(e) {
  let file = e.files[0];
  if (file) {
    let ref = firebase.storage().ref(id + "/" + "form");

    let task = ref.put(file);
    $("progress").css("height", "0");
    $("#submit-file").css("width", "50%");
    $();
    await wait(50);
    $("progress").css("height", "30px");
    await wait(200);
    task.on(
      "state_changed",
      s => {
        $("#upload-stat").val((s.bytesTransferred / s.totalBytes) * 100);
      },
      e => {
        $("#error").html(e);
      },
      async () => {
        showSlide(2);
        await wait(500);
        $("#submit-file").css("width", "180px");
        $("progress").css("height", "0");
        $("#upload-stat").val(0);
      }
    );
  }
}