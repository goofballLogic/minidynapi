var child_process = require( "child_process" );

var config = process.env.testConfig
	? JSON.parse( process.env.testConfig )
	: require( "./test-config" );

var fakeDB = require( "../" + config.dbagent );

module.exports = {

	builder : require( "./builder" ),
	testConfig : config,
	agent: require( "./agent" ),
	fakeDB: fakeDB,
	once: once,
	request: require( "./request" ),
	initServer : function( config, appDefinition, roleEntitlements ) {

		after( function( done ) {

			if( !this.serverProcess ) return done();
			if( this.serverProcess.didExit ) return done();
			this.serverProcess.on( "exit", function() { done(); } );
			this.serverProcess.kill();

		} );

		before( function( done ) {

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

			fakeDB.init( config, appDefinition, function( err ) {

				if( err ) return done( err );
				fakeDB.fakeRoleEntitlements( config, roleEntitlements, function( err ) {

					if( err ) return done( err );
					try {

						this.serverProcess = child_process.fork( __dirname + "/launchAPI" );
						this.serverProcess.on( "exit", function() {

							this.serverProcess.didExit = true;

						}.bind( this ) );
						this.serverProcess.on( "error", function() {

							console.error( arguments );

						} );
						this.serverProcess.on( "message", function( message ) {

							if( !"start_API" in message ) return;
							done( message.err );

						}.bind( this ) );
						this.serverProcess.send( { start_API: config } );

					} catch( err ) {

						done( e );

					}

				}.bind( this ) );

			}.bind( this ) );

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