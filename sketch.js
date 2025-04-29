// // CS30 Major Project: Tussle Galaxy
// // Owen Tang
// // April 17, 2025
// //
// // Extra for Experts:
// // - describe what you did to take this project "above and beyond"


// let guests, shared, my;
// let bulletsArray = [];

// function preload(){
//   partyConnect("wss://demoserver.p5Party.org");
//   shared = partyLoadShared("shared", {bullets: []});
//   my = partyLoadMyShared();
//   guests = partyLoadGuestShareds();
// }

// function setup() {
//   createCanvas(windowWidth, windowHeight);
//   my.longRangeCharacter = {x: random(width), y: random(height), HP: 50,};
//   my.mediumRangeCharacter = {x: random(width), y: random(height), HP: 70,};
//   my.shortRangeCharacter = {x: random(width), y: random(height), HP: 100,};
//   partySubscribe("createBullet", onCreateBullet);
//   startGame();
// }

// function draw() {
//   background(220);
//   for (let p of guests){
//     drawCharacter(p.longRangeCharacter, "red");
//     drawCharacter(p.mediumRangeCharacter, "orange");
//     drawCharacter(p.shortRangeCharacter, "yellow");
//   }

//   drawCharacter(my.longRangeCharacter, "blue");
//   drawCharacter(my.mediumRangeCharacter, "blue");
//   drawCharacter(my.shortRangeCharacter, "blue");

//   for(let b of shared.bullets){
//     ellipse(b.x,b.y, 10);
//   }
// }

// function drawCharacter(character, color){
//   if(!character){
//     return;
//   }
//   fill(color);
//   ellipse(character.x, character.y, 40);
//   fill(0);
//   text("HP:" + character.HP, character.x, character.y + 30);
// }

// function startGame(){
//   shared.bullets.forEach(stepBullet);
// }

// function stepBullet(b){
//   b.x += b.dx;
//   b.y += b.dy;
// }

// function mousePressed(){
//   createBullet(my.longRangeCharacter.x, my.longRangeCharacter, mouseX, mouseY);
// }

// function createBullet(){
//   let direction = createVector(mouseX - my.longRangeCharacter.x, mouseY - my.longRangeCharacter.y);
//   direction.normalize();
//   direction.mult(4);
//   let position = createVector(my.longRangeCharacter.x, my.longRangeCharacter.y);
//   position.x += direction.x * (40/4);
//   position.y += direction.y * (40/4);
//   let bullet = {
//     pos: position,
//     vel: direction,
//   };
//   bulletsArray.push(bullet);





// }

// function onCreateBullet(){
//   shared.bullets.push(bullet);
// }





let guests, shared, my;
let color;

const MOVEMENT = 3;
const DIAMETERPLAYER = 40;


function preload(){
  partyConnect("wss://demoserver.p5Party.org");
  shared = partyLoadShared("shared", {bullets: []});
  my = partyLoadMyShared();
  guests = partyLoadGuestShareds();
};


function setup(){
  createCanvas(windowWidth, windowHeight);
  my.character = {x: random(width), y: random(height), HP: 100,};
  partySubscribe("createBullet", onCreateBullet);
};

function draw(){
  background(220);
  moveMyCharacter();

  // if(!shared.players){
  //   shared.players = {};
  // }
  // shared.players[my.partyId] = my.character;
  

  if (partyIsHost()){
    startGame();
  }

  drawCharacter(my.character,"blue");

  for (let guest of guests){
    if (guest.character){
      drawCharacter(guest.character, "red");
    }
  }
  for(let bullet of shared.bullets){
    ellipse(bullet.pos.x, bullet.pos.y, 10);
  }
};

function startGame(){
  for(let bullet of shared.bullets){
    stepBullet(bullet);
  }
}

function stepBullet(bullet){
  bullet.pos.x += bullet.vel.x;
  bullet.pos.y += bullet.vel.y;
}

function onCreateBullet(bullet){
  if(partyIsHost()){
    shared.bullets.push(bullet);
  }
}

function drawCharacter(character, color){
  fill(color);
  ellipse(character.x, character.y, 40);
}

function mousePressed(){
  let bullet = createBullet();
  partyEmit("createBullet", bullet);
}

function createBullet(){
  let direction = createVector(mouseX - my.character.x, mouseY - my.character.y);
  direction.normalize();
  direction.mult(4);
  let position = createVector(my.character.x, my.character.y);
  position.x += direction.x * (40/4);
  position.y += direction.y * (40/4);
  return{
    pos: {x: position.x, y: position.y},
    vel: {x: direction.x, y: direction.y},
  };

}

function moveMyCharacter(){
  if (keyIsDown(87)||keyIsDown(UP_ARROW)) {//w
    my.character.y-=MOVEMENT;
  }
  if (keyIsDown(65)||keyIsDown(LEFT_ARROW)) {//a
    my.character.x-=MOVEMENT;
  }
  if (keyIsDown(83)||keyIsDown(DOWN_ARROW)) {//s
    my.character.y+=MOVEMENT;
  }
  if (keyIsDown(68)||keyIsDown(RIGHT_ARROW)) {//d
    my.character.x+=MOVEMENT;
  }
  
  if (my.character.x + DIAMETERPLAYER/2 > width){
    my.character.x = width - DIAMETERPLAYER/2;
  } 
  else if (my.character.x - DIAMETERPLAYER/2 < 0){
    my.character.x = DIAMETERPLAYER/2;
  } 
  else if (my.character.y + DIAMETERPLAYER/2 > height){
    my.character.y = height - DIAMETERPLAYER/2;
  } 
  else if (my.character.y - DIAMETERPLAYER/2 < 0){
    my.character.y = DIAMETERPLAYER/2;
  } 
}