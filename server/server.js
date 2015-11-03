Meteor.startup(function () {


//AdventureNodes.remove({});
//AdventureMetaData.remove({});

	
	if(AdventureMetaData.find().count() == 0){
		AdventureMetaData.insert(
		{
			title: "Super Great Adventure",
			author: "Maciek Chudek",
			version: "1",
			location: 'Vancouver, Canada',
			published: true,
			author_id: 0
		}
	);
	
	AdventureMetaData.insert(
		{
			title: "Invisible Adventure",
			author: "Maciek Chudek",
			version: "1",
			location: 'Vancouver, Canada',
			published: false,
			author_id: 0
		}
	);
		
	}


});




