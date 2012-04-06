//events ----------------------
//variables
var eventQueue = [];  //eventQueue[i] = <MouseEvent>
var eventsMax  = 100; 
var lastEvent;       
//mouse events
var isMouseDragged = false;
var mouseDownPos = [-1,-1];
var mousePos     = [-1,-1];
var mouseUpPos   = [-1,-1];
var mouseButton = -1;
var mouseWithShiftKey = false;
var mouseTarget = -1;
var mouseWheel = [0,0];
var MouseLeft  = 0;
var MouseRight = 2;
// initialization
var initEvent=function(){
  eventQueue = new Array(0);
  if (window.addEventListener) window.addEventListener('DOMMouseScroll', addEvent, false);
  window.onmousewheel = document.onmousewheel = addEvent;
  if (!document.all){
    //not IE
    canvas[0].onmousedown = addEvent;
    canvas[0].onmousemove = addEvent;
    canvas[0].onmouseup   = addEvent;
    canvas[0].onmouseout  = addEvent;
    canvas[1].onmousedown = addEvent;
    canvas[1].onmousemove = addEvent;
    canvas[1].onmouseup   = addEvent;
    canvas[1].onmouseout  = addEvent;
    window.onkeydown      = addEvent;
  }else{
    //IE Only
    canvas[0].attachEvent('onmousedown', addEvent_forIE);
    canvas[0].attachEvent('onmousemove', addEvent_forIE);
    canvas[0].attachEvent('onmouseup',   addEvent_forIE);
    canvas[0].attachEvent('onmouseout',  addEvent_forIE);
    canvas[1].attachEvent('onmousedown', addEvent_forIE);
    canvas[1].attachEvent('onmousemove', addEvent_forIE);
    canvas[1].attachEvent('onmouseup',   addEvent_forIE);
    canvas[1].attachEvent('onmouseout',  addEvent_forIE);
    document.onkeydown      = addEvent_forIE;
  }
  if(document.getElementById("mode_play").addEventListener){
    document.getElementById("mode_play").addEventListener("click", function(){
      handleChangeMode(document.getElementById("modeform").mode[1].checked);
    });
    document.getElementById("mode_edit").addEventListener("click", function(){
      handleChangeMode(document.getElementById("modeform").mode[1].checked);
    });
  }else{
    //IE
    document.getElementById("mode_play").attachEvent("onclick", function(){
      handleChangeMode(document.getElementById("modeform").mode[1].checked);
    });
    document.getElementById("mode_edit").attachEvent("onclick", function(){
      handleChangeMode(document.getElementById("modeform").mode[1].checked);
    });
  }
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
        mouseWithShiftKey = e.shiftKey;
        mouseButton = e.button;
        mouseTarget = parseInt(e.target.id.substr(-1));
        handleMouseDown();
      break;
      case "mousemove": // dragging ---------
        mouseTarget = parseInt(e.target.id.substr(-1));
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
      mouseTarget = parseInt(e.target.id.substr(-1));
      if(isMouseDragged){
        isMouseDragged = false;
        mouseUpPos = [x,y];
        handleMouseUp();
      }
      break;
      case "mousewheel":
      mouseTarget = parseInt(e.target.id.substr(-1));
      mouseWheel = [e.wheelDeltaX, e.wheelDeltaY];
      handleMouseWheel();
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
    if(e.type=="keydown"){
      if(!isKeyTyping){
        eventQueue.push(e);
        lastEvent = e;//for debug
      }
    }else{
      eventQueue.push(e);
      lastEvent = e;//for debug
    }
  }
  if(e.type!="keydown"){
    if(e.preventDefault) e.preventDefault();
    e.returnValue = false;
  }
};
// sub routines
// addEvent(Event e)
var addEvent_forIE = function(){
  var e=new Object();
  e.type=event.type;
  e.x=event.offsetX;
  e.y=event.offsetY;
  e.keyCode = event.keyCode;
  e.target = event.srcElement;
  e.button=[-1,0,2,-1,1,-1,-1,-1][event.button];
  addEvent(e);
};

