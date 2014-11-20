var API = require( "../../src/index" );
var fakeDB = require( "../fakes/dynamodb" );

module.exports = {

	builder : require( "./builder" ),
	testConfig1 : require( "./test-config-1" ),
	testApp1: require( "./test-app-1" ),
	agent: require( "./agent" ),
	fakeDB: fakeDB,
	initServer : function( config, app, entitlements ) {

		beforeEach( function( done ) {

			// ensure we have a namespace "ns"
			config.ns = config.ns || config.name;
			this.config = config;
			// the root URI is the base URI + the root app path
			this.root = config.baseUri + config.path;
			// store the app being used for this test
			this.testApp = app;
			// initialize the fake dynamodb agent
			fakeDB.init( config.ns, app );

			try {

				// create the API
				var api = new API();
				// initialize with the config
				api.init( config, function( server ) {

					this.server = server;
					done();

				}.bind( this ) );

			} catch( e ) {

				done( e );

			}

		} );

		afterEach( function() {

			if( this.server ) this.server.close();

		} );

	}
};