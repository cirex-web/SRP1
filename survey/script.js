let slide = 5;
let moving = false;
let questionNum;
let enteredVals = [];
async function start() {
  $("#" + slide).css("display", "flex");
  $("#" + slide).css("opacity", 0);
  await wait(100);
  $("#" + slide).css("opacity", 1);

  hideLoader();
  $("#mc-choice-container input").click(async function(ev) {
    updateButtonState();

    $("#form-" + slide + " div").removeClass("selected");
    ev.currentTarget.parentNode.classList.add("selected");
    move();
  });
}
async function move() {
  
  await transferSlides(1);
  if(slide==questionNum+1){
    for(let i = 1; i<=questionNum; i++){
      let selected = $("[name=form-choice-"+i+"]:checked");
      let chosenText;
      if(selected.length){
        chosenText = ($("[for="+selected[0].id).text());
      }else{
        chosenText = ($("#text-"+i+"-input [type=\"text\"]").val());
      }
      
      enteredVals.push(chosenText);

    }
    
    
  }
  // if (override||(!moving && maxSlide == slide)) {
  //   transferSlides(1);
  // }
}
function hideLoader() {
  $("#loading").addClass("hidden");
}
function createEverything(data) {
  questionNum = data.length;
  for (let i = 0; i < data.length; i++) {
    let entry = data[i];
    createSlide(entry[1], i + 1);
    console.log(entry[1]);
    if (entry[0] == "MC") {
      let choices = entry[2].split("/");
      for (let j = 0; j < choices.length; j++) {
        addChoice(choices[j], i + 1);
      }
    } else if (entry[0] == "TEXT") {
      addBox(i + 1, entry[2]);
    }
  }
  createEndSlide();
  start();

  //console.log(data);
}
function createEndSlide(){
  let t = document.getElementById("survey-results");
  let c= t.content.cloneNode(true);
  c.getElementById("NUM").id = questionNum+1;
  $("body").append(c);
}
function addBox(i, suffix) {
  let temp = document.getElementById("text");
  let clone = temp.content.cloneNode(true);

  clone.getElementById("inner-text").id = "text-" + i + "-input";
  clone.getElementById("text-text").innerHTML = suffix;
  document.getElementById("form-" + i).appendChild(clone);

  $("#" + "text-" + i + "-input input").on("input", ev => {
    updateButtonState(slide);
  });
  $("#form-" + i).submit(function() {
    if ($("#" + "text-" + i + "-input input").val()) {
      document.querySelector("#ButtonN-" + slide).click();
    }
    return false;
  });
}

function updateButtonState(s = slide, override = false) {
  let num = parseInt($("#" + "text-" + s + "-input input").val());
  if ($("[name=form-choice-" + s + "]:checked").length > 0 || (num>0&&num<=20) ){
    $("#buttonN-" + s).prop("disabled", false);
  } else {
    $("#buttonN-" + s).prop("disabled", true);
  }
}
function createSlide(question, id) {
  let b = $("body")[0];
  let clone = document.getElementById("form").content.cloneNode(true);
  clone.getElementById("NUM").id = id;
  clone.getElementById("form-NUM").id = "form-" + id;
  clone.getElementById("question").innerHTML = question;
  clone.getElementById("buttonB-NUM").id = "buttonB-" + id;
  clone.getElementById("buttonN-NUM").id = "buttonN-" + id;

  b.appendChild(clone);
  //if mc form
  $("#buttonN-" + id).prop("disabled", true);
}
function addChoice(val, slideNum) {
  let i = 0;
  let conVal = val
    .replaceAll(" ", "")
    .replaceAll("'", "")
    .replaceAll("(", "")
    .replaceAll(")", "");
  while ($("#" + conVal + "-" + i).length > 0) {
    i++;
  }
  let id = conVal + "-" + i;
  let temp = document.getElementById("mc");
  let clone = temp.content.cloneNode(true);
  clone.children[0].getElementsByTagName("input")[0].name =
    "form-choice-" + slideNum;
  clone.children[0].getElementsByTagName("input")[0].id = id;
  clone.children[0].getElementsByTagName("label")[0].innerHTML = val;
  clone.children[0].getElementsByTagName("label")[0].htmlFor = id;
  document.getElementById("form-" + slideNum).appendChild(clone);
}

function transferSlides(moveAmount) {
  return new Promise(re => {
    $("#" + slide).css("opacity", 0);
    $("#buttonB-" + slide).prop("disabled", true);
    $("#buttonN-" + slide).prop("disabled", true);
    $("#" + slide).css({ pointerEvents: "none" });

    moving = true;
    setTimeout(async () => {
      $("#" + slide).css("display", "none");

      $("#buttonB-" + slide).prop("disabled", false);
      $("#" + slide).css({ pointerEvents: "all" });
      updateButtonState(slide);
      re();
      moving = false;
      slide += moveAmount;

      $("#" + slide).css("display", "flex");
      $("#" + slide).css("opacity", 0);
      await wait(100);
      $("#" + slide).css("opacity", 1);
    }, 300);
  });
}

function back() {
  transferSlides(-1);
}
function wait(m) {
  return new Promise(r => setTimeout(r, m));
}
