 var Module =(function(filename){
   //A simple extendable javascript array customized for the dependency management
   var Filename = filename;
   var CreateContainer=(function(){
    var __array= new Array();
    __array.contains =(function(filename){
      if(typeof filename!="string")
        new TypeError("Invalid parameter type provided: contains require a string argument");        
      for(var i =0; i < this.length; i++){
        var value= this[i];
        if(value==filename){
          return true;
        }
      }
      return false;
    }).bind(__array);
    //add filename

    __array.remove =(function(filename){
      var index = this.indexOf(filename);
      if(index >=0){
       this.splice(index,1);
     }
   }).bind(__array);

    //add filename
    __array.add=(function(filename){
      if(typeof filename !="string")
        new TypeError("@add : Invalid argument type provided expected a string argument");
      if(!this.contains(filename)){
       this.push(filename);
     }
   }).bind(__array);

    //remove all element
    __array.removeAll=(function(){
     var end = (this.length <=0)?0: this.length;
     this.splice(0,end);
   }).bind(this);

    __array.removeObject=(function(tagId){
     for(var i=0; i < this.length; i++){
      var valueObj = this[i];
      if(typeof valueObj=="object"){
       if(valueObj.id ==tagId){
        this.splice(i,1);
        return;
      }
    }
  }
}).bind(__array);

    return __array;
  });


 /*Inner build dictionary*/

 var CreateDictionary=(function(){
  var contain = CreateContainer();
  contain.addItem =(function(key, entry){
    if(!this.exists(key)){          
     this.add({"key":key, "entry":entry});
   }
 }).bind(contain);

  contain.removeItem =(function(key){
   for(var i=0; i < this.length; i++){
    var obj = this[i];
    if(obj.key==key) {
     this.splice(i,1);
     return ;
   };
 }
}).bind(contain);

  contain.exists=(function(key){
    for(var i=0; i < this.length; i++){
      var obj = this[i];
      if(obj.key==key) return true;
    }
    return false;
  }).bind(contain);

  contain.hasItems =(function(uid){
    var container = this.getEntry(uid);
    if(container!=null && container.length>0)
     return true;
   return false;

 }).bind(contain);
      // Import the file if they have not already imported

      contain.loadAll= (function(uid){
       var value = this.getEntry(uid) || [];
       var tag = document.getElementById(uid);
       if(tag) Module.Current = tag;            
       value.map((function(filename){ 
         LoadFile(filename);
       }));
       this.removeItem(uid);
     }).bind(contain);
      contain.getEntry=(function(key){
       for(var i=0; i < this.length; i++){
        var obj = this[i];
        if(obj.key===key) return obj.entry;
      }
      return null;
    }).bind(contain)

      return contain;
    });



//Check if the file to load is a javascript file else throw error
var IsFile =(function(filename){
  if(typeof filename =="string"){      
    var pattern =/(([\/|\\]*)([\w\d_\.]))*\.(js)$/;
    return (pattern.test(filename));
  }
  return false;

});
/*Get the current file that called the Module statement or function*/
var GetCurrentFile =(function(){
  var error = new Error()
  , source
  , lastStackFrameRegex = new RegExp(/.+\/(.*?):\d+(:\d+)*$/)
  , currentStackFrameRegex = new RegExp(/getScriptName \(.+\/(.*):\d+:\d+\)/);
  if((source = lastStackFrameRegex.exec(error.stack.trim())) && source[1] != "")
    return source[1];
  else if((source = currentStackFrameRegex.exec(error.stack.trim())))
    return source[1];
  else if(error.fileName != undefined)
    return error.fileName;
});

var GetFileInfo = (function(filename){
  var obj={ext:null, basename:"", filename:""}
  if(typeof filename === "string"){
   var dotIndex = filename.lastIndexOf(".");
   if(dotIndex >=0){
     obj.basename = filename.substr(0, dotIndex);
     obj.extension = filename.substr(dotIndex+1, filename.length);
   }
 }
 return obj;
});

var ResolveFile=(function(basename){   
  if(typeof basename =="string")
   return basename.replace(/[\\\/]*/g,"");
 return "";
})
var CreateScriptKey=(function(filename){
  return ResolveFile(GetFileInfo(filename).basename);
});

/*The create the screen and when its has finished loaded it will append it to the document*/
var CreateScript =(function(filename){
  if(!Module.Counter)Module.Counter=0;  
  if(filename !="" && (typeof filename =="string")){    
    var script = document.createElement("script");        
    if(script){  
     var uid =CreateScriptKey(filename);         
     script.setAttribute("id",uid);          
     script.setAttribute("type","text/javascript");
     script.orginalFile = filename;
     script.onload = (function(){

     }).bind(script);
      script.onerror=(function(){
        var uid  = GetScriptID(this.orginalFile);
         if(uid){
           var script  = document.getElementById(uid);
           if(script)script.remove();
         }
      console.warn("@Script: Unable to load file ["+this.src+"]");
    }).bind(script);
       //added the script to the header element;
       script.setAttribute("src", filename+"?timespan="+uid+(Module.Counter++) ); 
       var parent = document.head || document.body;
       Module.Imported.add({"id":uid.toLowerCase(), "filename":filename});
       if(!Module.Current){
         parent.appendChild(script)
         Module.Current =script;
         return ;
       }
       Module.Current.parentNode.insertBefore(script,Module.Current);
     }}
   });


var GetScriptID=(function(filename){
  for(var i=0; i < Module.Imported.length; i++){
    var value= Module.Imported[i];
    if(value.filename== filename.toLowerCase()){
     return value.id;
   }
 }
 return null;
});

var IsLoaded =(function(filename){
  return Module.loadFiles.contains(filename.toLowerCase());
});
 //This load the file into the document
 var LoadFile =(function(filename){ 
  if(IsLoaded(filename))return ;
  Module.loadFiles.add(filename.toLowerCase());
  if(GetScriptID(filename)==null){      
    CreateScript(filename);
  }
});
 //remove filename timestamps
 var  RemoveTime=(function(filename){
  return filename.split(/(\?)/)[0];
});

//Create the Module Fiellds
if(!Module.loadFiles)Module.loadFiles  = CreateContainer();
if(!Module.Imported)Module.Imported     = CreateContainer();
if(!Module.dependency)Module.dependency = CreateDictionary();

var CatchDependency =(function()
{
 var fileself = RemoveTime(GetCurrentFile());         
 if(IsFile(fileself) && fileself != Filename.toLowerCase())
 {  
   var  uid = CreateScriptKey(fileself);
   var entry= Module.dependency.getEntry(uid);
   if(entry==null){       
     entry = CreateContainer();          
     Module.dependency.addItem(uid,entry);
   }
   if(entry)
     entry.add(Filename);
 }
 return fileself;
});


return{
 "import":(function(){            
  var fileself =  CatchDependency();
  if(IsFile(fileself)){
   var  uid = CreateScriptKey(fileself);
   if(Module.dependency.hasItems(uid)){               
     Module.dependency.loadAll(uid);
   }               
 }else
 LoadFile(Filename);                        
})
    }//end return;

  });
 //The autoload method that will generated the javascript functions base on their 

 Module.cleanUp =(function(){ 
   delete Module.dependency;
   delete Module.loadFiles;
   delete Module.Imported;
   delete Module.Current;
   Module.Counter=0;

 });


