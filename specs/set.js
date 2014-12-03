"use strict";
var sx = require( "./shared" );
var should = require( "chai" ).should();
var async = require( "async" );

sx.check = function( context, callback, next ) {

	return function( err ) {

		if( err ) return callback( err );
		next.call( context );

	};

};


describe( "Given the app is configured", function() {

	if( sx.testConfig.region ) this.timeout( 20000 );
	sx.initServer( sx.testConfig, sx.builder.testApp1Def(), sx.builder.testApp1Roles() );


	describe( "And I am user1 who is a super user, with some data (item1, item2) stored in colours", function() {

		beforeEach( function( done ) {

			this.headers.Authorization = sx.builder.user1Authorization();
			async.series( [ function( done ) {

				sx.fakeDB.fakeUserEntitlements( this.config, {

					"user1" : { "roles" : [ "su" ] }

				}, done );

			}.bind( this ), function( done ) {

				sx.fakeDB.resetItems( this.config, "colours", done );

			}.bind( this ), function( done ) {

				sx.fakeDB.forceItems( this.config, "colours", "user1", {

					"item1" : "blue",
					"item2" : "red"

				}, done );

			}.bind( this ) ], done );

		} );

		describe( "And user2 also has some data stored in colours", function() {

			describe( "When I follow the colours link", function() {

				it( "Only returns my data" );

			} );

		} );

		describe( "When I follow the colours link from the API endpoint to POST a new item", function() {

			beforeEach( function( done ) {


				this.postedColour = "green";
				async.series( [ function( done ) {

					sx.agent.get( this, this.root, done );

				}.bind( this ), function( done ) {

					this.coloursLink = sx.linksForRel( this.res, "colours" )[ 0 ];
					sx.agent.post( this, this.coloursLink.href, this.postedColour, done );

				}.bind( this ), function( done ) {

					this.newColourLocation = this.res.headers[ "location" ];
					done();

				}.bind( this ) ], done );

			} );

			it( "Returns 201 Created status code", function() {

				this.res.statusCode.should.equal( 201 );

			} );

			it( "Includes a Location header pointing to the new resource", function() {

				should.exist( this.newColourLocation );

			} );

			describe( "And I get the new resource based on the location header", function() {

				beforeEach( function( done ) {

					sx.agent.get( this, this.newColourLocation, done );

				} );

				sx.request.shouldReturn200();

				it( "Returns a representation of the added resource", function() {

					this.res.body
						.should.have.property( "value", "green" );

				} );

			} );

			describe( "And I follow the colours link from the API endpoint", function() {

				beforeEach( function( done ) {

					sx.agent.get( this, this.coloursLink.href, done );

				} );

				sx.request.shouldReturn200();

				it( "Includes a link to the added item", function() {

					sx.linksForURI( this.res, this.newColourLocation ).length
						.should.equal( 1, "Expected link to " + this.newColourLocation );

				} );

			} );

		} );

		describe( "When I follow the colours link from the API endpoint", function() {

			beforeEach( function( done ) {

				async.series( [ function( done ) {

					sx.agent.get( this, this.root, done );

				}.bind( this ), function( done ) {

					var coloursLink = sx.linksForRel( this.res, "colours" )[ 0 ];
					sx.agent.get( this, coloursLink.href, done );

				}.bind( this ), function( done ) {

					this.item1Link = sx.linksForRel( this.res, "item1" )[ 0 ];
					done();

				}.bind( this ) ], done );

			} )

			sx.request.shouldReturn200();
			sx.request.shouldReturnSelfLink();

			it( "Returns links to the two items", function() {

				sx.linksForRel( this.res, "item1" ).length.should.equal( 1, "Expected link to item1" );
				sx.linksForRel( this.res, "item2" ).length.should.equal( 1, "Expected link to item2" );

			} );

			it( "Allows get, put or delete for the items", function() {

				var res = this.res;
				[ "get", "put", "delete" ].forEach( function( verb ) {

					[ "item1", "item2" ].forEach( function( item ) {

						sx.linksForRel( res, item )[ 0 ].verbs
							.should.contain( verb, "Expectd verbs for " + item );

					} );

				} );

			} );

			describe( "And I follow the link to get item1", function() {

				beforeEach( function( done ) {

					var itemUri = this.item1Link.href;
					sx.agent.get( this, itemUri, done );

				} );

				sx.request.shouldReturn200();

				it( "Returns the expected representation for item1", function() {

					this.res.body
						.should.have.property( "value", "blue" );

				} );

			} );

			describe( "And I follow the link to put a new representation of item 1", function() {

				beforeEach( function( done ) {

					var itemUri = this.item1Link.href;
					this.newItem1Value = "blueish";
					sx.agent.put( this, itemUri, this.newItem1Value, done );

				} );

				it( "Returns a 204 (No Content) status code", function() {

					this.res.status.should.equal( 204 );

				} );

				describe( "And I follow the link to get item 1", function() {

					beforeEach( function( done ) {

						var itemUri = this.item1Link.href;
						sx.agent.get( this, itemUri, done );

					} );

					sx.request.shouldReturn200();

					it( "Returns the updated representation in the body", function() {

						this.res.body
							.should.have.property( "value", this.newItem1Value );

					} );

				} );

				describe( "And I follow the link to delete item 1", function() {

					beforeEach( function( done ) {

						var itemUri = this.item1Link.href;
						sx.agent.del( this, itemUri, done );

					} );

					sx.request.shouldReturn200();

					describe( "And I try to get item 1 again", function() {

						beforeEach( function( done ) {

							var itemUri = this.item1Link.href;
							sx.agent.get( this, itemUri, done );

						} );

						it( "Returns a 404 (Not Found) status code", function() {

							this.res.status.should.equal( 404 );

						} );

					} );

				} );

			} );

		} );

	} );

} );