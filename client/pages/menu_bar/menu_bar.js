
Template.menu_bar.helpers({
	'adventure_maker_loaded': function() { return !Session.equals('active_node_id', -1);}
}); 
