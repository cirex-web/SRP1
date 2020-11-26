window.onload = () => {
    start();
    $("#scramble").click(()=>{
        if(win.movable==true){
            giveUp();
        }else{
            $("#scramble").html("Give up");
            win.movable = true;
            scrambleCube();
        }
    })
}

function giveUp(){
    //TODO: are you sure you want to give up?
    console.log("user has given up");
}