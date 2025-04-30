// // CS30 Major Project: Tussle Galaxy
// // Owen Tang
// // April 17, 2025
// //
// // Extra for Experts:
// // - describe what you did to take this project "above and beyond"

// land with grass and stone, water as impassible but bullets can go through, stone wall cannot go through and bullet can't go through.
// splice bullet so not laggy


let guests, shared, my;
let color;
let grid, rows, cols;
let grassImg;
let pathImg;

const MOVEMENT = 3;
const DIAMETERPLAYER = 40;
const CELL_SIZE = 60;
const OPEN_TILE = 0;
const OPEN_TILE_TWO = 1;


function preload(){
  partyConnect("wss://demoserver.p5Party.org");
  shared = partyLoadShared("shared", {bullets: []});
  my = partyLoadMyShared();
  guests = partyLoadGuestShareds();
  grassImg = loadImage("grass.png");
  pathImg = loadImage("grass_2.webp");

};


function setup(){
  createCanvas(windowWidth, windowHeight);
  cols = Math.ceil(width/CELL_SIZE);
  rows = Math.ceil(height/CELL_SIZE);
  grid = generateRandomGrid(cols, rows);
  my.character = {x: random(width), y: random(height), HP: 100,};
  partySubscribe("createBullet", onCreateBullet);
};

function draw(){
  background(220);
  moveMyCharacter();
  displayGrid();

  if (partyIsHost()){
    startGame();
  }
  for (let guest of guests){
    if (guest.character){
      drawCharacter(guest.character, "red");
    }
  }
  if (partyIsHost()){
    drawCharacter(my.character,"blue");
  }
  else{
    drawCharacter(my.character,"red");
  }
  for(let bullet of shared.bullets){
    ellipse(bullet.pos.x, bullet.pos.y, 10);
  }

  let waitTimer = 2000;
  let lastSwitchedTime = 0;
  let opacity = 255;
  
  for (let bullet of shared.bullets){
    let lifeTime = millis() - bullet.bulletCreatedTime;
  
    
    if (lifeTime > waitTimer){
      fill(0,0,0,0);
    }
    else{
      opacity = 255 -  lifeTime / waitTimer * opacity;
      fill(0,0,0,opacity);
    }
    noStroke();
    ellipse(bullet.pos.x, bullet.pos.y, 10);
  }
  
  if (partyIsHost()){
    for (let i = shared.bullets.length - 1; i >= 0; i --){
      if (millis() - shared.bullets[i].bulletCreatedTime > waitTimer){
        shared.bullets.splice(i, 1);
      }
    }
  }
  fill(0);
  textSize(16);
  text("HP: " + my.character.HP, 20, 30);
};

function displayGrid(){
  for (let y = 0; y < rows; y++){
    for (let x = 0; x < cols; x++){
      if (grid[y][x] === OPEN_TILE){
        image(pathImg, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
      else if(grid[y][x] === OPEN_TILE_TWO){
        image(grassImg, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

function generateRandomGrid(cols, rows) {
  let newGrid = [];
  for (let y = 0; y < rows; y++) {
    newGrid.push([]);
    for (let x = 0; x < cols; x++) {
      //toss a 0 or 1 in randomly
      if (random(100) < 50) {
        newGrid[y].push(OPEN_TILE);
      }
      else {
        newGrid[y].push(OPEN_TILE_TWO);
      }
    }
  }
  return newGrid;
}

















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
    bulletCreatedTime: millis(),
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




