/*----------------------------------
  4dsoko_main.js
  main program and entry point
----------------------------------*/
// static var on game
var isDebug1=false; //debug flag
var isDebug2=false; //debug flag
var gameState_idle = 0;
var gameState_shot = 1;
var gameState_run  = 2;
 // for world
var dims = 4;
var secPframe = 1; // [sec/frame]
var pos2velocity = 0.2; // coef for velocity from position
var vDecay = 0.99;  // decay of velocity
var vReflect = 0.5; // decay of velocity at reflection
var vThres = 0.01;  // threshold for stop detection
var elast = 0.8;    //
 // for game
var balls = 17;
var myball = balls-1; //index of my ball
var radius = 1/8;
var margin = radius*0.1;
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
sightcolor = 'rgb(128,0,255)';
 // for display
var planes = 5; // 3rd & 4th dimensional expanded planes
var invpl = 1/planes;
var sightposDown  = new Array(4);
var sightposUp = new Array(4);
// dinamic var on game
var timenow=0;
var q = new Array(balls);//q[d][b] = d th dimensional position of ball b
var v = new Array(balls);//v[d][b] = d th dimensional velocity of ball b
for(var b=0;b<balls;b++){
  q[b] = new Array(dims);
  v[b] = new Array(dims);
}
var gameState      = gameState_shot;
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
  if(timenow>=1000/frameRate){
    if(gameState==gameState_run){
      procPhysics();
    }
    timenow -= 1000/frameRate;
  }
  procEvent();
}
//var for gui ----------------------------
var canvas = new Array(2);
var ctx    = new Array(2);
var isRequestedDraw = true;
var frameRate;
frameRate  = 60; // [fps]
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
  if(isMouseDragged && gameState==gameState_shot){
    ctx[0].strokeStyle=sightcolor;
    ctx[0].strokeWeight='1';
    var x = Math.floor((sightposDown[0]+1)*0.5*dxPpl + ((sightposDown[2]+1)*0.5*planes-0.5)*dxPpl);
    var y = Math.floor((sightposDown[1]+1)*0.5*dyPpl + ((sightposDown[3]+1)*0.5*planes-0.5)*dyPpl);
    ctx[0].strokeRect(x-dxPpl, y-dyPpl, dxPpl, dyPpl);
    ctx[0].strokeRect(x      , y-dyPpl, dxPpl, dyPpl);
    ctx[0].strokeRect(x-dxPpl, y      , dxPpl, dyPpl);
    ctx[0].strokeRect(x      , y      , dxPpl, dyPpl);
  }
  //balls ---------
  for(var b=0;b<balls+1;b++){
    var pb;
    if(b==balls){
      if(isMouseDragged && gameState==gameState_shot){
        //sight point
        pb=sightposUp;
        ctx[0].strokeStyle = sightcolor;
      }else{
        continue;
      }
    }else{
      pb=q[b];
      ctx[0].strokeStyle = ballcolor[b];
    }
    ctx[0].strokeWeight='1';
//    |        |        |         |         |:
//         |        |         |        |     :
//   -1      -0.5       0       +0.5       +1:            q[3]
//    0        1        2         3          :           (q[3]+1)*0.5*planes
//   0.5   1        2         3        4  4.5:           (q[3]+1)*0.5*planes+0.5
//    0000 11111111 222222222 33333333 4444  :Math.floor((q[3]+1)*0.5*planes+0.5)
//   0.5 1 0  0.5 1 0  0.5  1 0  0.5 1 0  0.5:          ((q[3]+1)*0.5*planes+0.5)%1
//
    var z0 = (pb[2]+1)*0.5*planes+0.5;
    var w0 = (pb[3]+1)*0.5*planes+0.5;
    var zr0 = z0%1;
    var wr0 = w0%1;
    var zr1 = 1-zr0;
    var wr1 = 1-wr0;
    var r = [[zr0*wr0, zr0*wr1],[zr1*wr0, zr1*wr1] ]; // r[zi][wi] 
    z0 = Math.floor(z0);
    w0 = Math.floor(w0);
    
    var x;
    var y;
    for(zi=0;zi<2;zi++){
      for(wi=0;wi<2;wi++){
        if(z0-zi>=0 && z0-zi<planes && w0-wi>=0 && w0-wi<planes){
          x = (pb[0]+1)*0.5*dxPpl + (z0-zi)*dxPpl;
          y = (pb[1]+1)*0.5*dyPpl + (w0-wi)*dyPpl;
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
  q=[
    [-(radius+margin), -(radius+margin), -(radius+margin), -(radius+margin)],
    [+(radius+margin), -(radius+margin), -(radius+margin), -(radius+margin)],
    [-(radius+margin), +(radius+margin), -(radius+margin), -(radius+margin)],
    [+(radius+margin), +(radius+margin), -(radius+margin), -(radius+margin)],
    [-(radius+margin), -(radius+margin), +(radius+margin), -(radius+margin)],
    [+(radius+margin), -(radius+margin), +(radius+margin), -(radius+margin)],
    [-(radius+margin), +(radius+margin), +(radius+margin), -(radius+margin)],
    [+(radius+margin), +(radius+margin), +(radius+margin), -(radius+margin)],
    [-(radius+margin), -(radius+margin), -(radius+margin), +(radius+margin)],
    [+(radius+margin), -(radius+margin), -(radius+margin), +(radius+margin)],
    [-(radius+margin), +(radius+margin), -(radius+margin), +(radius+margin)],
    [+(radius+margin), +(radius+margin), -(radius+margin), +(radius+margin)],
    [-(radius+margin), -(radius+margin), +(radius+margin), +(radius+margin)],
    [+(radius+margin), -(radius+margin), +(radius+margin), +(radius+margin)],
    [-(radius+margin), +(radius+margin), +(radius+margin), +(radius+margin)],
    [+(radius+margin), +(radius+margin), +(radius+margin), +(radius+margin)],
    [-1/2,    0,       0,       0      ],//myball
  ];
  for(var b=0;b<balls;b++)for(var d=0;d<dims;d++) v[b][d] = 0;
  isRequestedDraw = true;
}
var lastmi;
/*-----------------------------------
  procPhysics 
  change arrangement in the level
  when player move.
-----------------------------------*/
var procPhysics=function(){
  var isStopped = 1;
    
  var startt = 0;         // start of analysed time
  var endt   = secPframe; // start of analysed time
  do{
    var ctime    = 0; // collision time [0<ctime<1]
    var cb0      = 0; // collision ball 0
    var cb1      = 0; // collision ball 1 (>balls:dimension of wall)
    var dt = endt-startt;
    var ctimeMin = 1; // minimum collision time
    
    // temporary motion
    var q1 = q.clone();
    for(var b=0;b<balls;b++){
      for(var d=0;d<dims;d++){
        q1[b][d] += v[b][d]*dt;
      }
    }
    // backup
    var q0 = q.clone();
    var v0 = v.clone();

    // collision detection
    for(var b=0;b<balls;b++){
      for(var d=0;d<dims;d++){
        if(q1[b][d]<-1+radius){
          // collision is detected
          ctime = ((-1)+radius-q0[b][d])/(q1[b][d]-q0[b][d]);
          if(ctime < ctimeMin){
            // renew minimum collision
            ctimeMin = ctime;
            cb0 = b;
            cb1 = balls + d;
          }
        }
        if(q1[b][d]>+1-radius){
          // collision is detected
          ctime = ((+1)-radius-q0[b][d])/(q1[b][d]-q0[b][d]);
          if(ctime < ctimeMin){
            // renew minimum collision
            ctimeMin = ctime;
            cb0 = b;
            cb1 = balls + d;
          }
        }
      }
    }
    
    // balls collision
    for(var b0=0;b0<balls;b0++){
      for(var b1=b0+1;b1<balls;b1++){
        /*
          sum[d]{(
                  +(1-t)q[b0][d]+tq1[b0][d] 
                  -(1-t)q[b1][d]+tq1[b1][d] 
                )^2
          } < (2r)^2 ...(*1) && 0<t<1 
          then collision time is t.
        */
        var eqa = 0; // a of quadratic formula of (*1)
        var eqb = 0; // b of quadratic formula of (*1)
        var eqc = 0; // c of quadratic formula of (*1)
        /* quadratic formula at^2+bt+c=0 */
        var powdq1 = 0.0;
        for(var d=0;d<dims;d++){
          var dq0 = q0[b1][d] - q0[b0][d];
          var dq1 = q1[b1][d] - q1[b0][d];
          var dqd = dq0 - dq1;
          powdq1 += dq1*dq1;      
          eqa += dqd*dqd;
          eqb += dq0*dqd;
          eqc += dq0*dq0;
        }
        eqb *= +2;
        eqc += -4*radius*radius;
        var charaeq = eqb*eqb - 4*eqa*eqc; // characteristic equation
        if(charaeq>0){
          ctime = (-eqb+Math.sqrt(charaeq))/(2*eqa); // quadratic formula
          if(ctime>0 && ctime<ctimeMin){
            // minimmum collision is detected
            ctimeMin = ctime;
            cb0 = b0;
            cb1 = b1;
          }
        }//if
      }//b1
    }//b0
    
    // move until ctime
    for(var b=0;b<balls;b++){
      for(var d=0;d<dims;d++){
        q[b][d] += v0[b][d]*(dt*ctimeMin);
      }
    }
    if(ctimeMin<1){
      // collision effect
      if(cb1<balls){
        //balls collision
        var dq = [0,0,0,0];
        var dv = [0,0,0,0];
        var dqdv = 0.0;
        var dq2 = 0;
        for(var d=0;d<dims;d++){
          dq[d]  = q0[cb1][d]-q0[cb0][d];
          dv[d]  = v0[cb1][d]-v0[cb0][d];
          dqdv  += dq[d]*dv[d];
          dq2   += dq[d]*dq[d];
        }
        var nv = [0,0,0,0];
        for(var d=0;d<dims;d++){
          nv[d] = dqdv*dq[d]/dq2;
        }
        
        for(var d=0;d<dims;d++){
          v[cb0][d] += +nv[d]*(1 + elast)/2;
          v[cb1][d] += -nv[d]*(1 + elast)/2;
        }
      }else{
        //ball and wall collision
        v[cb0][cb1-balls] = v0[cb0][cb1-balls] * -vReflect;
      }//if ball or wall
      startt = dt*ctimeMin;
    }else{
      var a=a+1;
    }//if ctimeMIn
  }while(ctimeMin<1);//do
  
  
  // valocity decay & stop detection
  for(var b=0;b<balls;b++){
    var vpow = 0;
    for(var d=0;d<dims;d++){
      v[b][d] *= vDecay; // decay velocity
      vpow += v[b][d]*v[b][d];
    }
    if(vpow >= vThres*vThres){
      isStopped = 0;
    }
  }
  if(isStopped){
    //reset vel to zero
    for(var b=0;b<balls;b++){
      for(var d=0;d<dims;d++){
        v[b][d]=0;
      }
    }
    gameState = gameState_shot;
  }
  isRequestedDraw = true;
}
var restartGame =function(){
  initGame();
  gameState = gameState_shot; // back to before play
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
  wq = new Array(4);
  wq[0] = (wzi%1)*2-1;
  wq[1] = (wwi%1)*2-1;
  wq[2] = Math.floor(wzi);
  wq[3] = Math.floor(wwi);
  wq[2] = (wq[2]+0.5)*invpl*2-1;
  wq[3] = (wq[3]+0.5)*invpl*2-1;
  return wq;
}
//event handlers after queue ------------
var handleMouseDown = function(){
  if(gameState==gameState_shot){
    sightposDown = display2World(mouseDownPos);
    sightposUp = sightposDown.clone();
    isRequestedDraw = true;
  }
}
var handleMouseDragging = function(){
  if(gameState==gameState_shot){
    sightposUp = sightposDown.clone();
    sightposUp[2] += (mousePos[0]-mouseDownPos[0])/canvas[0].width *2;
    sightposUp[3] += (mousePos[1]-mouseDownPos[1])/canvas[0].height*2;
    isRequestedDraw = true;
  }
}
var handleMouseUp = function(){
  if(gameState==gameState_shot){
    sightposUp = sightposDown.clone();
    sightposUp[2] += (mouseUpPos[0]-mouseDownPos[0])/canvas[0].width *2;
    sightposUp[3] += (mouseUpPos[1]-mouseDownPos[1])/canvas[0].height*2;
    for(var d=0;d<dims;d++) v[myball][d] = (sightposUp[d] - q[myball][d])*pos2velocity;
    isRequestedDraw = true;
    gameState=gameState_run;
  }
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
window.onresize = function(){
  var agent = navigator.userAgent;
  if( agent.search(/iPhone/) != -1 || agent.search(/iPod/) != -1 || agent.search(/iPad/) != -1){
    var all=document.getElementsByClassName("tdbutton");
    for(var i=0;i<all.length;i++){
    }
    document.getElementById("canvas0").width  = 512;
    document.getElementById("canvas0").height = 512;
  }else{
    var newWidth  = [document.documentElement.clientWidth-300, 320].max();
    var newHeight = [(document.documentElement.clientHeight-160)*0.9, 180].max();
    var newSize = [newWidth, newHeight].min();
    document.getElementById("canvas0").width  = newSize;
    document.getElementById("canvas0").height = newSize;
  }
  isRequestedDraw = true;
};
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
  var maq0 = maq.clone();
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
    maq[d[di1[3]]][d[di1[2]]][d[di1[1]]][d[di1[0]]] = maq0[d[di0[3]]][d[di0[2]]][d[di0[1]]][d[di0[0]]];
  }}}}
  if(mode==0) readyPlay();
  isRequestedDraw = true;
}

var print=function(str){
  document.getElementById('debugout').innerHTML = str;
}
