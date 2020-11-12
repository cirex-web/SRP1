let win = {
  margin: 2,
  size: 4,
  h: 500,
  w: 500, //includes margin but not padding >:D
  padding: 20
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

window.onload = () => {
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
  canvas.addEventListener("mousemove", function(ev) {
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
  con.fillStyle = "black";
  con.strokeStyle = "black";
  con.font = "70px Arial";
  con.lineWidth = box.thick;

  con.fillRect(0, 0, win.w + 2 * win.padding, win.h + 2 * win.padding);

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid.length; c++) {
      con.fillStyle = grid[r][c][1];
      con.fillRect(
        c * box.width + win.margin + win.padding,
        r * box.height + win.margin + win.padding,
        box.width,
        box.height
      );
      con.strokeRect(
        c * box.width + win.margin + win.padding,
        r * box.height + win.margin + win.padding,
        box.width,
        box.height
      );
      con.fillStyle = "black";

      con.fillText(
        grid[r][c][0],
        win.padding + win.margin + c * box.width + box.width / 2,
        win.padding + win.margin + r * box.height + box.height / 2
      );
    }
  }

  window.requestAnimationFrame(loop);
}
function transformGrid(row, column, box) {
  let r = box[0];
  let c = box[1];
  //row and column are the transformations
  //r and c are actual coords
  console.log(row + " " + column);
  if (row != 0 && column != 0) {
    transformGrid(row, 0, box);
    transformGrid(0, column, box);
  } else {
    let start = grid[r][c];
    for (let i = 0; i < win.size; i++) {
      let r1 = r;
      let c1 = c;
      r -= row;
      c -= column;
      r = (r + win.size) % win.size;
      c = (c + win.size) % win.size;
      if (i == win.size - 1) {
        grid[r1][c1] = [...start];
      } else {
        grid[r1][c1] = [...grid[r][c]];
      }
    }
  }
}

function setUp() {
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
      let cap = con.getImageData(
        c * box.width + win.margin + win.padding,
        row * box.height + win.margin + win.padding,
        box.width,
        box.height
      );
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
      grid[row].push([i, "rgb(" + r + "," + g + "," + b + ")"]);
      i++;
    }
  }
  loop();
}
//c.fillRect(square.x, square.y, width, width);
