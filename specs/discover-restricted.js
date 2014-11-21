var sx = require( "./shared" );
var should = require( "chai" ).should();

describe( "Given the app is configured", function() {

	sx.initServer( sx.testConfig1, sx.builder.testApp1Def(), sx.builder.testApp1Roles() );

	describe( "And I am a user without access to get the API", function() {

		beforeEach( function() {

			sx.fakeDB.fakeUserEntitlements( this.config, {

				"user1" : { "APIGET" : false }

			} );
			this.headers.Authorization = sx.builder.user1Authorization();

		} );

		describe( "When I GET the app endpoint", function() {

			beforeEach( function( done ) {

				sx.agent.get( this, this.root, done );

			} );

			sx.request.shouldReturn200();

			it( "Doesn't return any of the set links", function() {

				var res = this.res;
				this.testApp.sets.forEach( function( set ) {

					sx.linksForRel( res, set ).should.be.empty();

				} );

			} );

		} );

	} );

	describe( "And I am user2 who has read-only access to colours, but no access to friends", function() {

		beforeEach( function() {

			sx.fakeDB.fakeUserEntitlements( this.config, {

				"user2" : { "roles" : [ "colour-reviewer" ] },

			} );
			this.headers.Authorization = sx.builder.user2Authorization();

		} );

		describe( "When I GET the app endpoint", function() {

			beforeEach( function( done ) {

				sx.agent.get( this, this.root, done );

			} );

			sx.request.shouldReturn200();

			it( "Only returns the colours set link", function() {

				var res = this.res;
				this.testApp.sets.forEach( function( set ) {

					var actual = sx.linksForRel( res, set );
					if( set == "colours" ) actual.length
						.should.equal( 1, "Expected link to colours set" );
					else actual.length
						.should.equal( 0, "Unexpected link to set " + set );

				} );

			} );

		} );

	} );

} );