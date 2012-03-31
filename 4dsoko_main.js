// static var on game
var isDebug=1; //debug flag
var mmax = 8; //length of edge of the world (common for dimensions)
var SokoObj = function(){};
SokoObj.charaLen = 8;
SokoObj.Blank      = 0;
SokoObj.Box        = 1;
SokoObj.Player     = 2;
SokoObj.Goal       = 3;
SokoObj.GoalBox    = 4;
SokoObj.GoalPlayer = 5;
SokoObj.Wall       = 6;
SokoObj.charactors = 7;
SokoObj.draw = new Array(SokoObj.charactors);
// blank -------
SokoObj.draw[SokoObj.Blank] = function(ctx,x,y){};
  // box -------
SokoObj.draw[SokoObj.Box] = function(ctx,x,y){
  ctx.fillStyle = 'rgb(255,128,255)'; //magenta
  ctx.fillRect(x-SokoObj.charaLen/2, y-SokoObj.charaLen/2, SokoObj.charaLen, SokoObj.charaLen);
};
// player -------
SokoObj.draw[SokoObj.Player] = function(ctx,x,y){
  ctx.fillStyle = 'rgb(0,255,0)'; //green
  ctx.fillRect(x-SokoObj.charaLen/2, y-SokoObj.charaLen/2, SokoObj.charaLen, SokoObj.charaLen);
};
// goal -------
SokoObj.draw[SokoObj.Goal] = function(ctx,x,y){
  ctx.fillStyle = 'rgb(255,255,0)'; //yellow
  ctx.beginPath();
  ctx.arc(x, y, SokoObj.charaLen/2*0.5, 0, Math.PI*2, false);
  ctx.fill();
};
// box on goal -------
SokoObj.draw[SokoObj.GoalBox] = function(ctx,x,y){
  SokoObj.draw[SokoObj.Box](ctx,x,y);
  SokoObj.draw[SokoObj.Goal](ctx,x,y);
};
// player on goal -------
SokoObj.draw[SokoObj.GoalPlayer] = function(ctx,x,y){
  SokoObj.draw[SokoObj.Box](ctx,x,y);
  SokoObj.draw[SokoObj.Player](ctx,x,y);
};
// wall -------
SokoObj.draw[SokoObj.Wall] = function(ctx,x,y){
  ctx.fillStyle = 'rgb(255,0,0)'; //red
  ctx.fillRect(x-SokoObj.charaLen/2, y-SokoObj.charaLen/2, SokoObj.charaLen, SokoObj.charaLen);
}
// dinamic var on game
var map;       //4 dimensional map: map[w][z][y][x]=SokoObj.o obj index
var playPos = [mmax/2, mmax/2, mmax/2, mmax/2]; // player position 0123:xyzw
var camPos = playPos.clone(); // camera position (0123:xyzw)
var camLen = 8; // length of field of view which is displayed (x,y common)
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
  procEvent();
}
//GUI base ----------------------------
var canvas = new Array(2);
var ctx    = new Array(2);
var isRequestedDraw = true;
var frameRate;
if(document.all){
  frameRate =  1; // [fps]
}else{
  frameRate = 10; // [fps]
}
var debugout;
//GUI for game ----------------------------
//initialize -----------
var initGame=function(){
  map = new Array(mmax);
  for(var w=0;w<mmax;w++){
    map[w]=new Array(mmax);
    for(var z=0;z<mmax;z++){
      map[w][z]=new Array(mmax);
      for(var y=0;y<mmax;y++){
        map[w][z][y]=new Array(mmax);
        for(var x=0;x<mmax;x++){
          map[w][z][y][x]=SokoObj.Blank;
        }
      }
    }
  }
  if(isDebug){
    map[0][0][0][0] = 1;
    map[1][1][1][1] = 2;
    map[2][2][2][2] = 3;
    map[3][3][3][3] = 4;
    map[4][4][0][0] = 1;
    map[4][4][1][1] = 2;
    map[4][4][2][2] = 3;
    map[4][4][3][3] = 4;
    map[4][4][4][4] = SokoObj.Player;
    camPos = [4,4,4,4];
    map[4][4][6][3] = SokoObj.Wall;
    map[4][4][7][3] = SokoObj.Wall;
    map[4][4][4][3] = SokoObj.Wall;
    map[4][4][5][3] = SokoObj.Wall;
    map[4][4][6][7] = SokoObj.Wall;
    map[4][4][7][7] = SokoObj.Wall;
    map[4][4][4][7] = SokoObj.Wall;
    map[4][4][5][6] = SokoObj.Box;
    map[4][4][6][6] = SokoObj.GoalBox;
    map[4][4][7][6] = SokoObj.Goal;
  }
  if(1){
    debugout= document.getElementById("debugout");
    debugout.innerHTML = "debug:";
    debugout.style.borderStyle = "SokoObj.id";
  }
}
var initGui=function(){
  for(var i=0;i<2;i++){
    canvas[i] = document.getElementById("canvas"+i);
    if(!canvas[i]||!canvas[i].getContext) return false;
    ctx[i] = canvas[i].getContext('2d');
  }
} 
var procDraw=function(){
  //clear ---------
  ctx[0].clearRect(0, 0, canvas[0].width-1, canvas[0].height-1);
  ctx[1].clearRect(0, 0, canvas[1].width-1, canvas[1].height-1);
  //border ---------
  ctx[0].strokeStyle='rgb(0,0,0)';
  ctx[0].strokeWeight='1';
  ctx[0].strokeRect(0, 0, canvas[0].width-1, canvas[0].height-1);
  //map ---------
  var camLenPx = camLen*SokoObj.charaLen;
  var camLenp2 = camLen/2;
  var wfDrawnRange = [
    [
      camPos[0]-          ((canvas[0].width )%camLenPx)/2/SokoObj.charaLen,
      camPos[1]-          ((canvas[0].height)%camLenPx)/2/SokoObj.charaLen,
      camPos[2]-Math.floor((canvas[0].width )/camLenPx)/2,
      camPos[3]-Math.floor((canvas[0].height)/camLenPx)/2,
    ],[
      camPos[0]+          ((canvas[0].width )%camLenPx)/2/SokoObj.charaLen,
      camPos[1]+          ((canvas[0].height)%camLenPx)/2/SokoObj.charaLen,
      camPos[2]+Math.ceil((canvas[0].width )/camLenPx)/2,
      camPos[3]+Math.ceil((canvas[0].height)/camLenPx)/2,
    ]
  ];/* drawn range in world coordinate
  wfDrawnRange = {{x0,y0,z0,w0},{x1,1,z1,w1} }*/
  var wiDrawnRange = [[0,0,0,0],[0,0,0,0]]; // integer components
//  var wrDrawnRange = [[0,0,0,0],[0,0,0,0]]; // residue components
  for(var i=0;i<4;i++){
    wiDrawnRange[0][i] = Math.floor(wfDrawnRange[0][i]);
    wiDrawnRange[1][i] = Math.floor(wfDrawnRange[1][i])+1;
//    wrDrawnRange[0][i] =            wfDrawnRange[0][i] % 1;
//    wrDrawnRange[1][i] =           (wfDrawnRange[1][i] % 1) + 1;
  }
//  debugout.innerHTML = "wfDrawnRange="+wfDrawnRange.toString();
//  debugout.innerHTML += "<br>wiDrawnRange="+wiDrawnRange.toString();
  for(var w=wiDrawnRange[0][3];w<wiDrawnRange[1][3];w++){
    for(var z=wiDrawnRange[0][2];z<wiDrawnRange[1][2];z++){
      if(w>=0 && w<mmax && z>=0 && z<mmax){
        for(var y=camPos[1]-camLenp2;y<camPos[1]+camLenp2;y++){
          for(var x=camPos[0]-camLenp2;x<camPos[0]+camLenp2;x++){
            if(x>=0 && x<mmax && y>=0 && y<mmax){
              var dx = (z-wfDrawnRange[0][2])*camLenPx 
                     + (x-wfDrawnRange[0][0])*SokoObj.charaLen;
              var dy = (w-wfDrawnRange[0][3])*camLenPx 
                     + (y-wfDrawnRange[0][1])*SokoObj.charaLen;
              (SokoObj.draw[map[w][z][y][x]])(ctx[0],dx,dy);
            }
          } //x
        } //y
        ctx[0].strokeStyle = 'rgb(0,255,255)';
        var dx = (z-wfDrawnRange[0][2])*camLenPx 
               + (0-wfDrawnRange[0][0])*SokoObj.charaLen;
        var dy = (w-wfDrawnRange[0][3])*camLenPx 
               + (0-wfDrawnRange[0][1])*SokoObj.charaLen;
        ctx[0].strokeRect(dx-SokoObj.charaLen/2, dy-SokoObj.charaLen/2, camLenPx, camLenPx);
      }//if wz
    } //z
  }//w
  ctx[0].strokeRect(0,0,canvas[0].width /2,canvas[0].height /2);
}











