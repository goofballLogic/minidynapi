"use strict";
var sx = require( "./shared" );
var should = require( "chai" ).should();

describe( "Given the app is configured", function() {

	sx.initServer( sx.testConfig1, sx.builder.testApp1Def(), sx.builder.testApp1Roles() );

	describe( "And I am user2 who is a colours-reviewer, with some data (item1, item2) stored in colours", function() {

		beforeEach( function() {

			sx.fakeDB.fakeUserEntitlements( this.config, {

				"user2" : { "roles" : [ "colour-reviewer" ] }

			} );
			sx.fakeDB.resetItems( this.config, "colours" );
			sx.fakeDB.forceItems( this.config, "colours", "user2", {

				"item1" : { "value" : "blue" },
				"item2" : { "value" : "red" }

			} );
			sx.fakeDB.forceItems( this.config, "colours", "user1", {

				"item1" : { "value" : "purple" }

			} );
			this.headers.Authorization = sx.builder.user2Authorization();

		} );

		describe( "When I follow the colours link from the API endpoint", function() {

			beforeEach( function( done ) {

				sx.agent.get( this, this.root, function( err ) {

					if( err ) return done( err );
					var coloursLink = sx.linksForRel( this.res, "colours" )[ 0 ];
					sx.agent.get( this, coloursLink.href, function( err ) {

						this.item1Link = sx.linksForRel( this.res, "item1" )[ 0 ];
						done( err );

					}.bind( this ) );

				}.bind( this ) );

			} );

			sx.request.shouldReturn200();
			sx.request.shouldReturnSelfLink();

			it( "Returns links to the two items", function() {

				sx.request.linksForRel( this.res, "item1" ).length.should.equal( 1, "Expected link to item1" );
				sx.request.linksForRel( this.res, "item2" ).length.should.equal( 1, "Expected link to item2" );

			} );

			it( "Only allows get for the items", function() {

				sx.request.linksForRel( this.res, "item1" )[ 0 ].verbs
					.should.eql( [ "get" ], "item1" );
				sx.request.linksForRel( this.res, "item2" )[ 0 ].verbs
					.should.eql( [ "get" ], "item2" );

			} );

			describe( "And I follow the link to get item1", function() {

				beforeEach( function( done ) {

					sx.agent.get( this, this.item1Link.href, done );

				} );

				sx.request.shouldReturn200();

				it( "Returns the expected representation for item1", function() {

					this.res.body
						.should.have.property( "value", "blue" );

				} );

			} );

			describe( "And I try follow the link, but to put a new representation of item 1", function() {

				beforeEach( function( done ) {

					sx.agent.put( this, this.item1Link.href, "bluish", done );

				} );

				it( "Returns a 403 (Forbidden) status code", function() {

					this.res.status.should.equal( 403 );

				} );

				describe( "And I follow the link to get item 1", function() {

					beforeEach( function( done ) {

						sx.agent.get( this, this.item1Link.href, done );

					} );

					sx.request.shouldReturn200();

					it( "Returns the original representation in the body", function() {

						this.res.body.should.have.property( "value", "blue" );

					} );

				} );

			} );

			describe( "And I try to follow the link, but to delete item 1", function() {

				beforeEach( function( done ) {

					sx.agent.del( this, this.item1Link.href, done );

				} );

				it( "Returns a 403 (Forbidden) status code", function() {

					this.res.status.should.equal( 403 );

				} );

				describe( "And I follow the link to get item 1", function() {

					beforeEach( function( done ) {

						sx.agent.get( this, this.item1Link.href, done );

					} );

					sx.request.shouldReturn200();

					it( "Returns the original representation in the body", function() {

						this.res.body.should.have.property( "value", "blue" );

					} );

				} );

			} );

		} );

	} );

} );