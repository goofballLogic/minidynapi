"use strict";
var sx = require( "./shared" );
var should = require( "chai" ).should();

describe( "Given the app is configured", function() {

	sx.initServer( sx.testConfig1, sx.builder.testApp1Def(), sx.builder.testApp1Roles() );

	describe( "And I am user1 who is a super user, with user2's data (item1) stored in colours", function() {

		beforeEach( function( done ) {

			sx.fakeDB.fakeUserEntitlements( this.config, {

				"user1" : { "roles" : [ "su" ] }

			} );
			sx.fakeDB.resetItems( this.config, "colours" );
			sx.fakeDB.forceItems( this.config, "colours", "user1", {

				"item1" : { "value" : "blue" }

			} );
			sx.fakeDB.forceItems( this.config, "colours", "user2", {

				"item1" : { "value" : "purple" }

			} );
			this.headers.Authorization = sx.builder.user1Authorization();
			sx.agent.get( this, this.root, function( err ) {

				if( err ) return done( err );
				sx.agent.get( this, sx.linksForRel( this.res, "colours" )[ 0 ].href, function( err ) {

					this.item1Link = sx.linksForRel( this.res, "item1" )[ 0 ];
					done( err );

				}.bind( this ) );

			}.bind( this ) );

		} );

		describe( "When I try to get user2's item", function() {

			beforeEach( function( done ) {

				var href = this.item1Link.href.replace( "user1", "user2" );
				sx.agent.get( this, href, done );

			} );

			it( "Returns 403 (Forbidden)", function() {

				this.res.statusCode.should.equal( 403 );

			} );

		} );

		describe( "When I try to put a new representation to user2's item", function() {

			beforeEach( function( done ) {

				var href = this.item1Link.href.replace( "user1", "user2" );
				sx.agent.put( this, href, "yomomma", done );

			} );

			it( "Returns 403 (Forbidden)", function() {

				this.res.statusCode.should.equal( 403 );

			} );

		} );

		describe( "When I try to delete user2's item", function() {

			beforeEach( function( done ) {

				var href = this.item1Link.href.replace( "user1", "user2" );
				sx.agent.del( this, href, done );

			} );

			it( "Returns 403 (Forbidden)", function() {

				this.res.statusCode.should.equal( 403 );

			} );

		} );

	} );

} );