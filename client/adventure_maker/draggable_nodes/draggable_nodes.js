var ease = .5;


start_draging = function(event){
	clicked = false;
	currentMousePos = {x: event.pageX, y: event.pageY};
	current_dragged_node = $(event.currentTarget).clone();
	Meteor.setTimeout(function(){drag_node(event)}, 200);
}

function drag_node(event){
	if(clicked){
		stop_dragging();
	}else{
		if(current_dragged_node == null) { console.log('huh?'); } else{
		clear_help();
		current_dragged_node.appendTo("body");
		current_dragged_node.bind( "mouseup", stop_dragging);
		$(document).mousemove(function(event) {
			currentMousePos.x = event.pageX;
			currentMousePos.y = event.pageY;
		});
		Meteor.setTimeout(drag_move, 1000/30);
		current_dragged_node.css({position: "absolute", left: (currentMousePos.x - current_dragged_node.width()), top: (currentMousePos.y  - current_dragged_node.height())});		
		current_dragged_node.show();
	}}
}	


function drag_move(){
	if(current_dragged_node != null){
		var pos = current_dragged_node.position();
		var difx = 	(currentMousePos.x - current_dragged_node.width() - pos.left);
		var dify = 	(currentMousePos.y - current_dragged_node.height() - pos.top);			
		current_dragged_node.css({
			left: 	pos.left + ease * difx, 
			top: 	pos.top + ease * dify 
		});
		Meteor.setTimeout(drag_move, 1000/30);
	}
}


function is_it_inside(x, y, container){
	if(typeof container !== 'object' || typeof container.offset() === 'undefined') return false;
	
	
	
	var l = container.offset().left;
	var t = container.offset().top;
	var h = container.height();
	var w = container.width();
	
	return (x > l && x < l + w && y > t && y < t + h);
}

function get_dropped_container(x,y){
	required_all_box = $('#required_all_data_box');
	required_any_box = $('#required_any_data_box');
	prohibited_all_box = $('#prohibited_all_data_box');	
	prohibited_any_box = $('#prohibited_any_data_box');	
	trash_box = $('#trash_nodes_td');	
	
	if(is_it_inside(x,y,required_all_box)) return 'required_all';
	if(is_it_inside(x,y,required_any_box)) return 'required_any';
	if(is_it_inside(x,y,prohibited_all_box)) return 'prohibited_all';
	if(is_it_inside(x,y,prohibited_any_box)) return 'prohibited_any';
	if(is_it_inside(x,y,trash_box)) return 'trash';
	return null;
	
}

function process_drop_container(){
	x = current_dragged_node.position().left + current_dragged_node.width()/2;
	y = current_dragged_node.position().top + current_dragged_node.height()/2;
	
	node_id = parseInt(current_dragged_node.text());
	
	var dropped_in = get_dropped_container(x,y);
	
	if(dropped_in == null) return;
	//if(dropped_in == 'trash'){$.when(trash_node(node_id)).done(); return;}// jquery async launcher
	if(dropped_in == 'trash'){ // was using jquery async launcher (when().done()) here. Can't remember why.
		trash_node(node_id);		
		return;
	}
		 
	add_new_link(node_id, dropped_in);
}

function stop_dragging(){		
	if(current_dragged_node != null){							
		process_drop_container();
		$(document).unbind('mousemove');
		current_dragged_node.remove();
		current_dragged_node = null;
	 }
}
