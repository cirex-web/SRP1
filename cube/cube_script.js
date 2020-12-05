let win = {
  margin: 0,
  size: 4,
  h: 500,
  w: 500, //includes margin but not padding >:D 
  padding: 10,
  slidingTime: 0.13,
  movable: false,
  startTime: undefined,
  curTime: undefined,
  timeLimit: 1200,
  loopID: undefined,
  moves: 0
};
let box = {
  width: 0,
  height: 0,
  thick: win.margin * 2
};
let con;
let canvas;
let mouseInside;
let held = false;
let prevBox = undefined;
let grid = [...Array(win.size)].map(x => []); //TODO figure out what this is

function start() {
  canvas = document.getElementById("c");
  con = canvas.getContext("2d");

  canvas.width = win.w + win.padding * 2;
  canvas.height = win.h + win.padding * 2;
  box.width = (win.w - 2 * win.margin) / win.size;
  box.height = (win.h - 2 * win.margin) / win.size;
  con.textAlign = "center";
  con.textBaseline = "middle";

  document.getElementById("c").onmouseout = ev => {
    mouseInside = false;
    prevBox = [-1, -1]; //invalid prevBox
  };
  canvas.addEventListener("mousemove", function (ev) {
    //ev.which
    if (ev.which) {
      let pos = getMousePos(ev);
      if ((mouseInside || inBounds(prevBox)) && held && !equals(prevBox, pos)) {
        //console.log(inBounds(prevBox)+" "+prevBox+" "+pos);
        transformGrid(
          pos[0] - prevBox[0],
          pos[1] - prevBox[1],
          inBounds(prevBox) ? prevBox : pos
        );
      } else {
        held = true;
      }
      prevBox = pos;
    } else {
      held = false;
    }
  });
  updateClock(win.timeLimit);
  setUp();
};
function inBounds(el) {
  return el[0] < win.size && el[0] >= 0 && el[1] < win.size && el[1] >= 0;
}
function equals(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] != b[i]) {
      return false;
    }
  }
  return true;
}
function getMousePos(ev) {
  let c = parseInt((ev.offsetX - win.margin - win.padding) / box.width);
  let r = parseInt((ev.offsetY - win.margin - win.padding) / box.height);
  if (ev.offsetX - win.margin - win.padding < 0) {
    mouseInside = false; // this will be inbounds had the coniditional been removed.
    c = -1;
  } else if (ev.offsetY - win.margin - win.padding < 0) {
    mouseInside = false;
    r = -1;
  } else if (inBounds([r, c])) {
    mouseInside = true;
  } else {
    mouseInside = false;
  }

  return [r, c];
  //ok it's offsetX and offSetYyyy
  //yay
}
function loop() {
  con.strokeStyle = "black";
  con.font = "70px Arial";
  con.lineWidth = box.thick;

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid.length; c++) {
      let block = grid[r][c];
      for (let i = 0; i < block[1].length; i++) {
        let x = block[1][i][0];
        let y = block[1][i][1];

        con.fillStyle = block[0][1];
        //console.log(block[1]);
        con.fillRect(x, y, box.width, box.height);
        // con.strokeRect(x, y, box.width, box.height);
        con.fillStyle = "black";

        con.fillText(block[0][0], x + box.width / 2, y + box.height / 2);
      }
    }
  }
  con.fillStyle = "black";
  con.lineWidth = win.padding * 2;
  con.beginPath();
  con.moveTo(0, 0);
  con.lineTo(win.w + 2 * win.padding, 0);
  con.lineTo(win.w + 2 * win.padding, win.h + 2 * win.padding);
  con.lineTo(0, win.h + 2 * win.padding);
  con.lineTo(0, 0);
  con.stroke();
  con.closePath();
  // con.fillRect(0, 0, win.w + 2 * win.padding, win.h + 2 * win.padding);

  window.requestAnimationFrame(loop);
}
function snapToGrid() {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid.length; c++) {
      let pos = co(c, r);
      grid[r][c][1] = [pos];
    }
  }
}
function getTimeSpent() {
  return parseInt((Date.now() - win.startTime.getTime()) / 1000);
}
function updateClock(dif = (win.timeLimit - getTimeSpent())) {

  let ogDif = dif;
  let sec = "00" + (dif % 60);
  dif = parseInt(dif / 60);
  let min = "00" + (dif % 60);
  dif = parseInt(dif / 60);

  let time = (dif == 0 ? "" : dif + ":") + min.slice(-2) + ":" + sec.slice(-2);
  if (win.curTime != time) {
    win.curTime = time;
    if (ogDif < 0 && win.movable) {
      endGame(STATES.OUT_OF_TIME);
    } else {
      $("#clock").html(time);
    }
  }
}
function checkIfSolved() {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid.length; c++) {
      if (grid[r][c][0][0] != r * grid.length + c + 1) {
        return false;
      }
    }
  }
  return true;
}
async function transformGrid(row, column, box, scramble = false) {
  if (!win.movable) return;
  if (!scramble) {
    win.moves++;
    $("#moves").html("Moves: " + win.moves);


    if (!win.startTime) {
      win.startTime = new Date();
      $("#scramble").prop("disabled", "");
      await wait(10); //there's a weird glitch where startTime is undefined sometimes
      //start the clock!
      win.loopID = setInterval(updateClock, 2);
    }
  }

  snapToGrid();
  let r = box[0];
  let c = box[1];
  // console.log(row,column);
  //row and column are the transformations
  //r and c are actual coords
  //console.log(row + " " + column);
  if (row != 0 && column != 0) {
    transformGrid(row, 0, box, true);
    transformGrid(0, column, box);
  } else {
    let start = [...grid[r][c]];
    for (let i = 0; i < win.size; i++) {
      let r1 = r;
      let c1 = c;
      r -= row;
      c -= column;
      r = (r + win.size) % win.size;
      c = (c + win.size) % win.size;

      //transition current block coords from previous block to this block.

      let newPos = grid[r1][c1][1][0];

      grid[r1][c1][0] = [...grid[r][c][0]];
      grid[r1][c1][1] = [[...grid[r][c][1][0]]];

      if (i == win.size - 1) {
        //make start pos the start
        grid[r1][c1][1] = [start[1][0]];

        grid[r1][c1][0] = start[0];
      }
      // let edge = win.margin + win.padding;
      if (r1 - r != row || c1 - c != column) {
        grid[r1][c1][1].push(co(c1 - column, r1 - row));
        transition(r1, c1, co(c1, r1), 1);
        newPos = co(c + column, r + row);
      }
      //console.log("moving " + grid[r1][c1][1][0] + " to " + newPos);
      transition(r1, c1, newPos);
      //r1 c1 is the ahead
      // gsap.to(grid[r1][])
      //grid[r1][c1] = [...grid[r][c]];
    }
    if (!scramble && checkIfSolved()) {
      //gg you win
      endGame(STATES.COMPLETED);
    }
  }
}
function co(c, r) {
  return [
    c * box.width + win.margin + win.padding,
    r * box.height + win.margin + win.padding
  ];
}
function transition(r, c, newPos, i = 0) {
  for (let j = 0; j < newPos.length; j++) {
    gsap.to(grid[r][c][1][i], {
      [j]: newPos[j],
      duration: win.slidingTime
    });
  }
}
function print() {
  for (let i = 0; i < grid.length; i++) {
    let str = "";
    for (let j = 0; j < grid.length; j++) {
      str += grid[i][j][1][0] + " ";
    }
    console.log(str);
  }
}
async function setUp() {
  let grad = con.createLinearGradient(
    win.margin,
    win.margin,
    win.w - win.margin,
    win.h - win.margin
  );
  grad.addColorStop(0, "aliceblue");
  grad.addColorStop(1, "red");

  con.fillStyle = grad;
  con.fillRect(
    win.margin + win.padding,
    win.margin + win.padding,
    win.w - 2 * win.margin,
    win.h - 2 * win.margin
  );
  let i = 1;
  for (let row = 0; row < grid.length; row++) {
    for (let c = 0; c < grid.length; c++) {
      let pos = co(c, row);
      let cap = con.getImageData(pos[0], pos[1], box.width, box.height);
      let r = 0;
      let b = 0;
      let g = 0;
      let l = cap.data.length;
      for (let i = 0; i < l; i++) {
        switch (i % 4) {
          case 0:
            r += cap.data[i];
            break;
          case 1:
            b += cap.data[i];
            break;
          case 2:
            g += cap.data[i];
            break;
        }
      }
      l /= 4;
      r /= l;
      b /= l;
      g /= l;
      grid[row].push([[i, "rgb(" + r + "," + g + "," + b + ")"], [pos]]);
      i++;
    }
  }
  loop();

}

function rand(n, noZero = false) {
  let re = parseInt(Math.random() * n);
  if (noZero && re == 1) {
    re++;
  }
  return re;
}
function wait(m) {
  return new Promise((re) => {
    setTimeout(re, m);
  })
}
function scrambleCube() {
  for (let i = 0; i < 100; i++) {
    let num = rand(3) - 1;
    transformGrid(num, num == 0 ? (rand(3, true) - 1) : 0, [rand(win.size), rand(win.size)], true);
  }
}