// // CS30 Major Project: Tussle Galaxy
// // Owen Tang
// // April 17, 2025
// //
// // Extra for Experts:
// // - describe what you did to take this project "above and beyond"

// land with grass and stone, water as impassible but bullets can go through, stone wall cannot go through and bullet can't go through.
// make player draw left one, then draw right one
// center the battle field, so change all the obstacles and restriction to releative
// fix the bullet hp change
// make a start screen; when 2 players are in, can click start and others can't join until round is over




// https://www.google.com/url?sa=i&url=https%3A%2F%2Fx.com%2FAshClashYT%2Fstatus%2F1247935700911239169&psig=AOvVaw2f7hXbBRXKyqpEXrldXI4V&ust=1746560725130000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCKiHyPKLjY0DFQAAAAAdAAAAABAk


let guests, shared, my;
let grid, rows, cols;
let grassImg;
let pathImg;
let x;
let y;
let bullet_hit;
let bullet;
let state = "right";

let newGrid = [];




const MOVEMENT = 3;
const DIAMETERPLAYER = 40;
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

};


function setup(){
  createCanvas(windowWidth, windowHeight);
  cols = Math.ceil(30);
  rows = Math.ceil(18);
  grid = generateRandomGrid(cols*CELL_SIZE, rows * CELL_SIZE);
  my.character = {x: random(width), y: random(height), HP: 100};
  partySubscribe("createBullet", onCreateBullet);
};

function draw(){
  background(220);
  moveMyCharacter();
  displayGrid();
  // playerHPChange();
  // character has one my and guest character.
  // drawCharacter(my.character, "blue");
  for (let guest of guests){
    if(guest.character){
      console.log(guest.character);
      drawCharacter(guest.character, "red");
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
    // if (bullet_hit){
    //   shared.bullets.splice(i, 1);
    // }
  }

  drawBarriersWall();

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
      else if(grid[y][x] === 2)
      {
        fill(0);
        square(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE);
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
  obstacles();
  return newGrid;
}






function obstacles(){

  newGrid[3][3] = 2;

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





// function playerHPChange(){
//   let bullet_hit = false;
//   for(let bullet of shared.bullets){
//     if(dist(bullet.pos.x, bullet.pos.y, my.character.x, my.character.y) < DIAMETERPLAYER/2){
//       my.character.HP -=1;
//       bullet_hit = true;
//       break;
//     }
//   }

  // for(let i = shared.bullets.length - 1; i >= 0; i--){
  //   let distanceFromGuest = dist(bullet.pos.x, bullet.pos.y, guest.character.x, guest.character.y);
  //   let distanceFromPlayer = dist(bullet.pos.x, bullet.pos.y, my.character.x, my.character.y);
  //   let bullet = shared.bullets[i];
  //   for(let guest of guests){
  //     if (guest.character && distanceFromGuest < DIAMETERPLAYER/2){
  //       guest.character.HP -=20;
  //       bullet.hit = true;
  //       break;
  //     }
  //   }
  //   for(let guest of guests){
  //     if (!guest.character && distanceFromPlayer < DIAMETERPLAYER/2){
  //       my.character.HP -=20;
  //       bullet.hit = true;
  //       break;
  //     }
  //   }
  //   if (bullet.hit){
  //     shared.bullets.splice(i, 1);
  //   }
  // }
  









// could add bushes and when player enter make their opacity   
function drawBarriersWall(){
  fill(0);
  stroke("white");
  square(1440,600,40);
  square(1440,640,40);
  square(1440,680,40);
}








