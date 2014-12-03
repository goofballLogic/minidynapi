var sx = require( "./shared" );
var should = require( "chai" ).should();

describe( "Given the app is configured", function() {

	this.timeout( 10000 );
	sx.initServer( sx.testConfig, sx.builder.testApp1Def(), sx.builder.testApp1Roles() );

	describe( "And I am user1 who is a super user", function() {

		beforeEach( function( done ) {

			this.headers.Authorization = sx.builder.user1Authorization();
			sx.fakeDB.fakeUserEntitlements( this.config, {

				"user1" : { "roles" : [ "su" ] },

			}, done );

		} );

		describe( "When I GET the app endpoint", function() {

			beforeEach( function( done ) {

				sx.agent.get( this, this.root, done );

			} );

			sx.request.shouldReturn200();

			it( "Returns one link per set", function() {

				var res = this.res;
				this.testApp.sets.forEach( function( set ) {

					sx.linksForRel( res, set )
						.should.have.length( 1, "Missing link with rel " + set );

				} );

			} );

			it( "Returns a GET link for each set", function() {

				var res = this.res;
				this.testApp.sets.forEach( function( set ) {

					sx.linksForRel( res, set )[ 0 ].verbs
						.should.contain( "get", "Missing GET verb for set " + set );

				} );

			} );

			it( "Returns a POST links for each configured set", function() {

				var res = this.res;
				this.testApp.sets.forEach( function( set ) {

					sx.linksForRel( res, set )[ 0 ].verbs
						.should.contain( "post", "Missing POST verb for set " + set );

				} );

			} );

		} );

	} );

} );