"use strict";
var sx = require( "./shared" );
var should = require( "chai" ).should();

describe( "Given the app is configured", function() {

	sx.initServer( sx.testConfig1, sx.builder.testApp1Def(), sx.builder.testApp1Roles() );

	describe( "And I am user1 who is a super user, with some data stored in colours", function() {

		beforeEach( function() {

			sx.fakeDB.fakeUserEntitlements( this.config, {

				"user1" : { "roles" : [ "su" ] }

			} );
			sx.fakeDB.forceItems( this.config, "colours", "user1", {

				"item1" : { "value" : "blue" },
				"item2" : { "value" : "red" }

			} );
			( this.headers = this.headers || {} ).Authorization = sx.builder.user1Authorization();

		} );

		describe( "When I follow the colours link from the API endpoint", function() {

			beforeEach( function( done ) {

				sx.agent.get( this, this.root, function( err ) {

					if( err ) return done( err );
					var coloursLink = sx.linksForRel( this.res, "colours" )[ 0 ];
					sx.agent.get( this, coloursLink.href, done );

				}.bind( this ) );

			} )

			sx.request.shouldReturn200();
			sx.request.shouldReturnSelfLink();

			it( "Returns links to get the two items", function() {

				sx.request.linksForRel( this.res, "item1" ).length.should.equal( 1, "Expected link to item1" );
				sx.request.linksForRel( this.res, "item2" ).length.should.equal( 1, "Expected link to item2" );

			} );

		} );

	} );

} );