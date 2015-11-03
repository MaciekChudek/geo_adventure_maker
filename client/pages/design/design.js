Template.design.created = function(){
		
}

Template.design.events({
	'click .delete_link': function (e,i) { 		
		var meta_id = this._id;
		bootbox.confirm("Do you really want to delete this entire adventure? This is irreversible.",function(result) {
			if(result == true){
				delete_adventure_meta(meta_id);
			}
		});
	}
});
