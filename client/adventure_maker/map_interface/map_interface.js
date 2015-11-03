
moving = false;
gmap = null;
overlay = null;






Template.map.rendered = function() {
	
	//create an overlay for pasting the custom markers on the default ones.
	overlay =	new google.maps.OverlayView();
	overlay.draw = function(){};
			
	map_div = $('#map_div');
	//create the map, with events

	
	
	
	gmap = new GMaps({
		div: '#map',
		lat:  49.25890943151234,
		lng: -123.07334875920782,
		zoom: 16,
		click: function(e) {	//on click, add node		
			add_new_node_to_map(e.latLng.lat(), e.latLng.lng());
		},
		bounds_changed: function() { //make the markers follow the map, but don't bother drawing them while it's in motion.
			if(!moving){
				moving =true;
				$.each(gmap.markers, function(i,e) {
					e.setVisible(false); 
					e.overlay_div.hide();						
					});
			}
		 },
		 idle:  function() { //when we stop moving, show the markers again
			if(moving){
				moving = false;
				$.each(gmap.markers, function(i,e) {
					e.setVisible(true);
					e.overlay_div.show();
					move_marker_overlay_to_position_on_map(e);
				});
			}
		},
	});

	//create an overlay for pasting the custom markers on the defaul ones.
	overlay.setMap(gmap.map);	
	
	//add reactivity once it loads
	google.maps.event.addListenerOnce(gmap.map, 'idle', function(){		
		//add a reactive listener to update the map		
		add_reactive_map_dependency();
	});
	

	
}


function add_old_node_to_map(lat, lng, new_id, scroll){		
	if(typeof(scroll)==='undefined') scroll = true;
			
	var marker_overlay = jQuery('<div/>', {
		id: "marker_overlay"+new_id,
		class: 'node_marker node_link',
		text: ""+new_id
	}).appendTo(map_div);
					
	var marker = gmap.addMarker({			
		lat: lat, lng:lng, draggable: true, visible: true, 
		'position_changed': function(e){
			if(null != e){
				move_marker_overlay_to_position_on_map(e);
			}
		},
		'click': function(e){
			if(null != e){
				switch_page(e.node_id);
			}
		},			
		'dragend': function(e){
			if(null != e){				
				update_node_data_by_id(this.node_id, {$set: {location: [e.latLng.lat(), e.latLng.lng()]}});			
			}
		},			
	});
	
	marker.overlay_div = marker_overlay;
	marker.node_id = new_id;
	
	if(scroll) switch_page(new_id);
	
	move_marker_overlay_to_position_on_map(marker);
}

function add_new_node_to_map(lat, lng){	
	new_id = add_new_node_to_database(lat, lng);		
	add_old_node_to_map(lat, lng, new_id);		
}

function move_marker_overlay_to_position_on_map(marker){
	proj = overlay.getProjection();
	el = marker.overlay_div;		
	pos = proj.fromLatLngToContainerPixel(marker.getPosition());
	el.css({position: "absolute", left: (pos.x -8 + el.width()/2), top: (pos.y - 40  + el.height()/2)});
}


select_current_node_on_map = function(){
	pan_to_current_node();
	draw_current_links_on_map();
}

update_markers_on_map = function(current_node_locations){ //redraw everything when a node is added or removed. Not efficient, but whatever.
	
	//delete existing markers
	$.each(gmap.markers, function(i,e) {
		e.overlay_div.remove();
	});
	gmap.removeMarkers();

	//add new markers
	if(current_node_locations != null){
		current_node_locations.forEach(function(e){
			add_old_node_to_map(e.location[0], e.location[1], e.node_id, false);
		});
	}
}

pan_to_current_node = function(){
	if(typeof current_links !== 'undefined' && current_links != null){
		var dest = new google.maps.LatLng(current_links.location[0], current_links.location[1]);
		gmap.map.panTo(dest);
	}
}


draw_current_links_on_map = function(){ //assumes 
	gmap.removePolylines();
	if(typeof current_links !== 'undefined' && current_links != null){		
		var loc = current_links.location;
		
		//any	
		$.each(current_links.forward.required_any, function(i, e){
			draw_link(loc, current_links.locations[e], '#0B0', false);
		});		
		$.each(current_links.forward.prohibited_any, function(i, e){
			draw_link(loc, current_links.locations[e], '#B00', false);			
		});
		$.each(current_links.backward.required_any, function(i, e){
			draw_link(loc, current_links.locations[e], '#0B0', true);			
		});
		$.each(current_links.backward.prohibited_any, function(i, e){
			draw_link(loc, current_links.locations[e], '#B00', true);			
		});
		
		//all
		$.each(current_links.forward.required_all, function(i, e){
			draw_link(loc, current_links.locations[e], '#060', false);
		});		
		$.each(current_links.forward.prohibited_all, function(i, e){
			draw_link(loc, current_links.locations[e], '#600', false);			
		});
		$.each(current_links.backward.required_all, function(i, e){
			draw_link(loc, current_links.locations[e], '#060', true);			
		});
		$.each(current_links.backward.prohibited_all, function(i, e){
			draw_link(loc, current_links.locations[e], '#400', true);			
		});		
	}
}

var dashed_line = {
  path: 'M 0,-1 0,1',
  strokeOpacity: 0.9,
  scale: 3
};

function draw_link(from, to, color, dashed){
	
	if(typeof dashed === 'undefined' || !dashed){
		gmap.drawPolyline({
		  path: [from, to],
		  strokeColor: color,
		  strokeOpacity: 0.7,
		  strokeWeight: 8
		});
	} else {
		var line = gmap.drawPolyline({
		  path: [from, to],
		  strokeColor: color,
		  strokeOpacity: 0,
		  icons: [{
			icon: dashed_line,
			offset: '0',
			repeat: '20px'
		  }]
		});
	}
}

geo_code_search = function(address){
	GMaps.geocode({
	  address: address,
	  callback: function(results, status) {
		if (status == 'OK') {
		  var latlng = results[0].geometry.location;
		  gmap.setCenter(latlng.lat(), latlng.lng());     
		}
	  }
	});		
}
