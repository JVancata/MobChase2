// Create the canvas

var socket = io();

var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");

canvas.width = $(window).width();
canvas.height = $(window).height() - 5;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
  bgReady = true;
};
bgImage.src = "background.png";


var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
  heroReady = true;
};
heroImage.src = "hero.png";

var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
  monsterReady = true;
};
monsterImage.src = "monster.png";

// Game objects
var hero = {
  speed: 256, // movement in pixels per second
  x: 0,
  y: 0
};
var monster = {
  x: 0,
  y: 0
};
var monstersCaught = 0;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
  keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
  delete keysDown[e.keyCode];
}, false);



// Update game objects
var update = function (modifier) {
  if (38 in keysDown) { // Player holding up
    hero.y -= hero.speed * modifier;
  }
  if (40 in keysDown) { // Player holding down
    hero.y += hero.speed * modifier;
  }
  if (37 in keysDown) { // Player holding left
    hero.x -= hero.speed * modifier;
  }
  if (39 in keysDown) { // Player holding right
    hero.x += hero.speed * modifier;
  }

};

// Draw everything
var render = function (arr) {
  $(window).resize(() => {
    canvas.width = $(window).width();
    canvas.height = $(window).height() - 5;
  });
  if (bgReady) {
    var vyska = $(window).height() * 2;
    var sirka = $(window).width() * 2;
    //console.log(vyska+"    "+sirka);
    var i;
    var a;
    for (a = 0; a <= sirka; a = a + 1000) {
      for (i = 0; i <= vyska; i = i + 1000) {
        ctx.drawImage(bgImage, (a - hero.x), (i - hero.y));
      }
    }
  }
  arr.forEach((pos) => {
    if (id != pos.id) {
      ctx.drawImage(heroImage, pos.x - hero.x + $(window).width() / 2, pos.y - hero.y + $(window).height() / 2);
    }
    else {
      ctx.drawImage(heroImage, $(window).width() / 2, $(window).height() / 2);
    }
  });

  if (monsterReady) {
    ctx.drawImage(monsterImage, monster.x - hero.x + $(window).width() / 2, monster.y - hero.y + $(window).height() / 2);
  }

  // Score
  ctx.fillStyle = "rgb(250, 250, 250)";
  ctx.font = "24px Helvetica";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Monsters caught: " + monstersCaught, 32, 32);
};

// The main game loop

var arr = [];
var id = 0;
socket.on('monster', function (monsterPos) {
  monster.x = monsterPos.x;
  monster.y = monsterPos.y;
  monstersCaught = monsterPos.counter;
  console.log(monsterPos)
});

socket.on('gameData', function (data) {
  console.log(data.users.length);
  monster.x = data.monster.x;
  monster.y = data.monster.y;
  monstersCaught = data.monster.counter;
  arr = data.users;
  //console.log(monsterPos)
  //arr = users;
});


socket.on('id', function (idPlayer) {
  id = idPlayer;
});

var main = function () {
  socket.emit('position', { x: hero.x, y: hero.y });

  var now = Date.now();
  var delta = now - then;

  update(delta / 1000);
  render(arr);

  then = now;

  // Request to do this again ASAP
  requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
main();