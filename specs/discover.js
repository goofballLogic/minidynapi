var shared = require( "./shared" );
var should = require( "chai" ).should();

describe( "Given the app is configured", function() {

	shared.initServer( shared.testConfig1, shared.testApp1 );

	describe( "And I am user1", function() {

		beforeEach( function() {

			shared.fakeDB.fakeEntitlements( this.config.ns, {

				"user1" : { "roles" : [ "su" ] },
				"su" : { "APIGET" : true }

			} );
			this.headers = this.headers || {};
			this.headers.Authorization = shared.builder.user1Authorization();

		} );

		describe( "When I GET the app endpoint", function() {

			beforeEach( function( done ) {

				shared.agent.get( this, this.root, done );

			} );

			it( "Then it should return GET links for each configured collection", function() {

				this.res.status.should.equal( 200, "Wrong status code" );
				var links = this.res.body.links;
				this.testApp.sets.forEach( function( set ) {

					( links || [] )
						.filter( function( link ) { return set === link.rel; } )
						.should.have.length( 1, "Missing link with rel " + set );

				} );

			} );

		} );

	} );


} );