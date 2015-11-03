//all interface with the database should happen in this file



update_node_data_by_id= function(node_id, data){
	var id = AdventureNodes.findOne({meta_id: Session.get('active_meta_id'), node_id: node_id}, {fields: {_id: 1}})._id;
	return update_node_data(id, data);
}

update_node_data = function(node_id, data){
	return AdventureNodes.update(node_id, {$set: _.omit(data, '_id') });
}

delete_adventure_meta = function(meta_id){
	return AdventureMetaData.remove(meta_id);
}

update_meta_data = function(node_id, data){
	return AdventureMetaData.update(node_id, {$set: _.omit(data, '_id') });	
}

get_node = function(node_id){
	return AdventureNodes.findOne({meta_id: Session.get('active_meta_id'), node_id: node_id});
}

get_node_location = function(id){
	var node = AdventureNodes.findOne({meta_id: Session.get('active_meta_id'), node_id: id}, {fields: {location: 1}} );	
	if(typeof node !== undefined && node != null){
		return node.location;
	} else {
		return null;
	}
}

get_node_locations = function(){
	return AdventureNodes.find({meta_id: Session.get('active_meta_id')}, {fields: {node_id: 1, location: 1}} ).fetch();	
}

get_node_count = function(){
	return AdventureNodes.find({meta_id: Session.get('active_meta_id')}).count(); 
}

get_first_node_id = function(){
	return AdventureNodes.findOne(
		{meta_id: Session.get('active_meta_id')},
		{sort: {node_id: 1}},
		{fields: {node_id: 1}}
		).node_id; 
} 

get_node_links = function(id){

	var links = {
		node_id: id,
		location: [],
		locations: {},
		forward: {
			required_all: [],
			required_any: [],
			prohibited_all: [],
			prohibited_any: []
			}, 
		backward: {
			required_all: [],
			required_any: [],
			prohibited_all: [],
			prohibited_any: []
			}, 
	};
	
	forward_links = AdventureNodes.findOne(
	{
		meta_id: Session.get('active_meta_id'),
		node_id: id
	},
	{
		fields: {
			required_all: 1, 
			required_any: 1, 
			prohibited_all: 1,
			prohibited_any: 1,
			location: 1
		}
	});
	
	if(typeof forward_links === 'undefined'){ //no records found
		 return null;
	};
	
	links.location = forward_links.location;
	
	var all_links = [];
	
	$.each(link_types, function(i, e){
		if(typeof forward_links[e] !== undefined){
			links.forward[e] = forward_links[e];
			$.merge( all_links, forward_links[e]);
		}
	});	

	//construct forward locations array
	AdventureNodes.find(
	{
		meta_id: Session.get('active_meta_id'), 
		node_id: {$in: all_links}
	},
	{
		fields:{
			node_id: 1,
			location: 1
		}
	}).forEach(function(e){ links.locations[e.node_id] = e.location; });
	
	//construct backlinks data
	AdventureNodes.find(
	{
		meta_id: Session.get('active_meta_id'), 
		$or: [
			{required_all: {$in: [id]}}, 
			{required_any: {$in: [id]}}, 
			{prohibited_all: {$in: [id]}},
			{prohibited_any: {$in: [id]}}
		]
	},
	{
		fields:{
			node_id: 1, 
			required_all: 1, 
			required_any: 1, 
			prohibited_all: 1,
			prohibited_any: 1,
			location: 1
		}
	}).forEach(function(e)
	{ 
		links.locations[e.node_id] = e.location; 
		
		$.each(link_types, function(i, l){
			if($.inArray(id, e[l]) != -1){ //if it's a required link
				links.backward[l].push(e.node_id);
			}
		});			
	});
	
	return links;
}

add_new_link = function(id, type){
	if(Session.get('active_node_id') != id){ //can't link to yourself
		
		node_id = AdventureNodes.findOne({meta_id: Session.get('active_meta_id'), node_id: Session.get('active_node_id')}, {fields: {_id: 1}})._id;
	
		//remove it first
		AdventureNodes.update(node_id, {$pull: {
			'prohibited_all': id,
			'prohibited_any': id,
			'required_all': id,
			'required_any': id
			}});
		
		//then re-add it
		var query = {$push: {}};
		query.$push[type] = id;

		AdventureNodes.update(node_id, query);
		
	}
}

add_new_node_to_database = function(lat, lng){
	var last_node = AdventureNodes.findOne({meta_id: Session.get('active_meta_id')}, {
		sort: {node_id: -1},
		fields: {node_id: 1}
	});
	var new_id = 1;	
	if(typeof last_node !== 'undefined'){
		new_id = last_node.node_id + 1;
	}	
	var new_node = jQuery.extend({}, node_prototype);
	new_node.location = [lat, lng];
	new_node.meta_id = Session.get('active_meta_id');		
	new_node.node_id = new_id;		
	AdventureNodes.insert(new_node);
	return new_id;
}


Meteor.methods({
	/*
	 * Currently the bulk pull seems to only work on the server...
	 * Using workaround by manually calling  undocumented functions: .pauseObservers() and .resumeObservers()
	 * 
	 * May change at 1.0 release.
	 */
	delete_node: function (meta_id, node_id) {
		AdventureNodes.remove({meta_id: meta_id, node_id: node_id});	
		AdventureNodes._collection.pauseObservers();			
		AdventureNodes.update({meta_id: meta_id}, {$pull: {
			'prohibited_any': node_id, 
			'prohibited_all': node_id, 
			'required_any': node_id,				
			'required_all': node_id
			}
		});			
		
		//decrement all the higher nodes
		AdventureNodes.update({meta_id: meta_id, node_id: {$gt: node_id}}, {$inc: {node_id: -1}}, {multi: true});
			
		//decrement the link references
		
		AdventureNodes.find({meta_id: meta_id}, {fields: {required_any: 1, required_all: 1,prohibited_any: 1, prohibited_all: 1}}).forEach(function(e) {			
			
			var new_links = {}
			
			$.each(link_types, function(i, l){
				if(typeof e[l] !== undefined){
					
					new_links[l] = e[l];
					$.each(e[l], function(i){
						if(e[l][i] >= node_id){ new_links[l][i]--;}
					});
					
				}
			});
			
			var xx = AdventureNodes.update(
				{ "_id": e._id },
				{ "$set": new_links}				
			);
		});
		
		AdventureNodes._collection.resumeObservers();
}});


trash_node = function(id){
	if(Session.get('active_node_id') == id){ //kill the current one		
		bootbox.confirm("Delete node #"+id+"<br />Are you sure?", function(result) {
			if(result == true){
				Meteor.call('delete_node',Session.get('active_meta_id') , Session.get('active_node_id'));				
			}
		}); 
	} else {
		update_node_data_by_id(Session.get('active_node_id'), {$pull: {
			'prohibited_all': id,
			'prohibited_any': id,
			'required_all': id,
			'required_any': id
		}});
	}
}

