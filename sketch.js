// CS30 Major Project: Tussle Galaxy
// Owen Tang
// April 17, 2025
// Extra for Experts:
// - Implemented and explored components of p5.party library to enable real-time multiplyer functionality
// - Researched and used mini functions such as max() and id to enhance the code




// presentation- what I did, how I did it- give an overview and talk about some of the specifc 
// beta testing


//extras:
// emotes and sprays






// DECLARATION SECTION:
// Declare global variables
let guests, shared, my, sharedStatePlacement, sharedStateStart;
let grid, rows, cols;
let grassImg, pathImg, boxBarrierImg, waterBarrierImg, waitingScreenImg, audioBulletShot, waitingScreenAudio, gameStartAudio;
let x, y;
let bullet_hit;
let newGrid = [];
let reloadTime = 1000;
let state = "normal";

// Declare constants
const MOVEMENT = 1.5;
const DIAMETERPLAYER = 30;
const CELL_SIZE = 40;
const OPEN_TILE = 0;
const OPEN_TILE_TWO = 1;


// PRELOAD AND SETUP SECTION:
// Function preload p5-party, sounds, and images
function preload(){
  partyConnect("wss://demoserver.p5Party.org");
  console.log("connected to server");
  shared = partyLoadShared("shared", {bullets: []});
  sharedStatePlacement = partyLoadShared("placementState", {placement: "right"}); 
  sharedStateStart = partyLoadShared("ScreenState", {screen: "waiting"}); 
  my = partyLoadMyShared();
  guests = partyLoadGuestShareds();
  grassImg = loadImage("grass.png");
  pathImg = loadImage("Grass Texture 1.jpg");
  boxBarrierImg = loadImage("cratetex.png");
  waterBarrierImg = loadImage("texture26.png");
  waitingScreenImg = loadImage("waitingScreen3.avif");
  audioBulletShot = createAudio("laser-312360.mp3");
  waitingScreenAudio = createAudio("waitScreenSong.mp3");
  gameStartAudio = createAudio("gameStartSong.mp3");
};

// Set up the canvas, grids, playerid, and placements of the players
function setup(){
  cols = Math.ceil(34);
  rows = Math.ceil(18);
  createCanvas(cols * CELL_SIZE, rows * CELL_SIZE);
  grid = generateRandomGrid(cols * CELL_SIZE, rows * CELL_SIZE);
  partySubscribe("createBullet", onCreateBullet);
  my.id = Math.floor(Math.random() * 100000);
  placement();
};


// GAME STATE CONTROL AND DRAWING LOOP SECTION:
// Alternates player placement right as red team, left as blue team
function placement(){
  if(sharedStatePlacement.placement === "right"){
    my.character = {x: width - 50, y: height/2, HP: 100, lastShotTime: 0};
    my.color = "red";
    sharedStatePlacement.placement = "left";
  }
  else{
    my.character = {x: 50, y: height/2, HP: 100, lastShotTime: 0};
    my.color = "blue";
    sharedStatePlacement.placement  = "right";
  }
}

// Main loop, checks state and runs songs, displays, and other functions
function draw(){
  if(state === "lose"){
    losingScreen();
    return;
  }
  if(sharedStateStart.screen === "waiting"){
    waitingScreen();
    waitingScreenAudio.play();
  }
  else if(sharedStateStart.screen === "start"){
    displayGrid();
    moveMyCharacter();
    playerHPChange();
    shootingInitilization();
    drawCharacters();
    loseState();
    waitingScreenAudio.stop();
    gameStartAudio.play();
    waitingScreenAudio.play();
  }
};

// If player is 0 HP then state is lose and character moves out the map
function loseState(){
  if(my.character.HP <= 0 && state !== "lose"){
    state = "lose";
    my.character.x = -100;
  }
}


// GAME LOGIC OF SHOOTING, MOVEMENT, COLLISIONS, BULLETS, DISPLAYS SECTION:
// draws players and displays health of each player
function drawCharacters(){
  // draw my character
  drawCharacter(my.character, my.color);
  fill(0);
  textSize(16);
  textAlign(CENTER,CENTER);
  let reloaded;
  if(millis() - my.character.lastShotTime >= reloadTime){
    reloaded = 1;
  }
  else{
    reloaded = 0;
  }
  text("reload: " + reloaded, my.character.x, my.character.y + 55);
  // draw all guest players
  for (let guest of guests){
    if(guest.character){
      drawCharacter(guest.character, guest.color);
      fill(0);
      textSize(16);
      textAlign(CENTER,CENTER);
      text("HP: " + guest.character.HP, guest.character.x, guest.character.y + 40);
    }
  }
}

// Spawn/draw in bullets and delete bullets with 0 opacity
function shootingInitilization(){
  if (partyIsHost()){
    bulletInitialization();
  }
  for(let bullet of shared.bullets){
    bullet.opacity -= 3;
    fill(0,0,0,bullet.opacity);
    noStroke();
    ellipse(bullet.pos.x, bullet.pos.y, 10);
  }
  for (let i = shared.bullets.length - 1; i >= 0; i --){
    if (shared.bullets[i].opacity <= 0){
      shared.bullets.splice(i, 1);
    }
  }
}

// Displays/draws the character
function drawCharacter(character, color){
  fill(color);
  ellipse(character.x, character.y, 40);
}

// Waiting screen background and text
function waitingScreen(){
  background(waitingScreenImg);
  fill(255);
  textSize(85);
  textAlign(CENTER, CENTER);
  text("WAITING FOR Host TO START", 680, 150);
  textSize(40);
  text("Press 'C' to start", 700, 300);
  text("WASD to move, mouse button to shoot", 680, 400);
}

// Losing screen background and text
function losingScreen(){
  background(0);
  fill("red");
  textAlign(CENTER,CENTER);
  textSize(60);
  text("YOU LOSE!", 680, 300);
  textSize(30);
  text("Press 'R' to restart", 690, 450);
}

// Player movements and canvas restrictions
function moveMyCharacter(){
  let radius = 20;
  let futureX = my.character.x;
  let futureY = my.character.y;
  if (keyIsDown(87)||keyIsDown(UP_ARROW)) {//w
    futureY -= MOVEMENT;
  }
  if (keyIsDown(65)||keyIsDown(LEFT_ARROW)) {//a
    futureX -= MOVEMENT;
  }
  if (keyIsDown(83)||keyIsDown(DOWN_ARROW)) {//s
    futureY += MOVEMENT;
  }
  if (keyIsDown(68)||keyIsDown(RIGHT_ARROW)) {//d
    futureX += MOVEMENT;
  }
  if (futureX + DIAMETERPLAYER/2 > cols * CELL_SIZE){// right wall
    futureX = cols * CELL_SIZE - DIAMETERPLAYER/2;
  } 
  else if (futureX - DIAMETERPLAYER/2 < 0){// left wall
    futureX = DIAMETERPLAYER/2;
  } 
  else if (futureY + DIAMETERPLAYER/2 > rows * CELL_SIZE){// bottom wall
    futureY = rows * CELL_SIZE - DIAMETERPLAYER/2;
  } 
  else if (futureY - DIAMETERPLAYER/2 < 0){// top wall
    futureY = DIAMETERPLAYER/2;
  } 
  let canMove = true;
  let col = Math.floor(futureX/CELL_SIZE);
  let row = Math.floor(futureY/CELL_SIZE);
  for(let r = row - 1; r <= row + 1; r++){
    for(let c = col - 1; c <= col + 1; c++){
      if(r >= 0 && r < rows && c >= 0 && c < cols){
        let tile = grid[r][c];
        if(tile === 2 || tile === 3){
          let tileX = c * CELL_SIZE + CELL_SIZE/2;
          let tileY = r * CELL_SIZE + CELL_SIZE/2;
          let d = dist(futureX, futureY, tileX, tileY);
          if(d < radius + CELL_SIZE/2){
            canMove = false;
          }
        }
      }
    }
  }
  if (canMove){
    my.character.x = futureX;
    my.character.y = futureY;
  }
}

// Helper function that returns team color based on the id of player
function getPlayerColor(id){
  if(id === my.id){
    return my.color;
  }
  for(let guest of guests){
    if(guest.id === id){
      return guest.color;
    }
  }
  return null;
}

// Detects if bullet hits player and decreases HP
function playerHPChange(){
  for(let i = shared.bullets.length - 1; i >= 0; i--){
    let bullet = shared.bullets[i];
    let bullet_hit = false;
    // own character
    if(bullet.creatorId !== my.id && my.character && my.character.HP > 0){
      let hostColor = getPlayerColor(bullet.creatorId);
      if(hostColor && hostColor !== my.color){
        const distance = dist(bullet.pos.x, bullet.pos.y, my.character.x, my.character.y);
        console.log("distance", distance);
        if( distance < DIAMETERPLAYER/2){
          //set lowest value of hp to 0, so no negative
          my.character.HP = max(0, my.character.HP - 10);
          bullet_hit = true;
        }
      }
    }
    // guest character
    for(let guest of guests){
      if(guest.character && guest.character.HP > 0 && bullet.creatorId !== guest.id && guest.id !== my.id){
        let hostColor = getPlayerColor(bullet.creatorId);
        if(hostColor && hostColor !== guest.color){
          const distance2 = dist(bullet.pos.x, bullet.pos.y, guest.character.x, guest.character.y);
          console.log("distance2", distance2);
          if( distance2 < DIAMETERPLAYER/2){
            //set lowest value of hp to 0, so no negative 
            guest.character.HP = max(0, guest.character.HP - 10);
            bullet_hit = true;
            break;
          }
        }
      }
    }
    if(bullet_hit){
      shared.bullets.splice(i, 1);
    }
  }
}


// BULLET CREATION, GRID LOGIC, OBSTACLES, SCREEN MODIFICATION SECTION:
// Pushes a bullet into the shared array
function onCreateBullet(bullet){
  if(partyIsHost()){
    shared.bullets.push(bullet);
  }
}

// Loops through all the bullets and runs the stepBullet function
function bulletInitialization(){
  for(let bullet of shared.bullets){
    stepBullet(bullet);
  }
}

// Bullet movement and deletes bullet if hit obstacles
function stepBullet(bullet){
  if(!bullet.pos||!bullet.vel){
    bullet.opacity = 0;
    return;
  }
  bullet.pos.x += bullet.vel.x;
  bullet.pos.y += bullet.vel.y;
  let col = Math.floor(bullet.pos.x/CELL_SIZE);
  let row = Math.floor(bullet.pos.y/CELL_SIZE);
  if(grid[row] && grid[row][col] ===3){
    bullet.opacity = 0;
  }
}

// Returns bullet object that moves towards the direction of the mouse
function createBullet(){
  let direction = createVector(mouseX - my.character.x, mouseY - my.character.y);
  direction.normalize();
  direction.mult(3);
  let position = createVector(my.character.x, my.character.y);
  position.x += direction.x * (40/4);
  position.y += direction.y * (40/4);
  return{
    pos: {x: position.x, y: position.y},
    vel: {x: direction.x, y: direction.y},
    opacity: 255,
    creatorId: my.id,
    lastShotTime: millis(),
  };
}

// Displays the different grid images
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

// Generates the checkers board pattern grid for the canvas
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

// Self designed obstacles for map
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

// Press "C" to start the game and "R" to reset the game
function keyPressed(){
  if(key === "c" && partyIsHost()){
    sharedStateStart.screen = "start";
  }
  if(key === "r"){
    placement();
    sharedStateStart.screen = "waiting";
    my.character.HP = 100;
    state = "normal";
    for(let guest of guests){
      if(guest.character){
        if(sharedStatePlacement.placement === "right"){
          guest.character.x = width - 50;
          guest.character.y = height/2;
          guest.color = "red";
          sharedStatePlacement.placement = "left";
        }
        else{
          guest.character.x = 50;
          guest.character.y = height/2;
          guest.color = "blue";
          sharedStatePlacement.placement = "right";
        }
        guest.character.HP = 100;
      }
    }
  }
}

// Pressing the mouse will generate a bullet, sound, and reload display
function mousePressed(){
  if (millis() - my.character.lastShotTime >= reloadTime){
    my.character.lastShotTime = millis();
    let bullet = createBullet();
    partyEmit("createBullet", bullet);
    if(sharedStateStart.screen === "start"){
      audioBulletShot.stop();
      audioBulletShot.play();
    }
  } 
}
















