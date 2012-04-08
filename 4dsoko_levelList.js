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
var curLevelIndex = -1;// index of current level in list
// override XMLHttpRequest for IE -----------------------
if(typeof ActiveXObject == "function" && typeof XMLHttpRequest == "undefined"){
  XMLHttpRequest = function(){
    return new ActiveXObject("Microsoft.XMLHTTP")
  }
}
// initialize --------------
var initLevelList = function(){
  displayLevelListWait();
  downloadLevelList(displayLevelList);
}
/* -----------------------------------------------------------------
  Server Accesses
------------------------------------------------------------------*/
/* downloadLevelList() ---------------
   download level list from server.
   output: call back.
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
  try{
    req.send();
  }catch(e){
    var aaa=1;
  }
}
var displayLevelListWait=function(){
  document.getElementById("levellistdiv").innerHTML = "<center>Please wait a moment...</center>";
}
/* displayLevelList --------------------
  display current level list.
*/
var displayLevelList=function(){
  var htmlout="";
  htmlout += "<table width='90%' border=1 style='border-style:solid;border-color:#00FF00;border-collapse:collapse'><caption>Posted level list <small>(Please post your edit!)</small></caption>";
  htmlout += "<tr><th>Command</th><th>#</th><th>Title</th><th>Author</th><th>Description</th><th>Winners</th><th>delete</th>";
  var i=0;
  for(i=0;i<levelList.list.length;i++){
    htmlout += "<tr><td><input type=button value=load onclick='javascript:loadLevel("+i+");'></td><td>"+i+"</td>";
    htmlout += "<td>"+((levelList.list[i].name!=undefined&&levelList.list[i].name!="")?
      levelList.list[i].name:"(no name)")+"</td>";
    htmlout += "<td>"+((levelList.list[i].author!=undefined&&levelList.list[i].author!="")?
      levelList.list[i].author:"(no name)")+"</td>";
    htmlout += "<td style='text-align:left'>"+((levelList.list[i].description!=undefined&&levelList.list[i].description!="")?
      levelList.list[i].description:"-")+"</td>";
    htmlout += "<td>";
    for(w=0;w<levelList.list[i].winnerList.length;w++){
      if(w>0) htmlout += ", ";
      htmlout += levelList.list[i].winnerList[w];
    }
    htmlout += "</td><td><input type=button value=delete onclick='javascript:deleteLevel("+i+")'></td></tr>";
  }
  htmlout+="<tr><td><input value='add your edit' type=button onclick='javascript:addLevel();'></td><td>("+i+")</td>";
  htmlout+="<td><input type='text' id='newname' size='10' onfocus='javascript:isKeyTyping=true;' onblur='javascript:isKeyTyping=false;'></td>";
  htmlout+="<td><input type='text' id='newauthor' size='10' onfocus='javascript:isKeyTyping=true;' onblur='javascript:isKeyTyping=false;'></td>";
  htmlout+="<td><input type='text' id='newdescription' style='width:90%' onfocus='javascript:isKeyTyping=true;' onblur='javascript:isKeyTyping=false;'></td>";
  htmlout+="<td>&nbsp;</td><td>&nbsp;</td></tr></table>";
  document.getElementById("levellistdiv").innerHTML = htmlout;
}
/* uploadLevelList() --------------------
  upload the current level list
  to server.
*/
var uploadLevelList=function(callback){
  downloadLevelList();
  if(levelList==undefined || levelList.list==undefined) return;
  try {
    req = new XMLHttpRequest();
  }catch(e) {
    req = false;
  }
  req.onreadystatechange = function(){
    if (req.readyState == 4){
      if(req.status == 200){
        if(callback) callback();
      }
    }
  };
  req.open("POST", "./server/index.cgi");
  req.setRequestHeader("content-type","application/x-www-form-urlencoded;charset=utf-8");
  req.send("name=commonfile&data="+(JSON.stringify(levelList)));
}
/* -----------------------------------------------------------------
  Level List Controls
------------------------------------------------------------------*/
/* loadLevel(i) --------------------
  set the current level
  into the level selected by number i
  from current level list.
*/
var loadLevel = function(i){
  if(levelList == undefined || levelList.list == undefined) return;
  map = levelList.list[i].map.clone();
  if(mode==0) readyPlay();
  isRequestedDraw = true;
  curLevelIndex = i;
}
/* addLevel() --------------------
  add the current level into the
  current level list, upload to
  server, and display the current
  level list.
*/
var addLevel = function(){
  downloadLevelList(addLevel2); // check others update.
}
var addLevel2 = function(){
  var level = new Level(
    map.clone(), 
    document.getElementById("newname").value,
    document.getElementById("newauthor").value,
    document.getElementById("newdescription").value
  );
  levelList.list.push(level);
  displayLevelListWait();
  uploadLevelList(displayLevelList);
}
/* deleteLevel(i) --------------------
  add the current level into the
  current level list, upload to
  server, and display the current
  level list.
*/
var iDeletedLevel;
var deleteLevel = function(i){
  iDeletedLevel = i;
  downloadLevelList(deleteLevel2); // check others update.
}
var deleteLevel2 = function(){
  var i=iDeletedLevel;
  if(levelList == undefined || levelList.list == undefined) return;
  if(window.confirm("delete No."+i+" (name="+levelList.list[i].name+") ?")){
    levelList.list.splice(i,1);
    displayLevelListWait();
    uploadLevelList(displayLevelList);
  }
}
var winnerName = "";
var addWinner = function(){
  downloadLevelList(addWinner2);
}
var addWinner = function(){
  if(levelList == undefined || levelList.list == undefined) return;
  levelList.list[curLevelIndex].winnerList.push(winnerName);
  displayLevelListWait();
  uploadLevelList(displayLevelList);
}



