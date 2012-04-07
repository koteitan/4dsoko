/*----------------------------------
  4dsoko_levelList.js
  level list control with access server
----------------------------------*/
/* words ----------------
  level              : the arrangement of the boxes, walls, goals and player.
  current level      : the level which is displayed on canvas now.
  current level list : the list of levels which is displayed bottom of the page.
  level list server  : server. server has a level list.
*/
//classes --------------------
var LevelList = function(){
  this.list = [];
}
var Level = function(_map, _name, _author, _description){
  this.map = _map;
  this.name = _name;
  this.author = _author;
  this.description = _description;
  this.winnerList = [];
}
//static var ---------------------
var response;  // for http 
var req;       // for http 
var levelList; // current level list

// override XMLHttpRequest for IE -----------------------
if(typeof ActiveXObject == "function" && typeof XMLHttpRequest == "undefined"){
  XMLHttpRequest = function(){
    return new ActiveXObject("Microsoft.XMLHTTP")
  }
}
// initialize --------------
var initLevelList = function(){
  downloadLevelList(displayLevelList);
}
/* downloadLevelList() ---------------
   download level list from server.
   output: call loadLevelList2(json string).
*/
var downloadLevelList = function(callback){
  try {
    req = new XMLHttpRequest();
  }catch(e) {
    req = false;
  }
  req.onreadystatechange = function(){
    // listener
    if (req.readyState == 4){
      var jsonstr = "";
      if(req.status == 200) jsonstr = req.response;
      if(jsonstr!=""){
        // successfully downloaded
        levelList = eval("("+jsonstr+")"); // change current level list 
        if(levelList==undefined || levelList=="" || levelList.list==undefined){
          // broken file
          levelList = new LevelList();
        }
      }else{
        // fail to download 
        levelList = new LevelList();
      }
      callback();
    }
  };
  req.open("GET", "./server/commonfile");
  req.setRequestHeader("content-type","application/x-www-form-urlencoded;charset=utf-8");
  req.send();
}
/* displayLevelList --------------------
  display current level list.
*/
var displayLevelList=function(){
  var htmlout="";
  htmlout += "<table><caption>Posted level list <small>(Please post your edit!)</small></caption><tr><th>Command</th><th>Level Name</th><th>Author</th><th>Description</th><th>Winners</th>";
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
  htmlout+="<tr><th><input value='add your edit' type=button onclick='javascript:addLevel();'></th>";
  htmlout+="<th><input type='text' id='newname' size='10' onfocus='javascript:isKeyTyping=true;' onblur='javascript:isKeyTyping=false;'></th>";
  htmlout+="<th><input type='text' id='newdescription' size='30' onfocus='javascript:isKeyTyping=true;' onblur='javascript:isKeyTyping=false;'></th>";
  htmlout+="<th></th></tr></table>";
  document.getElementById("levellistdiv").innerHTML = htmlout;
}
/* loadLevel() --------------------
  set the current level
  into the level selected by number i
  from current level list.
*/
var loadLevel = function(i){
  if(levelList == undefined || levelList.list == undefined) return;
  map = levelList.list[i].map.clone();
  if(mode==0) readyPlay();
  isRequestedDraw = true;
}
/* loadLevel() --------------------
  add the current level into the
  current level list, upload to
  server, and display the current
  level list.
*/
var addLevel = function(){
  if(document.getElementById("newname")=="") return;
  var level = new Level(map, document.getElementById("newname").value, document.getElementById("newdescription").value);
  levelList.list.push(level);
  uploadLevelList();
  displayLevelList();
}
/* loadLevel() --------------------
  upload the current level list
  to server.
*/
var uploadLevelList=function(){
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
