

let square = {
  mouse:false,
  x:10,
  y:10,
  width:100
}

window.onload = () => {
  const canvas = document.getElementById("c");
  const c = canvas.getContext("2d");

  const h = 600;
  const w = 600;
    var gradient = c.createLinearGradient(0,0,w,h);
  gradient.addColorStop(0,"blue");
  gradient.addColorStop(1,"red");

  canvas.width = w;
  canvas.height = h;
  canvas.addEventListener(
    "mousemove",
    function(ev) {
      if(ev.which&&(square.mouse||isInsideBounds(ev,square))){
        square.mouse = true;
              c.fillStyle = "white";
      
      
      square.x+=ev.movementX;
      square.y+=ev.movementY;
      window.requestAnimationFrame(update);
      }else{
        square.mouse = false;
      }

    },
    false
  );
  
  setUp();
  
  function isInsideBounds(ev, sq){
    let xDist = ev.offsetX-sq.x;
    let yDist = ev.offsetY-sq.y;
    return (xDist>=0&&xDist<=sq.width&&yDist>=0&&yDist<=sq.width);
  }

  function drawRect() {
    c.fillStyle = gradient;

    let width = square.width;
    c.fillRect(square.x, square.y, width, width);
  }
  
  function update(){
        c.fillStyle = "rgb(0,0,0,0.1)";
    c.fillRect(0, 0, w, h);
      drawBorder();
      drawRect();
  }
  
  function drawBorder() {
    c.beginPath();
    c.lineWidth = 10;
    c.fillStyle = "red";
    let coords = [[0, 0], [w, 0], [w, h], [0, h], [0, 0]];
    c.moveTo(0, 0);
    for (let i = 0; i < coords.length; i++) {
      c.lineTo(coords[i][0], coords[i][1]);
    }
    c.stroke();
  }
  
  function setUp(){
    c.fillStyle = "(0,0,0,0.1)";
    c.fillRect(0, 0, w, h);
    drawRect();
    drawBorder();
  }
};
