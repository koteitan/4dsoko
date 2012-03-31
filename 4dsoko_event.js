//events ----------------------
//local
var mouseDownPosW    = [-1,-1]; // (world axes)
//variables
var eventQueue = [];  //eventQueue[i] = <MouseEvent>
var eventsMax  = 100; 
var lastEvent;       
//mouse events
var isMouseDragged = false;
var mouseDownPos = [-1,-1];
var mousePos     = [-1,-1];
var mouseUpPos   = [-1,-1];
// initialization
var initEvent=function(){
  eventQueue = new Array(0);
  if (!document.all){
    //not IE
//    canvas[0].onmousedown = addEvent;
//    canvas[0].onmousemove = addEvent;
//    canvas[0].onmouseup   = addEvent;
    window.onkeydown   = addEvent;
//    canvas[0].onmouseout  = addEvent;
  }else{
    //IE Only
//    canvas[0].attachEvent('onmousedown', addEvent_forIE);
//    canvas[0].attachEvent('onmousemove', addEvent_forIE);
//    canvas[0].attachEvent('onmouseup',   addEvent_forIE);
//    canvas[0].attachEvent('onmouseout',  addEvent_forIE);
  }
  document.getElementById("mode").addEventListener("click", function(){
    handleChangeMode(document.getElementById("modeform").mode[1].checked);
  });
  window.onresize();
};
// procedure
var procEvent = function(){
  while(eventQueue.length>0){
    var e = eventQueue.shift(); // <MouseEvent>
    var x,y;
    if(!document.all){
      var rect = e.target.getBoundingClientRect();
      x = e.x-rect.left;
      y = e.y-rect.top ;
    }else{
      x = e.x;
      y = e.y;
    }
    switch(e.type){
      case "mousedown": // mouse down ---------
        isMouseDragged = true;
        mouseDownPos = [x,y];
        handleMouseDown();
      break;
      case "mousemove": // dragging ---------
        if(isMouseDragged){
          mousePos = [x,y];
          handleMouseDragging();
        }else{
          mousePos = [x,y];
          handleMouseMoving();
        }
      break;
      case "mouseup":   // mouse up ---------
      case "mouseout":   // mouse out ---------
      if(isMouseDragged){
        isMouseDragged = false;
        mouseUpPos = [x,y];
        handleMouseUp();
      }
      break;
      case "keydown":   // mouse up ---------
        handleKeyDown(e);
      break;
      default:
      break;
    }
  }
};
// sub routines
// addEvent(Event e)
var addEvent = function(e){
  if(eventQueue.length < eventsMax && e!=undefined){
    eventQueue.push(e);
    lastEvent = e;//for debug
  }
};
// sub routines
// addEvent(Event e)
var addEvent_forIE = function(){
  var e=new Object();
  e.type=event.type;
  e.x=event.offsetX;
  e.y=event.offsetY;
  addEvent(e);
};

//event handlers after queue ------------
var handleMouseDown = function(){
}
var handleMouseDragging = function(){
}
var handleMouseUp = function(){
}
var handleMouseMoving = function(){
}
var handleKeyDown = function(e){
  var c = String.fromCharCode(e.keyCode);
  var motion = "AW__DX__".indexOf(c);
  if(motion<0) return;
  if(e.shiftKey) motion+=2;
  movePlayer(motion);
  isRequestedDraw = true;
}
window.onresize = function(){
if(1){
  document.getElementById("canvas0").width  = document.documentElement.clientWidth*0.9;
  document.getElementById("canvas0").height = (document.documentElement.clientHeight-200)*0.9;
  document.getElementById("canvas1").width  = document.getElementById("canvas0").width
}
  isRequestedDraw = true;
};

var handleChangeMode = function(newmode){
  mode = newmode;
  if(mode==0){
    readyPlay();
  }
}