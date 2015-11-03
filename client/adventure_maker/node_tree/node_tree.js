
tree_container = null;

Template.node_tree.rendered = function () {
	tree_container = $("#node_tree_div");
};




close_trees = function(){
	$(".node_links_div").slideUp();
}

select_tree_branch = function(id){
	branch  = $("#links_div_"+id);
	if(branch.length>0){
		close_trees();
		branch.slideDown();
		if(tree_container != null) {
			tree_container.animate({
				scrollTop: branch.offset().top
			}, 1000);
		};
	};
}
