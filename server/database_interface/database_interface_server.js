

Meteor.publish('PublishedAdventures',function(){ return AdventureMetaData.find({published: true});});

Meteor.publish('MyAdventureNodes',function(meta_id){ 
	//create a new meta if needed
	if(meta_id == 'new' && this.userId != null){
		new_meta = meta_prototype;
		new_meta.author_id = this.userId;
		new_meta.created = new Date().getTime();
		meta_id = AdventureMetaData.insert(new_meta)
	}
	
	//make sure this is their adventure
	if(AdventureMetaData.find({_id: meta_id, author_id: this.userId}).count() > 0){
		return [
			AdventureNodes.find({meta_id: meta_id}),
			AdventureMetaData.find({_id: meta_id})
		];
	}
});

Meteor.publish('MyAdventureMetas',function(){ return AdventureMetaData.find({author_id: this.userId});});





AdventureMetaData.allow({
  update: function (userId, doc) { // can only change your own documents
    return doc.author_id === userId;
  },
  remove: function (userId, doc) {// can only remove your own documents
    return doc.author_id === userId;
  },
  fetch: ['author_id']
});



AdventureNodes.allow({ // can only edits nodes of your own adventures
  insert: function (userId, doc) { 
	 return AdventureMetaData.find({_id: doc.meta_id, author_id: userId}).count() > 0
  },  
  update: function (userId, doc) {
    return AdventureMetaData.find({_id: doc.meta_id, author_id: userId}).count() > 0
  },
  remove: function (userId, doc) {// can only remove your own documents
    return AdventureMetaData.find({_id: doc.meta_id, author_id: userId}).count() > 0
  },
  fetch: ['meta_id']
});




Meteor.methods({
	delete_node: function (meta_id, node_id) {
		AdventureNodes.remove({meta_id: meta_id, node_id: node_id});	
		AdventureNodes.update({meta_id: meta_id}, {$pull: {
			'prohibited_any': node_id, 
			'prohibited_all': node_id, 
			'required_any': node_id,			
			'required_all': node_id
			}
		});				
		
		
		//decrement all the higher nodes... but we'd need to adjust the links too...
		AdventureNodes.update({meta_id: meta_id,node_id: {$gt: node_id}}, {$inc: {node_id: -1}},{multi: true}); //decrement all the higher nodes
		
		
				//decrement the link references
		AdventureNodes.find({meta_id: meta_id}, {fields: {required_any: 1, required_all: 1,prohibited_any: 1, prohibited_all: 1}}).forEach(function(e) {			
			
			var new_links = {}			
			for(var i=0; i<link_types.length; i++) {
				l = link_types[i];
				if(typeof e[l] !== undefined){
					new_links[l] = e[l];
					for(var j=0; j<e[l].length; j++) {						
						if(e[l][j] >= node_id){ new_links[l][j]--;}
					}
				}
			}			
			
			AdventureNodes.update(
				{ "_id": e._id },
				{ "$set": new_links}
			);
		});
		
	}
});
