// // CS30 Major Project: Tussle Galaxy
// // Owen Tang
// // April 17, 2025
// //
// // Extra for Experts:
// // - describe what you did to take this project "above and beyond"

// land with grass and stone, water as impassible but bullets can go through, stone wall cannot go through and bullet can't go through.
// make player draw left one, then draw right one, same for the color
// center the battle field, so change all the obstacles and restriction to releative
// fix the bullet hp change


// make a start screen; when 2 players are in, can click start and others can't join until round is over




// https://www.google.com/url?sa=i&url=https%3A%2F%2Fx.com%2FAshClashYT%2Fstatus%2F1247935700911239169&psig=AOvVaw2f7hXbBRXKyqpEXrldXI4V&ust=1746560725130000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCKiHyPKLjY0DFQAAAAAdAAAAABAk


let guests, shared, my;
let grid, rows, cols;
let grassImg, pathImg, boxBarrierImg, waterBarrierImg;
let x;
let y;
let bullet_hit;
let state = "right";
let newGrid = [];




const MOVEMENT = 3;
const DIAMETERPLAYER = 30;
const CELL_SIZE = 40;
const OPEN_TILE = 0;
const OPEN_TILE_TWO = 1;


function preload(){
  partyConnect("wss://demoserver.p5Party.org");
  shared = partyLoadShared("shared", {bullets: []});
  my = partyLoadMyShared();
  guests = partyLoadGuestShareds();
  grassImg = loadImage("grass.png");
  pathImg = loadImage("Grass Texture 1.jpg");
  boxBarrierImg = loadImage("cratetex.png");
  waterBarrierImg = loadImage("texture26.png");
};


function setup(){
  createCanvas(34 * CELL_SIZE, 18 * CELL_SIZE);
  cols = Math.ceil(34);
  rows = Math.ceil(18);
  grid = generateRandomGrid(cols * CELL_SIZE, rows * CELL_SIZE);
  partySubscribe("createBullet", onCreateBullet);
  my.id = Math.floor(Math.random()*100000);
  placement();
};

function placement(){
  if(state === "right"){
    my.character = {x: width - 50, y: height/2, HP: 100};
    my.color = "red";
    state = "left";
  }
  else{
    my.character = {x: 50, y: height/2, HP: 100};
    my.color = "blue";
    state = "right";
  }
}

function draw(){
  background(220);
  moveMyCharacter();
  displayGrid();
  playerHPChange();
  // character has one my and guest character.
  // drawCharacter(my.character, "blue");
  for (let guest of guests){
    if(guest.character){
      drawCharacter(my.character, my.color);
      fill(0);
      textSize(16);
      text("HP: " + guest.character.HP, guest.character.x + 20, guest.character.y + 20);
    }
  }

  if (partyIsHost()){
    startGame();
  }
  // make the map sideways/ horizontal

  
  for(let bullet of shared.bullets){
    bullet.opacity -= 2;
    fill(0,0,0,bullet.opacity);
    noStroke();
    ellipse(bullet.pos.x, bullet.pos.y, 10);
  }

  for (let i = shared.bullets.length - 1; i >= 0; i --){
    if (shared.bullets[i].opacity <= 0){
      shared.bullets.splice(i, 1);
    }
  }
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
      else if(grid[y][x] === 2){
        fill("blue");
        image(waterBarrierImg, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
      else if(grid[y][x] === 3){
        fill(255);
        image(boxBarrierImg, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

function generateRandomGrid() {
  for (let y = 0; y < rows; y++) {
    newGrid.push([]);
    for (let x = 0; x < cols; x++) {
      if ((x+y) % 2 === 0) {
        newGrid[y].push(OPEN_TILE);
      }
      else {
        newGrid[y].push(OPEN_TILE_TWO);
      }
    }
  }
  noStroke();
  obstacles();
  return newGrid;
}





// create textfile and loop if so it prints out each one with the text file
function obstacles(){
  // first walls
  newGrid[1][3] = 3;
  newGrid[2][3] = 3;
  newGrid[3][3] = 3;
  newGrid[4][3] = 3;

  newGrid[13][30] = 3;
  newGrid[14][30] = 3;
  newGrid[15][30] = 3;
  newGrid[16][30] = 3;

  // second layer
  newGrid[13][5] = 3;
  newGrid[14][5] = 3;
  newGrid[15][5] = 3;
  newGrid[15][6] = 3;
  newGrid[16][6] = 3;

  newGrid[2][28] = 3;
  newGrid[3][28] = 3;
  newGrid[4][28] = 3;
  newGrid[2][27] = 3;
  newGrid[1][27] = 3;

  // third layer
  newGrid[7][24] = 3;
  newGrid[7][25] = 3;
  newGrid[8][24] = 3;
  newGrid[8][25] = 3;

  newGrid[9][8] = 3;
  newGrid[9][9] = 3;
  newGrid[10][8] = 3;
  newGrid[10][9] = 3;

  // fourth layer

  newGrid[0][12] = 3;
  newGrid[1][12] = 3;
  newGrid[2][12] = 3;
  newGrid[3][12] = 3;
  newGrid[4][12] = 3;
  newGrid[5][12] = 3;

  newGrid[0][11] = 3;
  newGrid[1][11] = 3;
  newGrid[2][11] = 3;
  newGrid[3][11] = 3;
  newGrid[4][11] = 3;
  newGrid[5][11] = 3;



  // fifth layer
  newGrid[12][22] = 3;
  newGrid[13][22] = 3;
  newGrid[14][22] = 3;
  newGrid[15][22] = 3;
  newGrid[16][22] = 3;
  newGrid[17][22] = 3;

  newGrid[12][21] = 3;
  newGrid[13][21] = 3;
  newGrid[14][21] = 3;
  newGrid[15][21] = 3;
  newGrid[16][21] = 3;
  newGrid[17][21] = 3;

  // sixth layer

  newGrid[7][14] = 2;
  newGrid[8][14] = 2;
  newGrid[9][14] = 3;
  newGrid[10][14] = 3;
  newGrid[11][14] = 3;
  newGrid[12][14] = 3;
  newGrid[13][14] = 3;

  newGrid[4][19] = 3;
  newGrid[5][19] = 3;
  newGrid[6][19] = 3;
  newGrid[7][19] = 3;
  newGrid[8][19] = 3;
  newGrid[9][19] = 2;
  newGrid[10][19] = 2; 
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
  console.log("bullet", bullet);
  if(partyIsHost()){
    shared.bullets.push(bullet);
  }
}

function drawCharacter(character, color){
  // console.log(color);
  fill(color);
  ellipse(character.x, character.y, 40);
}

function mousePressed(){
  console.log("mouse is pressed");
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
    opacity: 255,
    creatorId: my.id,
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
  
  if (my.character.x + DIAMETERPLAYER/2 > cols *CELL_SIZE){
    my.character.x = cols *CELL_SIZE - DIAMETERPLAYER/2;
  } 
  else if (my.character.x - DIAMETERPLAYER/2 < 0){
    my.character.x = DIAMETERPLAYER/2;
  } 
  else if (my.character.y + DIAMETERPLAYER/2 > rows * CELL_SIZE){
    my.character.y = rows * CELL_SIZE - DIAMETERPLAYER/2;
  } 
  else if (my.character.y - DIAMETERPLAYER/2 < 0){
    my.character.y = DIAMETERPLAYER/2;
  } 
}





function playerHPChange(){
  for(let i = shared.bullets.length - 1; i >= 0; i--){
    let bullet = shared.bullets[i];
    let bullet_hit = false;

    if(bullet.creatorId !== my.id && my.character.HP > 0){
      if(dist(bullet.pos.x, bullet.pos.y, my.character.x, my.character.y)< DIAMETERPLAYER/2){
        my.character.HP -= 10;
        bullet_hit = true;
      }
    }

    for(let guest of guests){
      if(guest.character && guest.character.HP > 0 && bullet.creatorId !== my.id && dist(bullet.pos.x, bullet.pos.y, guest.character.x, guest.character.y) < DIAMETERPLAYER/2){
        guest.character.HP -= 10;
        bullet_hit = true;
      }
    }
    if(bullet_hit){
      shared.bullets.splice(i, 1);
    }
  }
}

  
  

// work on the hp change, bullet loading, barriers like splicing and stuff

  
  
  
  









// could add bushes and when player enter make their opacity   









