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

function preload(){
  partyConnect("wss://demoserver.p5Party.org");
  shared = partyLoadShared("shared", {bullets: []});
  my = partyLoadMyShared();
  guests = partyLoadGuestShareds();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  my.longRangeCharacter = {x: random(width), y: random(height), HP: 50,};
  partySubscribe("createBullet", onCreateBullet);
}

function draw() {
  if(partyIsHost()){
    stepGame();
    guests: guests;
  }
  for (let p of guests){
    drawCharacter(p.longRangeCharacter, "red");
  }
  drawCharacter(my.longRangeCharacter, "blue");
  for(let b of shared.bullets){
    ellipse(b.x,b.y, 10);
  }
}

function stepGame(){
  shared.bullets.forEach(stepBullet);
}

function stepBullet(b){
  b.x += b.dx;
  b.y += b.dy;
}

function onCreateBullet(b){
  if(partyIsHost()){
    shared.bullets.push(b);
  }
  
}