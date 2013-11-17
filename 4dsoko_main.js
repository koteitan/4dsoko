/*----------------------------------
  4dsoko_main.js
  main program and entry point
----------------------------------*/
// static var on game
var isDebug1=false; //debug flag
var isDebug2=false; //debug flag
 // for world
var dims = 4;
 // for game
var balls = 17;
var myball = balls-1; //index of my ball
var radius = 1/8;
var ballcolor = [
  'rgb(255,  0,  0)',
  'rgb(128,128,  0)',
  'rgb(255,128,  0)',
  'rgb(  0,255,  0)',
  'rgb(128,255,  0)',
  'rgb(255,255,  0)',
  'rgb(128,  0,128)',
  'rgb(255,  0,128)',
  'rgb(  0,128,128)',
  'rgb(128,128,128)',
  'rgb(  0,255,128)',
  'rgb(  0,  0,255)',
  'rgb(128,  0,255)',
  'rgb(255,  0,255)',
  'rgb(  0,128,255)',
  'rgb(  0,255,255)',
  'rgb(255,255,255)' //my ball
];
 // for display
var planes = 4; // 3rd & 4th dimensional expanded planes
var invpl = 1/planes;
var shotpos = new Array(4);
// dinamic var on game
var timenow=0;
var p = new Array(balls);//p[d][b] = d th dimensional position of ball b
for(var b=0;b<balls;b++) p[b] = new Array(dims);
gameState=2; // game state.0=playing / 1=solved and entering name / 2=stopped
//ENTRY POINT --------------------------
window.onload=function(){
  initGui();
  initEvent();
  initGame();
  setInterval(procAll, 1000/frameRate); // main loop
}
//MAIN LOOP ------------------------
var procAll=function(){
  if(isRequestedDraw){
    procDraw();
    isRequestedDraw = false;
  }

  timenow += 1000/frameRate;
  if(timenow>=1000/motionRate){
    if(gameState==0){
      procPhysics();
    }
    timenow -= 1000/motionRate;
  }
  procEvent();
}
//var for gui ----------------------------
var canvas = new Array(2);
var ctx    = new Array(2);
var isRequestedDraw = true;
var frameRate;
if(document.all){
  frameRate = 2; // [fps]
}else{
  frameRate  = 60; // [fps]
}
var motionRate = 2; // [fps]
var isKeyTyping;
//initialize -----------
//gui
var initGui=function(){
  for(var i=0;i<1;i++){
    canvas[i] = document.getElementById("canvas"+i);
    if(!canvas[i]||!canvas[i].getContext) return false;
    ctx[i] = canvas[i].getContext('2d');
  }
  isKeyTyping = false;
} 
//game
var initGame=function(){
  //clear map in size mmax^4.
  //make sample level
  readyPlay();
  timenow=0;
}
/*-----------------------------------
  draw graphic routine.
-----------------------------------*/
var procDraw=function(){
  var dx = canvas[0].width;
  var dy = canvas[0].height;
  var dxPpl = dx*invpl;
  var dyPpl = dy*invpl;
  //clear ---------
  ctx[0].clearRect(0, 0, dx-1, dy-1);
  //border ---------
  ctx[0].strokeStyle='rgb(0,0,0)';
  ctx[0].strokeWeight='1';
  ctx[0].strokeRect(0, 0, dx-1, dy-1);
  //planes ---------
  ctx[0].strokeStyle='rgb(0,255,0)';
  ctx[0].strokeWeight='1';
  for(var x=0;x<planes;x++){
    for(var y=0;y<planes;y++){
      ctx[0].strokeRect(
        Math.floor((x+0)*dxPpl) +2,
        Math.floor((y+0)*dyPpl) +2,
        Math.floor(      dxPpl) -4,
        Math.floor(      dyPpl) -4
      );
    }
  }
  //sight -----------
  if(isMouseDragged){
    ctx[0].strokeStyle='rgb(128,0,255)';
    ctx[0].strokeWeight='1';
    var x = Math.floor((shotpos[0]+1)*0.5*dxPpl + ((shotpos[2]+1)*0.5*planes-0.5)*dxPpl);
    var y = Math.floor((shotpos[1]+1)*0.5*dyPpl + ((shotpos[3]+1)*0.5*planes-0.5)*dyPpl);
    ctx[0].strokeRect(x-dxPpl, y-dyPpl, dxPpl, dyPpl);
    ctx[0].strokeRect(x      , y-dyPpl, dxPpl, dyPpl);
    ctx[0].strokeRect(x-dxPpl, y      , dxPpl, dyPpl);
    ctx[0].strokeRect(x      , y      , dxPpl, dyPpl);
  }
  //balls ---------
  for(var b=0;b<balls;b++){
    ctx[0].strokeStyle = ballcolor[b];
    ctx[0].strokeWeight='1';
//    |        |        |         |         |:
//         |        |         |        |     :
//   -1      -0.5       0       +0.5       +1:            p[3]
//    0        1        2         3          :           (p[3]+1)*0.5*planes
//   0.5   1        2         3        4  4.5:           (p[3]+1)*0.5*planes+0.5
//    0000 11111111 222222222 33333333 4444  :Math.floor((p[3]+1)*0.5*planes+0.5)
//   0.5 1 0  0.5 1 0  0.5  1 0  0.5 1 0  0.5:          ((p[3]+1)*0.5*planes+0.5)%1
//
    var z0 = (p[b][2]+1)*0.5*planes+0.5;
    var w0 = (p[b][3]+1)*0.5*planes+0.5;
    var zr1 = z0%1;
    var wr1 = w0%1;
    var zr0 = 1-zr1;
    var wr0 = 1-wr1;
    var r = [[zr0*wr0, zr1*wr0],[zr0*wr1, zr1*wr1] ]; // r[zi][wi] 
    z0 = Math.floor(z0);
    w0 = Math.floor(w0);
    
    var x;
    var y;
    for(zi=0;zi<2;zi++){
      for(wi=0;wi<2;wi++){
        if(z0-zi>=0 && z0-zi<planes && w0-wi>=0 && w0-wi<planes){
          x = (p[b][0]+1)*0.5*dxPpl + (z0-zi)*dxPpl;
          y = (p[b][1]+1)*0.5*dyPpl + (w0-wi)*dyPpl;
          ctx[0].beginPath();
          ctx[0].arc(x, y, radius*r[zi][wi]*0.5*dxPpl, 0, Math.PI*2, false);
          ctx[0].stroke();
          if(b==myball){
            var x=1;
          }
        }
      }
    }
  }
}

/*-----------------------------------
  readyPlay
  ready level before entering play mode.
-----------------------------------*/
var readyPlay=function(){
  p=[
    [-radius, -radius, -radius, -radius],
    [+radius, -radius, -radius, -radius],
    [-radius, +radius, -radius, -radius],
    [+radius, +radius, -radius, -radius],
    [-radius, -radius, +radius, -radius],
    [+radius, -radius, +radius, -radius],
    [-radius, +radius, +radius, -radius],
    [+radius, +radius, +radius, -radius],
    [-radius, -radius, -radius, +radius],
    [+radius, -radius, -radius, +radius],
    [-radius, +radius, -radius, +radius],
    [+radius, +radius, -radius, +radius],
    [-radius, -radius, +radius, +radius],
    [+radius, -radius, +radius, +radius],
    [-radius, +radius, +radius, +radius],
    [+radius, +radius, +radius, +radius],
    [-1/2,    0,       0,       0      ],//myball
  ];  
  isRequestedDraw = true;
}
var lastmi;
/*-----------------------------------
  procPhysics 
  change arrangement in the level
  when player move.
-----------------------------------*/
var procPhysics=function(){
  //
  isRequestedDraw = true;
}
var restartGame =function(){
  initGame();
  setGameState(0);
}
/*----------------------------------------
 entryName
----------------------------------------*/
var entryName=function(){
  var name = document.getElementById('nameentrytext').value;
  if(name != ""){
    winnerName = name;
    addWinner();
    setGameState(2); // inclement game state
  }
}
/*-----------------------------------
  moveCursor
  change position of cursor 
  when key is pressed.
-----------------------------------*/
var moveCursor=function(motion){
}
/*--------------------
transpose position of display coordinate [disp]=[x,y]
into one of world corrdinate [wp]=[x,y,plane index of z, plane index of w].
--------------------*/
var display2World = function (disp){
  var dx = canvas[0].width;
  var dy = canvas[0].height;
  var invdx = 1/dx;
  var invdy = 1/dy;
  var wzi = disp[0]*invdx*planes;
  var wwi = disp[1]*invdy*planes;
  wp = new Array(4);
  wp[0] = (wzi%1)*2-1;
  wp[1] = (wwi%1)*2-1;
  wp[2] = Math.floor(wzi);
  wp[3] = Math.floor(wwi);
  wp[2] = (wp[2]+0.5)*invpl*2-1;
  wp[3] = (wp[3]+0.5)*invpl*2-1;
  return wp;
}
//event handlers after queue ------------
var handleMouseDown = function(){
  shotpos = display2World(mouseDownPos);
  isRequestedDraw = true;
}
var handleMouseDragging = function(){
  var shotpos2 = shotpos.clone();
  shotpos2[2] += (mousePos[0]-mouseDownPos[0])/canvas[0].width *2;
  shotpos2[3] += (mousePos[1]-mouseDownPos[1])/canvas[0].height*2;
  p[myball] = shotpos2.clone();
  isRequestedDraw = true;
  print(shotpos2);
}
var handleMouseUp = function(){
  var shotpos2 = shotpos.clone();
  shotpos2[2] += (mouseUpPos[0]-mouseDownPos[0])/canvas[0].width *2;
  shotpos2[3] += (mouseUpPos[1]-mouseDownPos[1])/canvas[0].height*2;
  p[myball] = shotpos2.clone();
  isRequestedDraw = true;
}
var handleMouseMoving = function(){
//
}
var handleMouseWheel = function(){
  if(mouseWheel[0]>0) moveCursor(0);
  if(mouseWheel[0]<0) moveCursor(4);
  if(mouseWheel[1]>0) moveCursor(1);
  if(mouseWheel[1]<0) moveCursor(5);
  isRequestedDraw = true;
}
var handleKeyDown = function(e){
//    var c = String.fromCharCode(e.keyCode);
//    var motion = "AW__DX__".indexOf(c);
}
var handleChangeMode = function(newmode){
  mode = newmode;
  switch(mode){
    case 0://play
      readyPlay();
    break;
    case 1://edit
      curLevelIndex = -1; //reset
      setGameState(0);
    break;
    default:
    break;
  }
  isRequestedDraw = true;
}
var rotateLevel =function(d0,d1){
  var map0 = map.clone();
  var di0 = [0,1,2,3];
  var di1 = [0,1,2,3];
  var d = new Array(4);
  var tmp = di1[d0];
  di1[d0] = di1[d1];
  di1[d1] = tmp;
  for(d[0]=0;d[0]<mmax;d[0]++){
  for(d[1]=0;d[1]<mmax;d[1]++){
  for(d[2]=0;d[2]<mmax;d[2]++){
  for(d[3]=0;d[3]<mmax;d[3]++){
    map[d[di1[3]]][d[di1[2]]][d[di1[1]]][d[di1[0]]] = map0[d[di0[3]]][d[di0[2]]][d[di0[1]]][d[di0[0]]];
  }}}}
  if(mode==0) readyPlay();
  isRequestedDraw = true;
}
var setGameState=function(state){
  switch(state){
    case 0: // unsolved
      document.getElementById('nameentrydiv').innerHTML = "";
      gameState = state;
    break;
    case 1:
      if(curLevelIndex>=0){
        document.getElementById('nameentrydiv').innerHTML
          = "Yes oh my gosh! Congratulations and please enter name here! -&gt; <input id='nameentrytext' type=text size=10 onfocus='javascript:isKeyTyping=true;' onblur='javascript:isKeyTyping=false;'><input id='nameentrybutton' type=button onclick='javascript:entryName();' value='OK'>";
      }else{
      document.getElementById('nameentrydiv').innerHTML
        = "Congratulations! please try the level below!";
      }
      gameState = state;
    break;
    case 2:
      document.getElementById('nameentrydiv').innerHTML = "Draw!";
      gameState = state;
    break;
    case 3:
      document.getElementById('nameentrydiv').innerHTML = "You Lose...";
      gameState = state;
    break;
    case 4:
      document.getElementById('nameentrydiv').innerHTML = "You Won!!";
      gameState = state;
    break;
    default:
    break;
  }
}
var print=function(str){
  document.getElementById('debugout').innerHTML = str;
}
