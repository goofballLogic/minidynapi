var should = require( "chai" ).should();

module.exports = {

	shouldReturn200: function() {

		it( "Returns a 200 status code", function() {

			this.res.status.should.equal( 200 );

		} );

	},
	shouldReturnSelfLink: function() {

		it( "Returns a matching self link", function() {

			module.exports.linksForRel( this.res, "self" )[ 0 ]
				.should.have.property( "href", this.req.uri );

		} );

	},
	linksForRel: function( res, set ) {

		if( !res.body ) return null;
		return ( res.body.links || [] ).filter( function( link ) {

			return link.rel == set;

		} );

	},
	linksForURI: function( res, uri ) {

		if( !res.body ) return null;
		return ( res.body.links|| [] ).filter( function( link ) {

			return link.href == uri;

		} );

	}

};