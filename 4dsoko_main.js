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
var radius = 1/16;
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
var debugout;
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
  //clear ---------
  ctx[0].clearRect(0, 0, dx-1, dy-1);
  //border ---------
  ctx[0].strokeStyle='rgb(0,0,0)';
  ctx[0].strokeWeight='1';
  ctx[0].strokeRect(0, 0, dx-1, dy-1);
  //planes ---------
  ctx[0].strokeStyle='rgb(0,0,0)';
  ctx[0].strokeWeight='1';
  for(var x=0;x<planes;x++){
    for(var y=0;y<planes;y++){
      ctx[0].strokeRect(
        Math.floor((x+0)*invpl*dx)   ,
        Math.floor((x+0)*invpl*dy)   ,
        Math.floor((x+1)*invpl*dx) -1,
        Math.floor((x+1)*invpl*dy) -1
      );
    }
  }
  //balls ---------
  ctx[0].strokeWeight='2';
  for(var b=0;b<balls;b++){
    if(b==balls-1) ctx[0].strokeStyle = ballcolor[b];
//    |        |        |         |         |:
//         |        |         |        |     :
//   -1      -0.5       0       +0.5       +1:            p[3]
//    0        1        2         3          :           (p[3]+1)*0.5*planes
//   0.5   1        2         3        4  4.5:           (p[3]+1)*0.5*planes-0.5
//    0000 11111111 222222222 33333333 4444  :Math.floor((p[3]+1)*0.5*planes-0.5)
//   0.5 1 0  0.5 1 0  0.5  1 0  0.5 1 0  0.5:          ((p[3]+1)*0.5*planes-0.5)%1
//
    var z0 = (p[2]+1)*0.5*planes-0.5;
    var w0 = (p[3]+1)*0.5*planes-0.5;
    var zr0 = z0%1;
    var wr0 = w0%1;
    var zr1 = 1-zr0;
    var wr1 = 1-wr0;
    var r = [[zr0*wr0, zr1*wr0],[zr0*wr1, zr1*wr1] ]; // r[zi][wi] 
    z0 = Math.floor(z0);
    w0 = Math.floor(w0);
    
    var x;
    var y;
    for(zi=-1;zi<1;zi++){
      for(wi=-1;wi<1;wi++){
        if(z0-zi>=0 && z0-zi<planes && w0-wi>=0 && w0-wi<planes){
          x = (p[0]+1)*0.5*dx*invpl + (z0-zi)*dx*invpl;
          y = (p[1]+1)*0.5*dy*invpl + (w0-wi)*dy*invpl;
          ctx[0].arc(x+radius, y+radius, radius*r[zi][wi], 0, Math.PI*2, false);
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
  wp[1] = (wzi%1)*2-1;
  wp[2] = Math.floor(wzi);
  wp[3] = Math.floor(wwi);
  return wp;
}
//event handlers after queue ------------
var handleMouseDown = function(){
  //
}
var handleMouseDragging = function(){
  if(!mouseWithShiftKey){
    mouseDownPos = mousePos.clone();
    handleMouseDown();
  }else{
    // with shift
    //
  }
}
var handleMouseUp = function(){
  //
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
  if(mode==1){
    // edit
    if(e.keyCode==13){
      // put
      map[curPos[3]][curPos[2]][curPos[1]][curPos[0]] = selchara;
      isRequestedDraw = true;
    }else if("E".indexOf(String.fromCharCode(e.keyCode))==0){
      // sel--
      selchara = (selchara+1+SokoObj.charactors) % SokoObj.charactors;
      isRequestedDraw = true;
    }else if("Q".indexOf(String.fromCharCode(e.keyCode))==0){
      // sel++
      selchara = (selchara-1+SokoObj.charactors) % SokoObj.charactors;
      isRequestedDraw = true;
    }else{
      // move cursor
      var c = String.fromCharCode(e.keyCode);
      var motion = "AW__DX__".indexOf(c);
      if(motion<0) return;
      moveCursor(motion);
      //prevent key
      if(e.preventDefault) e.preventDefault();
//      e.returnValue = false;
      isRequestedDraw = true;
    }
  }else{
    // play
    var c = String.fromCharCode(e.keyCode);
    var motion = "AW__DX__".indexOf(c);
    if(motion<0) return;
    if(e.shiftKey) motion+=2;
    inertia[0] = motiondiff[motion].clone();
    //prevent key
    if(e.preventDefault) e.preventDefault();
//    e.returnValue = false;
    isRequestedDraw = true;
  }
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


