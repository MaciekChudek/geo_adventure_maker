
/*
 * TODO:  	 	
 * 	- make help system better
 *  - add users
 * 	- fix app
 *  - add any/all/multi logic to app  
 *  - fix google controls... maybe..
 * 
 * 
 *  - right-drag nodes from map to boxes?
 * 
 * 
 * 
 * 
 *  - zip files into a stream: https://coderwall.com/p/gs61bw
 *  - to get a stream: http://stackoverflow.com/questions/12755997/how-to-create-streams-from-string-in-node-js
 * 
var fs = __meteor_bootstrap__.require('fs');
fs.writeFileSync('/public/myfile.bin', data); 
 * http://stackoverflow.com/questions/18477896/download-files-from-server-using-meteor-js
 * https://github.com/eligrey/FileSaver.js/
*/


AdventureNodes = new Meteor.Collection("AdventureNodes");
AdventureMetaData = new Meteor.Collection("AdventureMetaData");

//Meteor.subscribe('Scenes');

link_types = ['required_all','required_any','prohibited_all','prohibited_any'];


node_prototype = {
	title: "The title of your story node goes here",
	message: "Your story message goes here.",
	image: "",
	required_all: [],
	required_any: [],
	prohibited_all: [],	
	prohibited_any: [],	
	location: [0, 0],
	proximity: 100,
	triggered: 0
}

meta_prototype = {
	title: "Enter the title of your GeoAdventure",
	author: "Fauxnym Psuedonomous",
	version: "1",
	location: 'The place where your GeoAdventure is set',
	published: false,
	author_id: 0,
	created: 0
}

