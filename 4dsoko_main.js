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
  ctx.fillRect(x, y, SokoObj.charaLen, SokoObj.charaLen);
};
// player -------
SokoObj.draw[SokoObj.Player] = function(ctx,x,y){
  ctx.fillStyle = 'rgb(0,255,0)'; //green
  ctx.fillRect(x, y, SokoObj.charaLen, SokoObj.charaLen);
};
// goal -------
SokoObj.draw[SokoObj.Goal] = function(ctx,x,y){
  ctx.strokeStyle = 'rgb(0,0,0)'; //black
  ctx.fillStyle = 'rgb(255,255,0)'; //orange
  ctx.beginPath();
  ctx.arc(x+SokoObj.charaLen/2, y+SokoObj.charaLen/2, SokoObj.charaLen/2*0.5, 0, Math.PI*2, false);
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
  ctx.fillRect(x, y, SokoObj.charaLen, SokoObj.charaLen);
}
SokoObj.draw2 = SokoObj.draw.clone();
SokoObj.draw2[SokoObj.Blank] = function(ctx,x,y){
  ctx.fillStyle = 'rgb(0,0,0)'; //black
  ctx.fillRect(x, y, SokoObj.charaLen, SokoObj.charaLen);
};
// dinamic var on game
var mode=0; /* 0:play mode. 1:edit mode.*/
var map;       //4 dimensional map: map[w][z][y][x]=SokoObj.o obj index
var camPos = [mmax/2, mmax/2, mmax/2, mmax/2]; // camera position (0123:xyzw)
var playPos = camPos.clone(); // player position 0123:xyzw
var curPos    = camPos.clone(); // cursor position (0123:xyzw)
var curPosEnd = curPos.clone(); // cursor end position (0123:xyzw)
var camLen = 8; // length of field of view which is displayed (x,y common)
var selchara = 0; // charactor to put in edit mode
/* motiondiff[dim][key] 
  = amount of change of position in [dim]'s dimension 
  when the key is [key] pushed.*/
  var motiondiff = [
  //a  w  A  W  d  x  D  X
  [-1, 0, 0, 0,+1, 0, 0, 0], //x
  [ 0,-1, 0, 0, 0,+1, 0, 0], //y
  [ 0, 0,-1, 0, 0, 0,+1, 0], //z
  [ 0, 0, 0,-1, 0, 0, 0,+1], //w
];
//save level --------------------
var LevelList = function(){
  this.list = [];
}
var levelList;
var Level = function(_map, _name, _description){
  this.map = _map;
  this.name = _name;
  this.description = _description;
  this.winnerList = [];
}
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
//var for gui ----------------------------
var canvas = new Array(2);
var ctx    = new Array(2);
var isRequestedDraw = true;
var frameRate;
if(document.all){
  frameRate =  1; // [fps]
}else{
  frameRate = 60; // [fps]
}
var debugout;
var isKeyTyping;
//initialize -----------
//gui
var initGui=function(){
  for(var i=0;i<2;i++){
    canvas[i] = document.getElementById("canvas"+i);
    if(!canvas[i]||!canvas[i].getContext) return false;
    ctx[i] = canvas[i].getContext('2d');
  }
  isKeyTyping = false;
} 
//game
var initGame=function(){
  //clear map in size mmax^4.
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
    //make sample level
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
    debugout = document.getElementById("debugout");
    debugout.innerHTML = "debug:";
    debugout.style.borderStyle = "SokoObj.id";
  }
  mode = 0;
  readyPlay();
  loadLevelList();
}
/*-----------------------------------
  draw graphic routine.
-----------------------------------*/
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
  for(var w=0;w<mmax;w++){
    var w0 = canvas[0].height/2+(w-camPos[3])*camLenPx + (-camPos[1])*SokoObj.charaLen;
    var w1 = w0+camLenPx;
    if(w1<0 || w0>canvas[0].height) continue;
    for(var z=0;z<mmax;z++){
      var z0 = canvas[0].width/2+(z-camPos[2])*camLenPx + (-camPos[0])*SokoObj.charaLen;
      var z1 = z0+camLenPx;
      if(z1<0 || z0>canvas[0].width) continue;
      for(var y=0;y<camLen;y++){
        var y0 = w0 + y*SokoObj.charaLen;
        var y1 = y1 + SokoObj.charaLen;
        if(y1<0 || y1>canvas[0].height) continue;
        for(var x=0;x<camLen;x++){
          var x0 = z0 + x*SokoObj.charaLen;
          var x1 = x1 + SokoObj.charaLen;
          if(x1<0 || x1>canvas[0].width) continue;
          (SokoObj.draw[map[w][z][y][x]])(ctx[0],x0-camLenp2,y0-camLenp2);
        } //x
      } //y
      ctx[0].strokeStyle = 'rgb(0,255,255)';
      ctx[0].strokeRect(z0-camLenp2, w0-camLenp2, camLenPx, camLenPx);
    } //z
  }//w
// ctx[0].strokeRect(0,0, canvas[0].width/2, canvas[0].height/2); //debug
  // cursor
  if(mode==1){
    ctx[0].strokeStyle="rgb(255,255,255)";
    var cx0 = canvas[0].width /2+(curPos[2]-camPos[2])*camLenPx + (curPos[0]-camPos[0])*SokoObj.charaLen-camLenp2;
    var cy0 = canvas[0].height/2+(curPos[3]-camPos[3])*camLenPx + (curPos[1]-camPos[1])*SokoObj.charaLen-camLenp2;
    var cx1 = canvas[0].width /2+(curPosEnd[2]-camPos[2])*camLenPx + (curPosEnd[0]-camPos[0])*SokoObj.charaLen-camLenp2;
    var cy1 = canvas[0].height/2+(curPosEnd[3]-camPos[3])*camLenPx + (curPosEnd[1]-camPos[1])*SokoObj.charaLen-camLenp2;
    cx0=
    ctx[0].strokeRect(cx0, cy0, SokoObj.charaLen+(cx1-cx0), SokoObj.charaLen+(cy1-cy0));
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
    SokoObj.draw2[c](ctx[1], 64*c+2,centery-SokoObj.charaLen/2);
  }
}

/*-----------------------------------
  readyPlay
  ready level before entering play mode.
-----------------------------------*/
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
  if(!isPlayerFound){
    map[mmax/2][mmax/2][mmax/2][mmax/2]=SokoObj.Player;
    playPos=[mmax/2,mmax/2,mmax/2,mmax/2];
  }
  camPos = playPos.clone();
  isRequestedDraw = true;
}
/*-----------------------------------
  movePlayer 
  change arrangement in the level
  when player move.
-----------------------------------*/
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

/*-----------------------------------
  moveCursor
  change position of cursor 
  when key is pressed.
-----------------------------------*/
var moveCursor=function(motion){
  for(var d=0;d<4;d++){
    camPos[d] = motiondiff[d][motion]+camPos[d];
  }
  if(camPos[0]<0){
    if(camPos[2]>0){
      camPos[0]+=mmax;
      camPos[2]--;
    }else{
      camPos[0]=0;
    }
  }
  if(camPos[0]==mmax){
    if(camPos[2]<mmax-1){
      camPos[0]=0;
      camPos[2]++;
    }else{
      camPos[0]=mmax-1;
    }
  }
  if(camPos[1]<0){
    if(camPos[3]>0){
      camPos[1]=mmax-1;
      camPos[3]--;
    }else{
      camPos[1]=0;
    }
  }
  if(camPos[1]==mmax){
    if(camPos[3]<mmax-1){
      camPos[1]=0;
      camPos[3]++;
    }else{
      camPos[1]=mmax-1;
    }
  }
  
  for(var d=0;d<4;d++){
    curPos[d] = camPos[d];
    curPosEnd[d] = camPos[d];
  }
}
/*--------------------
transpose position of display coordinate [disp]=[x,y]
into one of world corrdinate [wp]=[x,y,z,w].
--------------------*/
var display2World = function (disp){
  var camLenPx = SokoObj.charaLen*camLen;
  var numerx = disp[0] - canvas[0].width/2  + camPos[2]*camLenPx + camPos[0]*SokoObj.charaLen + SokoObj.charaLen/2;
  var numery = disp[1] - canvas[0].height/2 + camPos[3]*camLenPx + camPos[1]*SokoObj.charaLen + SokoObj.charaLen/2;
  var wp = new Array(4);
  wp[2] = Math.floor(numerx/camLenPx);
  wp[3] = Math.floor(numery/camLenPx);
  wp[0] = Math.floor((numerx%camLenPx)/SokoObj.charaLen);
  wp[1] = Math.floor((numery%camLenPx)/SokoObj.charaLen);
  return wp;
}
//event handlers after queue ------------
var handleMouseDown = function(){
  if(mouseTarget==0){
    //in map
    var wiMousePos = display2World(mouseDownPos);
    for(var d=0;d<4;d++){
      if(wiMousePos[d]<0 || wiMousePos[d]>=mmax) return;
    }
    if(!mouseWithShiftKey && mode==1){
      map[wiMousePos[3]][wiMousePos[2]][wiMousePos[1]][wiMousePos[0]] = selchara; //put charactor
      curPos    = wiMousePos.clone(); 
      curPosEnd = curPos.clone(); 
      isRequestedDraw = true;
    }else{
      // with shift
      curPos = wiMousePos.clone(); 
      isRequestedDraw = true;
    }
  }else if(mouseTarget==1){
    //in tool bar
    if(mode==1){
      for(var c=0;c<SokoObj.charactors;c++){
        var x0 = 64*c+2;
        var y0 = 2;
        var x1 = x0 + 64-12;
        var y1 = y0 + canvas[1].height-3;
        if(x0<mouseDownPos[0] && mouseDownPos[0]<x1 && y0<mouseDownPos[1] && mouseDownPos[1]<y1){
          selchara = c;
          isRequestedDraw = true;
          break;
        }
      }
    }
  }
}
var handleMouseDragging = function(){
  if(!mouseWithShiftKey){
    mouseDownPos = mousePos.clone();
    handleMouseDown();
  }else{
    // with shift
    var wiMousePos = display2World(mousePos);
    for(var d=0;d<4;d++){
      if(wiMousePos[d]<0 || wiMousePos[d]>=mmax) return;
    }
    curPosEnd = wiMousePos.clone(); 
    isRequestedDraw = true;
  }
}
var handleMouseUp = function(){
  var wiMouseDownPos = display2World(mouseDownPos);
  for(var d=0;d<4;d++){
    if(wiMouseDownPos[d]<0 || wiMouseDownPos[d]>=mmax) return;
  }
  if(!mouseWithShiftKey){
    curPosEnd = wiMouseDownPos.clone(); 
    isRequestedDraw = true;
  }else{
    //with shift
    var wiMouseUpPos = display2World(mouseUpPos);
    for(var d=0;d<4;d++){
      if(wiMouseUpPos[d]<0 || wiMouseUpPos[d]>=mmax) return;
    }
    var p0=new Array(4);
    var p1=new Array(4);
    if(wiMouseUpPos[3]<wiMouseDownPos[3]){
      p0[3]=wiMouseUpPos  [3];
      p1[3]=wiMouseDownPos[3];
      p0[1]=wiMouseUpPos  [1];
      p1[1]=wiMouseDownPos[1];
    }else{
      p0[3]=wiMouseDownPos[3];
      p1[3]=wiMouseUpPos  [3];
      p0[1]=wiMouseDownPos[1];
      p1[1]=wiMouseUpPos  [1];
    }
    if(wiMouseUpPos[2]<wiMouseDownPos[2]){
      p0[2]=wiMouseUpPos  [2];
      p1[2]=wiMouseDownPos[2];
      p0[0]=wiMouseUpPos  [0];
      p1[0]=wiMouseDownPos[0];
    }else{
      p0[2]=wiMouseDownPos[2];
      p1[2]=wiMouseUpPos  [2];
      p0[0]=wiMouseDownPos[0];
      p1[0]=wiMouseUpPos  [0];
    }
    if(p0[3]==p1[3]){
      p0[1]=[wiMouseUpPos[1],wiMouseDownPos[1]].min();
      p1[1]=[wiMouseUpPos[1],wiMouseDownPos[1]].max();
    }
    if(p0[2]==p1[2]){
      p0[0]=[wiMouseUpPos[0],wiMouseDownPos[0]].min();
      p1[0]=[wiMouseUpPos[0],wiMouseDownPos[0]].max();
    }
    for(var w=p0[3];w<=p1[3];w++){
      var y0=0;
      var y1=camLen-1;
      if(w==p0[3]) y0=p0[1];
      if(w==p1[3]) y1=p1[1];
      for(var y=y0;y<=y1;y++){
        for(var z=p0[2];z<=p1[2];z++){
          var x0=0;
          var x1=camLen-1;
          if(z==p0[2]) x0=p0[0];
          if(z==p1[2]) x1=p1[0];
          for(var x=x0;x<=x1;x++){
            map[w][z][y][x] = selchara; //put charactor
          }//x
        }//z
      }//y
    }//w
    curPosEnd = wiMouseUpPos.clone(); 
    isRequestedDraw = true;
  }//with shift
}
var handleMouseMoving = function(){
  var wiMousePos = display2World(mousePos);
  for(var d=0;d<4;d++){
    if(wiMousePos[d]<0 || wiMousePos[d]>=mmax) return;
  }
  curPos    = wiMousePos.clone();
  curPosEnd = wiMousePos.clone();
  isRequestedDraw = true;
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
      e.returnValue = false;
      isRequestedDraw = true;
    }
  }else{
    // play
    var c = String.fromCharCode(e.keyCode);
    var motion = "AW__DX__".indexOf(c);
    if(motion<0) return;
    if(e.shiftKey) motion+=2;
    movePlayer(motion);
    //prevent key
    if(e.preventDefault) e.preventDefault();
    e.returnValue = false;
    isRequestedDraw = true;
  }
}
window.onresize = function(){
  var agent = navigator.userAgent;
  if( agent.search(/iPhone/) != -1 || agent.search(/iPod/) != -1 || agent.search(/iPad/) != -1){
    var all=document.getElementsByClassName("tdbutton");
    for(var i=0;i<all.length;i++){
//      all[i].style.width="100px";
//      all[i].style.height="100px";
    }
    document.getElementById("canvas0").width  = 300;
    document.getElementById("canvas0").height = 300;
    document.getElementById("canvas1").width  = 300;
    document.getElementById("keydescription").style.width="0%";
    document.getElementById("keydescription").innerHTML="";
  }else{
    document.getElementById("canvas0").width  = [document.documentElement.clientWidth-300, 320].max();
    document.getElementById("canvas0").height = [(document.documentElement.clientHeight-160)*0.9, 180].max();
    document.getElementById("canvas1").width  = document.getElementById("canvas0").width;
  }
  isRequestedDraw = true;
};

var handleChangeMode = function(newmode){
  mode = newmode;
  if(mode==0){
    readyPlay();
  }
  isRequestedDraw = true;
}

// override XMLHttpRequest for IE -----------------------
if(typeof ActiveXObject == "function" && typeof XMLHttpRequest == "undefined"){
  XMLHttpRequest = function(){
    return new ActiveXObject("Microsoft.XMLHTTP")
  }
}

var response;
var req;

var loadLevelList = function(){
  try {
    req = new XMLHttpRequest();
  }catch(e) {
    req = false;
  }
  req.onreadystatechange = function(){
    if (req.readyState == 4 && req.status == 200) loadLevelList2(req.response);
    if (req.readyState == 4 && req.status == 404) loadLevelList2("");
  };
  req.open("GET", "./server/commonfile");
  req.setRequestHeader("content-type","application/x-www-form-urlencoded;charset=utf-8");
  req.send();
}



var loadLevelList2 = function(str){
  if(str!=""){
    levelList = eval("("+str+")");
    if(levelList==undefined || levelList=="" || levelList.list==undefined){
      levelList = new LevelList();
    }
  }else{
     levelList = new LevelList();
  }
  displayLevelList();
}
var displayLevelList=function(){
  var htmlout="";
  htmlout += "<table><tr><th>Command</th><th>Level Name</th><th>Description</th><th>Winners</th>";
  for(i=0;i<levelList.list.length;i++){
    htmlout += "<tr><td><input type=button value=load onclick='javascript:loadLevel("+i+");'></td>";
    htmlout += "<td>"+levelList.list[i].name+"</td>";
    htmlout += "<td>"+levelList.list[i].description+"</td>";
    htmlout += "<td>";
    for(w=0;w<levelList.list[i].winnerList.length;w++){
      if(w>0) htmlout += ", ";
      htmlout += levelList.list[i].winnerList[w];
    }
    htmlout += "</td></tr>";
  }
  htmlout+="<tr><th><input value='add' type=button onclick='javascript:addLevel();'></th>";
  htmlout+="<th><input type='text' id='newname' size='10' onfocus='javascript:isKeyTyping=true;' onblur='javascript:isKeyTyping=false;'></th>";
  htmlout+="<th><input type='text' id='newdescription' size='30' onfocus='javascript:isKeyTyping=true;' onblur='javascript:isKeyTyping=false;'></th>";
  htmlout+="<th></th></tr></table>";
  document.getElementById("levellistdiv").innerHTML = htmlout;
}
var loadLevel = function(i){
  if(levelList == undefined || levelList.list == undefined) return;
  map = levelList.list[i].map.clone();
  if(mode==0) readyPlay();
  isRequestedDraw = true;
}
var addLevel = function(){
  if(document.getElementById("newname")=="") return;
  var level = new Level(map, document.getElementById("newname").value, document.getElementById("newdescription").value);
  levelList.list.push(level);
  saveLevelList();
  displayLevelList();
}
var saveLevelList=function(){
  if(levelList==undefined || levelList.list==undefined) return;
  try {
    req = new XMLHttpRequest();
  }catch(e) {
    req = false;
  }
  req.onreadystatechange = function(){
    if (req.readyState == 4 && req.status == 200){
//      document.getElementById("debugout").innerHTML="success.<br>"+req.response;
    }
  };
  req.open("POST", "./server/index.cgi");
  req.setRequestHeader("content-type","application/x-www-form-urlencoded;charset=utf-8");
  req.send("name=commonfile&data="+(JSON.stringify(levelList)));
}
