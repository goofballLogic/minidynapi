"use strict";
var sx = require( "./shared" );
var should = require( "chai" ).should();
var async = require( "async" );
return;
describe( "Given the app is configured", function() {

	this.timeout( 10000 );
	sx.initServer( sx.testConfig, sx.builder.testApp1Def(), sx.builder.testApp1Roles() );

	describe( "And I am user1 who is a super user, with user2's data (item1) stored in colours", function() {

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

					"item1" : { "value" : "blue" }

				}, done );

			}.bind( this ), function( done ) {

				sx.fakeDB.forceItems( this.config, "colours", "user2", {

					"item1" : { "value" : "purple" }

				}, done );

			}.bind( this ), function( done ) {

				sx.agent.get( this, this.root, done );

			}.bind( this ), function( done ) {

				sx.agent.get( this, sx.linksForRel( this.res, "colours" )[ 0 ].href, done );

			}.bind( this ), function( done ) {

				this.item1Link = sx.linksForRel( this.res, "item1" )[ 0 ];
				done();

			}.bind( this ) ], done );

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