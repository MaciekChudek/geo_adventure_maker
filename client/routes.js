Router.configure({
  layoutTemplate: 'layout',  
  loadingTemplate: 'loading'
});

Router.onBeforeAction('loading');

Router.map(function() {
	this.route('home', {path: '/'});
	this.route('about');
	this.route('talk');
	this.route('download', {path: '/download/:meta_id'} );
	
	this.route('play', {
		waitOn: function() { return Meteor.subscribe('PublishedAdventures');},
		data: function() { return {adventures: AdventureMetaData.find()}; }
		}
	);
	
	this.route('design', {
		waitOn: function() { return Meteor.subscribe('MyAdventureMetas');},
		data: function() { return {
			adventures: AdventureMetaData.find()
			}; }
		}
	);
	
	this.route('adventure_maker', {
		path: '/editor/:meta_id',
		layoutTemplate: 'layout_alt',
		waitOn: function() { return	Meteor.subscribe('MyAdventureNodes', this.params.meta_id); },	
		data: function() {
			return	AdventureMetaData.findOne({}, {sort: {created: -1}});
		}
	});
			
		
	//default root goes home
	this.route('home_default', {
		path: '*',
		template: 'home'
	});
});
