let STATES = {
    COMPLETED: 0,
    OUT_OF_TIME: 1,
    GAVE_UP: 2
}
let verge = false;
window.onload = () => {
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

    let timeSpent = getTimeSpent();
    let moves = win.moves;


}