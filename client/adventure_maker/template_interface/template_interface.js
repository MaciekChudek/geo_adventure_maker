//tidy this up...


Template.meta_information.meta_nodes = function(){
	return AdventureMetaData.find({_id: Session.get('active_meta_id')});
	}

Template.node_tree.adventure_nodes = function () {return AdventureNodes.find({meta_id: Session.get('active_meta_id')},{sort: {node_id: 1}})};

	
Template.node_information.adventure_nodes = function () {return AdventureNodes.find({meta_id: Session.get('active_meta_id'), node_id: Session.get('active_node_id')})};

// Fires when 'accept' is clicked, or a key is pressed
  

Template.node_information.helpers({
	'isChecked': function() { if(this.triggered == 1){ return 'checked';} else {return '';};}
}); 

Template.meta_information.helpers({
	'isChecked': function() { if(this.publish){ return 'checked';} else {return '';};}
}); 

Template.node_link.events({
	'click div.node_link': function (event) {clicked = true; switch_page(parseInt(event.currentTarget.innerHTML))},
	'mousedown div.node_link': function (event) { start_draging(event); },
});

Template.adventure_maker_menu.events({
	'keypress #seach_input': function (e) { if(e.key == "Enter") {geo_code_search($('#seach_input').val())} },
	'click #search_button': function () { geo_code_search($('#seach_input').val()) },
	'click #help_question_mark': function () { 
		bootbox.alert(help_messages.main);		
		 },
	'click #export_button': function () { 
		bootbox.alert(export_all_to_html());
		}
});



Template.meta_information.events({
	'keyup #meta_title_input': function (event) { update_meta_field('title', this, event); },	
	'keyup #meta_author_input': function (event) { update_meta_field('author', this, event); },	
	'keyup #meta_version_input': function (event) { update_meta_field('version', this, event); },
	'keyup #meta_location_input': function (event) { update_meta_field('location', this, event); },
	'change #publish_checkbox': function (event) {
		update_meta_data(this._id, {published: (event.currentTarget.checked)});
	}
});

Template.node_information.events({
	'keyup #title_data_input': function (event) { update_text_field('title', this, event); },	
	'keyup #image_data_input': function (event) { update_text_field('image', this, event); },	
	'keyup #proximity_data_input': function (event) { update_text_field('proximity', this, event); },	
	'keyup #message_data_textarea': function (event) { update_text_field('message', this, event); },	
	'change #triggered_data_checkbox': function (event) { 			
		update_node_data(this._id, {triggered: +(event.currentTarget.checked)});
	}
});

function update_meta_field(field, data, event){
	var id = data._id;
	data = {};
	data[field] = $(event.currentTarget).val();
	update_meta_data(id, data);	
}

function update_text_field(field, data, event){	
	var id = data._id;
	data = {};
	data[field] = $(event.currentTarget).val();
	update_node_data(id, data);	
}
