// window.localStorage.setItem('name', 'Obaseki Nosa');

let resources = {
    provider: undefined,
    storageRef: undefined,
    firestore: undefined,
    user: undefined,
}
let local = {
    startQuestions: [],
    endQuestions: []
}
function run(){
    
    
    resources.provider = new firebase.auth.GoogleAuthProvider();
    resources.storageRef = firebase.storage().ref();
    resources.firestore = firebase.firestore();

    $("#signIn").click(signIn);
    $("#signUp").click(signIn);
    $("#signOut").click(signOut);
    $("#start").click(beginExperiment);

    firebase.auth().onAuthStateChanged(function(user) {

        resources.user = user;
        if (user) {
            getQuestions();
            fetchDocument();
        } else {
            goToSlide(0,0);
        }
      });
}
function goToSlide(num, delay = 400){
    $(".container").css("opacity",0);
    setTimeout(()=>{
        $(".container").css("display","none");
        $("#"+num).css("display","block");
        setTimeout(()=>{
            $("#"+num).css("opacity",1)
        },100);
        
    },delay);
}
function fetchDocument(){
    resources.storageRef.child(resources.user.uid + "/").listAll().then(function (res) {
    if (res.items.length) {
        goToSlide(2,0);
    } else {
        goToSlide(1,0);
    }
  });
}
function signIn(){
    firebase.auth().signInWithRedirect(resources.provider);
}
function signOut(){
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
      })
}
function getQuestions(){
    return new Promise((re)=>{
        let ref = resources.firestore.collection("questions");
        ref.doc("initial").get().then((doc)=>{
            if (doc.exists) {
                let data = doc.data()
                for(el in data){
                    console.log(data[el]);
                }
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        })
    });
}
function addQuestion(arrayName, question, type, options){
    let ref = resources.firestore.collection("questions").doc("all");
    let data = {
        question: question,
        type: type,
        options: options
    }
    ref.update({
        [arrayName]: firebase.firestore.FieldValue.arrayUnion(data)
    }).then(()=>{
        console.log("asd");
    }).catch((e)=>{
        console.log(e);
    });
}
function beginExperiment(){
    $("body").html('<object data="/survey/index.html"/>');
    // $("body").load("/survey/index.html");
    // window.location.href = "/survey/index.html"; //change to replace when deployed 
}









function dragOverHandler(ev){
    $("#drop_zone").css("border","3px solid rgba(3, 155, 229, 1)");
    ev.preventDefault();
  
  }
  function dragLeaveHandler(ev){
    $("#drop_zone").css("border","3px solid black");
    ev.preventDefault();
  }
  
  function dropHandler(ev) {
    $("#drop_zone").css("border","3px solid black");
  
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    handleFiles(ev.dataTransfer.files);
  }
  async function handleFiles(files){
    const dT = new DataTransfer();
    dT.items.add(files[0]);
    let type = files[0].type;
    //.pdf,image/*
    if(type.split('.').pop()=="pdf"||type.split('/')[0]=="image"||type.split('/').pop()=="pdf"){
      document.getElementById("submit-file").files = dT.files;
      processFileInput(document.getElementById("submit-file"));
    }else{
      
      $("#drop_zone").css("border","3px solid red");
      $("#error").html("File type "+type+" not supported. If you think this is an error, try manually uploading your file");
      await wait(1000);
      $("#drop_zone").css("border","3px solid black");
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