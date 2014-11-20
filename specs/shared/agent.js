var sa = require( "superagent" );

module.exports = {

	get: function( context, uri, done ) {

		this.res = sa
			.get( uri )
			.set( context.headers || {} )
			.end( function( err, res ) {

				context.err = err;
				context.res = res;
				done();

			} );

	}

};