Session.set('active_node_id', -1);

Template.adventure_maker.created = function(){
	Session.set('active_meta_id', this.data._id);
	Session.set('active_node_id', 0);
	
	
	
	//some global variables
	computations = [];
	first_load = true;
	clicked = false;
	help_dialogue_delay_id = 0;	
	current_dragged_node = null;	
	drag_timer_id = 0;
	currentMousePos = { x: -1, y: -1 };
	current_links = null;
	map_update_computation = null;
	computations = [];
	
	
	computations.push(
		Deps.autorun(function() { //responds to node changes
			if(Meteor.userId() === null){
				Router.go('design');
			}
		})
	);
	
	
}

Template.adventure_maker.rendered = function(){
	close_trees();
}

Template.adventure_maker.destroyed = function(){
	remove_reactive_mapping();
	Session.set('active_node_id', -1);
}



///////////////All this stuff needs to be tidied up //////////////////////





switch_page = function(node_id){
	Session.set('active_node_id', node_id);
	current_node_id = node_id;
	select_tree_branch(node_id);
}




add_reactive_map_dependency = function(){ 
//update map when node_id, locations, or backlinks changes
//note, I carefully avoid querying all the node data here, so the map doesn't update when the text box contents change

	//redraw links
	computations.push(
		Deps.autorun(function() { //responds to node changes
			node_id = Session.get('active_node_id'); //new node selected
			
			if( node_id > 0){	
				current_links = get_node_links(node_id);	//any location changed			
				select_current_node_on_map();		
			}
		})
	);

	//redraw nodes when one is added or removed
	computations.push(
		Deps.autorun(function() {
			update_markers_on_map(get_node_locations());
					
			if( first_load && get_node_count() > 0){ //sets first node when data finishes loading, plus counting the nodes makes this computation get called whenever a node is added or removed.	
				first_load = false;			
				switch_page(get_first_node_id());			
			}
		})
	);
}

remove_reactive_mapping = function(){
	_.invoke(computations, 'stop');
}


