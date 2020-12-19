let STATES = {
    COMPLETED: 0,
    OUT_OF_TIME: 1,
    GAVE_UP: 2
}
let verge = false;

function importParentStyles() { //from stackoverflow 
    var parentStyleSheets = parent.document.styleSheets;
    var cssString = "";
    for (var i = 0, count = parentStyleSheets.length; i < count; ++i) {
        if (parentStyleSheets[i].cssRules) {
            var cssRules = parentStyleSheets[i].cssRules;
            for (var j = 0, countJ = cssRules.length; j < countJ; ++j)
                cssString += cssRules[j].cssText;
        }
        else
            cssString += parentStyleSheets[i].cssText; 
    }
    var style = document.createElement("style");
    style.type = "text/css";
    try {
        style.innerHTML = cssString;
    }
    catch (ex) {
        style.styleSheet.cssText = cssString; 
    }
    document.getElementsByTagName("head")[0].appendChild(style);
}
window.onload = () => {

    importParentStyles();
    start();
    $("#scramble").show();
    $("#scramble").click(()=>{
        if(win.movable==true){
            if(!verge){
                verge = true;
                $("#scramble-2").show();
                $("#notice-text").show();
                $("#scramble-2").html("Yes");
                $("#scramble").html("No");
                $("#notice-text").html("Are you sure?");

            }else{
                $("#scramble-2").hide();
                $("#notice-text").hide();
                $("#scramble").html("Give up");
                verge = false;
            }
            
        }else{
            $("#scramble").html("Give up");
            $("#scramble").prop("disabled","disabled");
            win.movable = true;
            scrambleCube();
        }
    })
    $("#scramble-2").click(()=>{
        endGame(STATES.GAVE_UP);
    })
}

function endGame(state){ //time in seconds
    //maybe also include total moves 
    clearInterval(win.loopID);
    win.movable = false; //stops player movement
    $("#scramble").prop("disabled","disabled");
    $("#scramble-2").prop("disabled","disabled");

    parent.end({
        time: getTimeSpent(),
        moves: win.moves,
        endState: state
    });


}