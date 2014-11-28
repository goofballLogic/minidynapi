var API = require( "../../src/index" );

process.on( "message", function( message ) {

	if( !"start_API" in message ) return;
	try {

		// create the API
		var api = new API();
		// initialize with the config
		var config = message.start_API;
		api.init( config, function( server ) {

			process.send( { "start_API" : true } );

		} );

	} catch( err ) {

console.error( err );
		process.send( { "start_API" : false, "err" : err } );

	}

} );
