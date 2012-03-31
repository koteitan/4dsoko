// static var on game
var isDebug1=1; //debug flag
var isDebug2=0; //debug flag
var mmax = 8; //length of edge of the world (common for dimensions)
var SokoObj = function(){};
SokoObj.charaLen = 10;
SokoObj.Blank      = 0;
SokoObj.Box        = 1;
SokoObj.Player     = 2;
SokoObj.Goal       = 3;
SokoObj.GoalBox    = 4;
SokoObj.GoalPlayer = 5;
SokoObj.Wall       = 6;
SokoObj.charactors = 7;
SokoObj.toString = ['blank','box','player','goal','G+box','G+player','wall'];
SokoObj.draw = new Array(SokoObj.charactors);
// blank -------
SokoObj.draw[SokoObj.Blank] = function(ctx,x,y){};
  // box -------
SokoObj.draw[SokoObj.Box] = function(ctx,x,y){
  ctx.fillStyle = 'rgb(128,128,255)'; //magenta
  ctx.fillRect(x-SokoObj.charaLen/2, y-SokoObj.charaLen/2, SokoObj.charaLen, SokoObj.charaLen);
};
// player -------
SokoObj.draw[SokoObj.Player] = function(ctx,x,y){
  ctx.fillStyle = 'rgb(0,255,0)'; //green
  ctx.fillRect(x-SokoObj.charaLen/2, y-SokoObj.charaLen/2, SokoObj.charaLen, SokoObj.charaLen);
};
// goal -------
SokoObj.draw[SokoObj.Goal] = function(ctx,x,y){
  ctx.strokeStyle = 'rgb(0,0,0)'; //black
  ctx.fillStyle = 'rgb(255,255,0)'; //orange
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
  SokoObj.draw[SokoObj.Player](ctx,x,y);
  SokoObj.draw[SokoObj.Goal](ctx,x,y);
};
// wall -------
SokoObj.draw[SokoObj.Wall] = function(ctx,x,y){
  ctx.fillStyle = 'rgb(255,0,0)'; //red
  ctx.fillRect(x-SokoObj.charaLen/2, y-SokoObj.charaLen/2, SokoObj.charaLen, SokoObj.charaLen);
}
SokoObj.draw2 = SokoObj.draw.clone();
SokoObj.draw2[SokoObj.Blank] = function(ctx,x,y){
  ctx.fillStyle = 'rgb(0,0,0)'; //black
  ctx.fillRect(x-SokoObj.charaLen/2, y-SokoObj.charaLen/2, SokoObj.charaLen, SokoObj.charaLen);
};
// dinamic var on game
var mode=0; // 0:play 1:edit
var map;       //4 dimensional map: map[w][z][y][x]=SokoObj.o obj index
var playPos = [mmax/2, mmax/2, mmax/2, mmax/2]; // player position 0123:xyzw
var camPos = playPos.clone(); // camera position (0123:xyzw)
var curPos = playPos.clone(); // cursor position (0123:xyzw)
var camLen = 8; // length of field of view which is displayed (x,y common)
var selchara = 0;
// game
var motiondiff = [
  //a  w  A  W  d  x  D  X
  [-1, 0, 0, 0,+1, 0, 0, 0], //x
  [ 0,-1, 0, 0, 0,+1, 0, 0], //y
  [ 0, 0,-1, 0, 0, 0,+1, 0], //z
  [ 0, 0, 0,-1, 0, 0, 0,+1], //w
];// motiondiff[dim][key]
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
  if(isDebug1){
    var m=mmax-1;
    for(var z=0;z<mmax;z++){
    for(var y=0;y<mmax;y++){
    for(var x=0;x<mmax;x++){
      map[0][z][y][x]=SokoObj.Wall;
      map[m][z][y][x]=SokoObj.Wall;
      map[z][0][y][x]=SokoObj.Wall;
      map[z][m][y][x]=SokoObj.Wall;
      map[z][y][0][x]=SokoObj.Wall;
      map[z][y][m][x]=SokoObj.Wall;
      map[z][y][x][0]=SokoObj.Wall;
      map[z][y][x][m]=SokoObj.Wall;
    }
    }
    }
  }
  map[2][2][mmax/2][mmax/2]=SokoObj.Player;
  map[2][2][mmax/2-1][mmax/2-1]=SokoObj.Box;
  map[2][2][mmax/2+1][mmax/2+1]=SokoObj.Goal;
  map[5][2][mmax/2-1][mmax/2-1]=SokoObj.Box;
  map[5][2][mmax/2-1][mmax/2-2]=SokoObj.Wall;
  map[5][2][mmax/2-2][mmax/2-1]=SokoObj.Wall;
  map[5][2][mmax/2-2][mmax/2-2]=SokoObj.Wall;
  map[5][2][mmax/2+1][mmax/2+1]=SokoObj.Goal;
  map[mmax-3][mmax-3][mmax/2][mmax/2]=SokoObj.Box;
  map[mmax/2][mmax/2][mmax/2][mmax/2]=SokoObj.Goal;
  if(isDebug2){
    debugout= document.getElementById("debugout");
    debugout.innerHTML = "debug:";
    debugout.style.borderStyle = "SokoObj.id";
  }
  mode = 0;
  readyPlay();
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
      camPos[2]+Math.floor((canvas[0].width )/camLenPx)/2+1,
      camPos[3]+Math.floor((canvas[0].height)/camLenPx)/2+1,
    ]
  ];/* drawn range in world coordinate
  wfDrawnRange = {{x0,y0,z0,w0},{x1,1,z1,w1} }*/
  wiDrawnRange = [[0,0,0,0],[0,0,0,0]]; // integer components
//  var wrDrawnRange = [[0,0,0,0],[0,0,0,0]]; // residue components
  for(var i=0;i<4;i++){
    wiDrawnRange[0][i] = Math.floor(wfDrawnRange[0][i]);
    wiDrawnRange[1][i] = Math.floor(wfDrawnRange[1][i])+1;
//    wrDrawnRange[0][i] =            wfDrawnRange[0][i] % 1;
//    wrDrawnRange[1][i] =           (wfDrawnRange[1][i] % 1) + 1;
  }
  if(isDebug2){
    debugout.innerHTML = "wfDrawnRange="+wfDrawnRange.toString();
    debugout.innerHTML += "<br>wiDrawnRange="+wiDrawnRange.toString();
  }
  for(var w=wiDrawnRange[0][3];w<wiDrawnRange[1][3];w++){
    for(var z=wiDrawnRange[0][2];z<wiDrawnRange[1][2];z++){
      if(w>=0 && w<mmax && z>=0 && z<mmax){
        for(var y=0;y<camLen;y++){
          for(var x=0;x<camLen;x++){
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
        ctx[0].strokeRect(dx-camLenp2, dy-camLenp2, camLenPx, camLenPx);
      }//if wz
    } //z
  }//w
//  ctx[0].strokeRect(0,0, canvas[0].width/2, canvas[0].height/2); //debug
  // curPos
  if(mode==1){
    ctx[0].strokeStyle="rgb(255,255,255)";
    var dx = (curPos[2]-wfDrawnRange[0][2])*camLenPx 
           + (curPos[0]-wfDrawnRange[0][0])*SokoObj.charaLen;
    var dy = (curPos[3]-wfDrawnRange[0][3])*camLenPx 
           + (curPos[1]-wfDrawnRange[0][1])*SokoObj.charaLen;
    ctx[0].strokeRect(dx-camLenp2,dy-camLenp2,SokoObj.charaLen, SokoObj.charaLen);
  }
  // toolbar
  ctx[1].clearRect(0, 0, canvas[1].width-1, canvas[1].height-1);
  if(mode==1){
    ctx[1].fillStyle="rgb(0,0,255)";
    ctx[1].fillRect  (64*selchara+2, 2, 64-12, canvas[1].height-3);
    ctx[1].strokeStyle="rgb(128,128,255)";
    ctx[1].strokeRect(64*selchara+2, 2, 64-12, canvas[1].height-3);
  }
  var centery = canvas[1].height/2;
  if(!document.all){
    ctx[1].textAlign="left";
    ctx[1].textBaseline="center";
    ctx[1].font = "6pt Arial";
    ctx[1].fillStyle="rgb(255,255,255)";
    for(var c=0;c<SokoObj.charactors;c++){
      ctx[1].fillText(SokoObj.toString[c],64*c+SokoObj.charaLen/2+12, centery+3);
    }
  }
  for(var c=0;c<SokoObj.charactors;c++){
    SokoObj.draw2[c](ctx[1], 64*c+SokoObj.charaLen/2+6,centery);
  }
}

var readyPlay=function(){
  //find player
  var isPlayerFound = false;
  for(var w=0;w<mmax;w++){ for(var z=0;z<mmax;z++){ for(var y=0;y<mmax;y++){ for(var x=0;x<mmax;x++){
    if(map[w][z][y][x]==SokoObj.Player || map[w][z][y][x]==SokoObj.GoalPlayer){
      if(isPlayerFound){
        map[w][z][y][x] -= SokoObj.Player; //kill pseudo player
      }else{
        playPos = [x,y,z,w];
        isPlayerFound = true;
      }
    }
  } } } }
  camPos = playPos.clone();
  isRequestedDraw = true;
}
var movePlayer=function(motion){
  if(motion<0 || motion>=8) return;
  var nowPos  = playPos;
  var newPos  = new Array(4);
  var newPos2 = new Array(4);
  for(var d=0;d<4;d++){
    newPos[d]  = motiondiff[d][motion]  +playPos[d];
    newPos2[d] = motiondiff[d][motion]*2+playPos[d];
    newPos [d] = (newPos [d] + mmax) % mmax; //torus
    newPos2[d] = (newPos2[d] + mmax) % mmax; //torus
  }
  
  var nowPosObj  = map[playPos[3]][playPos[2]][playPos[1]][playPos[0]];
  var newPosObj  = map[newPos[3]][newPos[2]][newPos[1]][newPos[0]];
  var newPosObj2 = map[newPos2[3]][newPos2[2]][newPos2[1]][newPos2[0]];
  
  switch(newPosObj){
    case SokoObj.Blank: case SokoObj.Goal:
      map[nowPos[3]][nowPos[2]][nowPos[1]][nowPos[0]] = nowPosObj - SokoObj.Player;
      map[newPos[3]][newPos[2]][newPos[1]][newPos[0]] = newPosObj + SokoObj.Player;
      playPos = newPos.clone();
    break;
    case SokoObj.Goal:
      map[nowPos[3]][nowPos[2]][nowPos[1]][nowPos[0]] = nowPosObj - SokoObj.Player;
      map[newPos[3]][newPos[2]][newPos[1]][newPos[0]] = newPosObj + SokoObj.Player;
      playPos = newPos.clone();
    break;
    case SokoObj.Wall:
    break;
    default:
      if(newPosObj2==SokoObj.Blank || newPosObj2==SokoObj.Goal){
        map[nowPos [3]][nowPos [2]][nowPos [1]][nowPos [0]] = nowPosObj  - SokoObj.Player;
        map[newPos [3]][newPos [2]][newPos [1]][newPos [0]] = newPosObj  + SokoObj.Player - SokoObj.Box;
        map[newPos2[3]][newPos2[2]][newPos2[1]][newPos2[0]] = newPosObj2                  + SokoObj.Box;
        playPos = newPos.clone();
      }
    break;
  }
  camPos  = playPos.clone();
  isRequestedDraw = true;
}

var moveCursor=function(motion){
  for(var d=0;d<4;d++){
    camPos[d] = motiondiff[d][motion]+camPos[d];
  }
  if(camPos[0]<0){
    camPos[0]=mmax-1;
    camPos[2]--;
  }
  if(camPos[0]==mmax){
    camPos[0]=0;
    camPos[2]++;
  }
  if(camPos[1]<0){
    camPos[1]=mmax-1;
    camPos[3]--;
  }
  if(camPos[1]==mmax){
    camPos[1]=0;
    camPos[3]++;
  }
  for(var d=0;d<4;d++){
    camPos[d] = (camPos[d] + mmax) % mmax; //torus
    curPos[d] = camPos[d];
  }
}







