var express = require( "express" );

function API() { }
API.prototype.init = function( config, callback ) {

	this.app = express();
	config = JSON.parse( JSON.stringify( config ) );
	configure( this.app, config, function( err ) {

		if( err ) throw err;
		// config complete - so create the app
		this.server = this.app.listen( config.port, function() {

			// callback with the listening server
			callback( this.server );

		}.bind( this ) );

	}.bind( this ) );

}

function configure( app, config, callback ) {

	if( !config.name ) throw new Error( "No app name specified" );
	config.ns = config.ns || config.name;
	config.dbagent = require.resolve( config.dbagent );
	var dbagent = require( config.dbagent );

	// fetch the app definition
	dbagent.fetchAppDefinition( config, function( err, definition ) {

		if( err ) return callback( err );

		// store definition
		app.set( "def", definition );
		// define handlers
		[

			"authenticate",
			"fetch-entitlements",
			"app",
			"sets"

		]
			.map( function( builder ) { return require( "./handlers/" + builder ); } )
			.forEach( function( builder ) { builder( app, config ); } );
		// configuration complete
		callback();

	} );

}
module.exports = API;
