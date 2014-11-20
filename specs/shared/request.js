var should = require( "chai" ).should();

module.exports = {

	shouldReturn200: function() {

		it( "Should return a 200 status code", function() {

			this.res.status.should.equal( 200 );

		} );

	}

};