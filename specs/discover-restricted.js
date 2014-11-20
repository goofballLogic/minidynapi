var sx = require( "./shared" );
var should = require( "chai" ).should();

describe( "Given the app is configured", function() {

	sx.initServer( sx.testConfig1, sx.testApp1 );

	describe( "And I am a user without access to get the API", function() {

		beforeEach( function() {

			sx.fakeDB.fakeEntitlements( this.config.ns, {

				"user1" : { "APIGET" : false }

			} );
			( this.headers = this.headers || {} ).Authorization = sx.builder.user1Authorization();

		} );

		describe( "When I GET the app endpoint", function() {

			beforeEach( function( done ) {

				sx.agent.get( this, this.root, done );

			} );

			sx.request.shouldReturn200();

			it( "Then it should return none of the set links", function() {

				var res = this.res;
				this.testApp.sets.forEach( function( set ) {

					sx.linksForSet( res, set ).should.be.empty();

				} );

			} );

		} );

	} );

	describe( "And I am user2 who has read-only access to colours, but no access to friends", function() {


		beforeEach( function() {

			sx.fakeDB.fakeEntitlements( this.config.ns, {

				"user2" : { "roles" : [ "colour-reviewer" ] },
				"colour-reviewer" : {

					"APIGET" : true,
					"sets" : [ {
						name: /^colours$/,
						CRUD: "r"

					} ]

				}

			} );
			( this.headers = this.headers || {} ).Authorization = sx.builder.user2Authorization();

		} );

		describe( "When I GET the app endpoint", function() {

			beforeEach( function( done ) {

				sx.agent.get( this, this.root, done );

			} );

			sx.request.shouldReturn200();

			it( "Then it should only return the colours set link", function() {

				var res = this.res;
				this.testApp.sets.forEach( function( set ) {

					var actual = sx.linksForSet( res, set );
					if( set == "colours" ) actual.length
						.should.equal( 1, "Expected link to colours set" );
					else actual.length
						.should.equal( 0, "Unexpected link to set " + set );

				} );

			} );

		} );

	} );

} );