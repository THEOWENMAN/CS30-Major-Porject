// CS30 Major Project: Tussle Galaxy
// Owen Tang
// April 17, 2025
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"


let guests, shared, my;

function preload(){
  partyConnect("wss://demoserver.p5Party.org");
  shared = partyLoadShared("shared", {bullets: []});
  my = sharedLoadMyShared();
  guests = partyLoadGuestShared();
}







function setup() {
  createCanvas(windowWidth, windowHeight);
  my.longRangeCharacter = {x: random(width), y: random(height), HP: 50,};
  my.mediumRangeCharacter = {x: random(width), y: random(height), HP: 70,};
  my.shortRangeCharacter = {x: random(width), y: random(height), HP: 100,};
  partySubscribe("createBullet", onCreateBullet);
}

function draw() {
  background(220);
}





function startGame(){
  shared.bullets.forEach(stepBullet);
}

function stepBullet(b){
  b.x += b.dx;
  b.y += b.dy;
}
