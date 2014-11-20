var sx = require( "./shared" );
var should = require( "chai" ).should();

describe( "Given the app is configured", function() {

	sx.initServer( sx.testConfig1, sx.testApp1 );

	describe( "And I am user1 who is a super user", function() {

		beforeEach( function() {

			sx.fakeDB.fakeEntitlements( this.config.ns, {

				"user1" : { "roles" : [ "su" ] },
				"su" : {
					"APIGET" : true,
					"sets" : [ { name: /.*/, CRUD: "crud" } ]
				}

			} );
			this.headers = this.headers || {};
			this.headers.Authorization = sx.builder.user1Authorization();

		} );

		describe( "When I GET the app endpoint", function() {

			beforeEach( function( done ) {

				sx.agent.get( this, this.root, done );

			} );

			it( "Then it should return 200", function() {

				this.res.status.should.equal( 200, "Wrong status code" );

			} );

			it( "Then it should return one link per set", function() {

				var res = this.res;
				this.testApp.sets.forEach( function( set ) {

					sx.linksForSet( res, set )
						.should.have.length( 1, "Missing link with rel " + set );

				} );

			} );

			it( "Then it should return a GET link for each set", function() {

				var res = this.res;
				this.testApp.sets.forEach( function( set ) {

					sx.linksForSet( res, set )[ 0 ].verbs
						.should.contain( "get", "Missing GET verb for set " + set );

				} );

			} );

			it( "Then it should return a POST links for each configured set", function() {

				var res = this.res;
				this.testApp.sets.forEach( function( set ) {

					sx.linksForSet( res, set )[ 0 ].verbs
						.should.contain( "post", "Missing POST verb for set " + set );

				} );

			} );

		} );

	} );

} );