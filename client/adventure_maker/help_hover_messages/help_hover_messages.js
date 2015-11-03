help_messages = {
		"main": 
			"<p>To add a node, just click on the map. "+
			"To reposition a node, just drag it on the map.</p> "+
			"<p>To select a node, just click on it. Then you can edit its content (story, image, etc), by using the edit panel at the bottom of the screen.</p>" +			
			"<p>To make a required or prohibited link from the node you're editing, just drag another node from the node tree to one of the four containers in the bottom left. </p>"  +
			"<p>To delete a required (or prohibited) link, select the node that's doing the requiring, then drag the linked node from its required container into the trash.</p>" +
			"<p>To delete an entire node: first select it, then drag it to the trash.</p>"+
			"<p>Nodes are triggered (i.e., theor story text appears as a message on the android device) when:  either a) any of the 'Required any' nodes have been triggered, or b) all of their Required all' nodes have been triggered, so long as c) none of their 'Prohibited any' nodes are triggered, or d) fewer than all of their 'Prohibited all' nodes are triggered.  </p>"+
			"<h4>TODO</h4><p>The export button doesn't work yet. Currently you just enter an image name and then have to put the image files into zip manually. I'm very open to suggestions on how to make this not so damn ugly. Also, user-account-login system. The actual app needs to be upgraded slightly to fit with the new any/all logic.</p>"
	}


Meteor.startup(function () {
	help_dialogue = $('#help_dialogue_div');			
});

clear_help = function(){
	Meteor.clearTimeout(help_dialogue_delay_id);
	help_dialogue.hide();
}

get_help = function(){	
	help_dialogue_delay_id = Meteor.setTimeout(function() {			
		help_dialogue.css({position: "absolute", left: '10%', top: '10%'});
		help_dialogue.html(help_messages["main"]);
		help_dialogue.show();
	}, 1000);
}



/*
get_help = function(message_id, x, y){
	return 0;
	if(current_dragged_node == null){
		help_dialogue_delay_id = Meteor.setTimeout(function() {			
			if(current_dragged_node == null){
				help_dialogue.css({left: x, top: y});
				help_dialogue.text(help_messages[message_id]);
				help_dialogue.show();
			}
		}, 3000);
	}
}
*/
