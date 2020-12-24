let slide = 0;
let moving = false;
let slidesBefore = 0;
let localData = {};
let startOffset = 0;
let consts = {
  START: 0,
  PUZZLE: 1,
  END: 2,
  DONE: 3,
  START_QUESTIONS: -1,
  END_QUESTIONS: 3
};
let user = {

  [consts.START]: [],
  [consts.PUZZLE]: {},
  [consts.END]: []
};
async function start() {
  window.onbeforeunload = function () {
    return true;
  };
  
  localData = localStorage.getObj("local");
  if (!localData.pos) {
    localData.pos = consts.START;
    localStorage.setObj("local", localData);
  }
  if (localStorage.getObj("user") != null) {
    user = localStorage.getObj("user");
  }

  if (localData.pos == consts.START) {
    initStartQuestions();
  } else if (localData.pos == consts.END) {
    initEndQuestions();
  } else {
    startPuzzle();
  }

  $("#" + slide).css("display", "block");
  $("#" + slide).css("opacity", 0);
  await wait(100);
  $("#" + slide).css("opacity", 1);

  hideLoader();
  $("#mc-choice-container input").click(async function (ev) {
    updateButtonState();

    $("#form-" + slide + " div").removeClass("selected");
    ev.currentTarget.parentNode.classList.add("selected");
    move();
  });
}
function move() {
  transferSlides(1);
}
function initStartQuestions() {
  startOffset = 1;
  loadTemplate("start", 0);

  createEverything(localData.questions[consts.START_QUESTIONS]);
}

function initEndQuestions() {
  startOffset = 0;
  if(user[consts.PUZZLE].endState==undefined){
    localStorage.clear();
    window.reload();
  }
  console.log(localData.questions[user[consts.PUZZLE].endState]);
  let allQuestions = [...localData.questions[user[consts.PUZZLE].endState]];
  for (let q of localData.questions[consts.END_QUESTIONS]) {
    allQuestions.push(q);
  }
  createEverything(allQuestions);
}
function getEnteredData() {
  let vals = [];
  for (let i = startOffset; i < slidesBefore; i++) {
    let selected = $("[name=form-choice-" + i + "]:checked");
    let chosenText;
    if (selected.length) {
      chosenText = ($("[for=" + selected[0].id).text());
    } else {
      chosenText = ($("#text-" + i + "-input [type=\"text\"]").val());
    }

    vals.push(chosenText);
  }
  return vals;
}
function hideLoader() {
  $("#loading").addClass("hidden");
}
function createEverything(data) {
  slidesBefore += data.length + startOffset;
  for (let i = startOffset; i < data.length + startOffset; i++) {
    let entry = data[i - startOffset];

    createSlide(entry.question, i);
    if (entry.type == "MC") {
      let choices = entry.options.split("/");
      for (let j = 0; j < choices.length; j++) {
        addChoice(choices[j], i);
      }
    } else if (entry.type == "TEXT") {
      addBox(i, entry.options);
    } else {

      updateButtonState(i); // Not expecting user response
    }
    if (i == startOffset) {
      $("#buttonB-" + i).css("display", "none");
    }

  }
  createEndSlide(localData.pos);
}
function createEndSlide(pos) {
  let id = "";
  console.log("Position: " + pos);
  if (pos == consts.START) {
    id = "survey-results";
  } else {
    id = "fin";
  }
  let c = document.getElementById(id).content.cloneNode(true);
  c.getElementById("NUM").id = slidesBefore;
  $("body").append(c);
}
function addBox(i, suffix) {
  let temp = document.getElementById("text");
  let clone = temp.content.cloneNode(true);

  clone.querySelector(".text-input-container").id = "text-" + i + "-input";
  clone.querySelector(".text-input-label").innerHTML = suffix;
  document.getElementById("form-" + i).appendChild(clone);

  $("#" + "text-" + i + "-input input").on("input", ev => {
    updateButtonState(slide);
  });
  $("#form-" + i).submit(function () {
    if ($("#" + "text-" + i + "-input input").val()) {
      document.querySelector("#ButtonN-" + slide).click();
    }
    return false;
  });
}

function updateButtonState(s = slide) {
  let num = parseInt($("#" + "text-" + s + "-input input").val());

  if ($("[name=form-choice-" + s + "]:checked").length > 0 || (num > 0 && num <= 20)
    || ($("[name=form-choice-" + s + "]").length == 0 && isNaN(num))) {
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
function showPuzzle() {
  setTimeout(() => {
    $("iframe").css("opacity", 1);

  }, 1);

}
function transferSlides(moveAmount) {
  return new Promise(re => {
    $("#" + slide).css("opacity", 0);
    $("#buttonB-" + slide).prop("disabled", true);
    $("#buttonN-" + slide).prop("disabled", true);
    $("#" + slide).css({ pointerEvents: "none" });

    if (slide + moveAmount == slidesBefore) {
      if (localData.pos == consts.START) {
        setTimeout(() => {

          $("#" + (slidesBefore)).css("opacity", 0);

          setTimeout(() => {
            displayStat();
          }, 500);
        }, 1000 + Math.random() * 1000);
      } else if (localData.pos == consts.END) {
        user[consts.END] = getEnteredData();
        localData.pos = consts.DONE;
        localData.finished = true;
        updateAndRefresh();

      }

    }

    moving = true;
    setTimeout(async () => {
      $("#" + slide).css("display", "none");

      $("#buttonB-" + slide).prop("disabled", false);
      $("#" + slide).css({ pointerEvents: "all" });
      updateButtonState(slide);
      re();
      moving = false;
      slide += moveAmount;

      $("#" + slide).css("display", "block");
      $("#" + slide).css("opacity", 0);
      await wait(100);
      $("#" + slide).css("opacity", 1);
    }, 300);
  });
}
async function displayStat() {

  $("#" + (slidesBefore)).html("");
  let temp = document.getElementById("just-text");
  let clone = temp.content.cloneNode(true);

  clone.getElementById("stat").innerHTML = localData.str;
  $("#" + (slidesBefore)).append(clone);
  $("#" + (slidesBefore)).css("opacity", 1);

  setTimeout(() => {
    $(".info").css("max-height", "150px");
    $(".info").css("opacity", "1");

    setTimeout(() => {
      $("#buttonN-puzzle").html("Let's go!");
      $("#buttonN-puzzle").prop("disabled", "");
    }, 1000);

  }, 1500);
}
function startPuzzle() {
  if (localData.pos == consts.START) {
    user[consts.START] = getEnteredData();
    localData.pos = consts.PUZZLE;
    updateAndRefresh();

  } else {
    loadTemplate("puzzle", 0);
  }

}
function updateAndRefresh() {
  console.log("updating and refreshing");
  updateStorage("local",localData);
  updateStorage("user",user);
  if (localData.pos == consts.DONE) {//TODO: Change back to DONE
    localData.pos = consts.START;
    updateStorage("local",localData);
    parent.finishExperiment();
  } else {
    parent.reload();
  }

}
function updateStorage(name, data){
  localStorage.setObj(name, data);

}
function loadTemplate(id, num) {
  $("body").append($("#" + id).html());
  $("#NUM")[0].id = num;

}
function back() {
  transferSlides(-1);
}
function wait(m) {
  return new Promise(r => setTimeout(r, m));
}
function endGame(data) { 
  user[consts.PUZZLE] = data;
  localData.pos = consts.END;
  updateAndRefresh();
}

//TODO: Convert document.whatever to jquery cuz cool