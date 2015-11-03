
meta_keys = ['title', 'author', 'version'];
meta_cols = ['variable','value'];
link_cols = ['node','type','value'];

node_keys = ['node_id','title','location','message','image','proximity','triggered'];
node_cols = ['id','title','location','message','image','proximity', 'triggered'];

export_all_to_html = function(){
	var output = "<h1>meta.csv</h1><pre>";
	output += escapeHtml(export_meta_csv());
	output += "</pre><h1>nodes.csv</h1><pre>";
	output += escapeHtml(export_node_csv());
	output += "</pre><h1>links.csv</h1><pre>";
	output += escapeHtml(export_link_csv());
	return nl2br(output);
}

export_link_csv = function(){
	var csv = write_array_to_csv(link_cols);
	
	AdventureNodes.find(
	{
		meta_id: Session.get('active_meta_id')
	},
	{
		fields:{
			node_id: 1, 
			required_all: 1, 
			required_any: 1, 
			prohibited_all: 1,
			prohibited_any: 1,
		}
	}).forEach(function(e)
	{ 
		$.each(link_types, function(i, l){
			$.each(e[l], function(i, v){
				csv += write_array_to_csv( [e.node_id, l, v]);
			});
		});
	});
	
	return csv;
}

export_node_csv = function(){
	var csv = write_array_to_csv(node_cols);
	AdventureNodes.find({meta_id: Session.get('active_meta_id')}).forEach(
	function(e){
		csv += write_object_to_csv(e, node_keys);
	});
	return csv;
}

export_meta_csv = function(){
	var csv = write_array_to_csv(meta_cols);
	data = AdventureMetaData.findOne({_id: Session.get('active_meta_id')});
	$.each(meta_keys, function(i, e){
		csv += '"';
		csv += e;
		csv += '","';
		csv += data[e].replace('"',"'"); //sorry, only single quotes.		
		csv += '"\n';		
	});
	return csv;
}


write_object_to_csv = function(items, keys){
	var csv = '"';
	for (var i = 0, itemLen = keys.length; i < (itemLen-1); i++) {
		csv += items[keys[i]];
		csv += '", "';
	}
	csv += items[keys[itemLen-1]];
	csv += '"\n';
	return csv;	
}



write_array_to_csv = function(items){
	var csv = '"';
	for (var i = 0, itemLen = items.length; i < (itemLen-1); i++) {
		csv += items[i];
		csv += '", "';
	}
	csv += items[itemLen-1];
	csv += '"\n';
	return csv;
}

function nl2br (str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}



function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }


