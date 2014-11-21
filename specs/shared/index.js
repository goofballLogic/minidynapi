var API = require( "../../src/index" );
var fakeDB = require( "../fakes/dynamodb" );

module.exports = {

	builder : require( "./builder" ),
	testConfig1 : require( "./test-config-1" ),
	agent: require( "./agent" ),
	fakeDB: fakeDB,
	once: once,
	request: require( "./request" ),
	initServer : function( config, appDefinition, roleEntitlements ) {

		beforeEach( function( done ) {

			done = once( done );

			// init headers
			this.headers = this.headers || {};
			// ensure we have a namespace "ns"
			config.ns = config.ns || config.name;
			this.config = config;
			// the root URI is the base URI + the root app path
			this.root = config.baseUri + config.path;
			// store the app being used for this test
			this.testApp = appDefinition;
			// initialize the fake dynamodb agent
			fakeDB.init( config, appDefinition );
			fakeDB.fakeRoleEntitlements( config, roleEntitlements );
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

	},
	linksForRel: require( "./request" ).linksForRel,
	linksForURI: require( "./request" ).linksForURI

};

function once( func ) {

	var called = false;
	return function() {

		if( called ) throw new Error( "Called more than once" );
		called = true;
		func.apply( this, arguments );

	};

}