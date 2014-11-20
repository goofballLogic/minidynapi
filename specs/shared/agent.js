var sa = require( "superagent" );

module.exports = {

	get: function( context, uri, done ) {

		this.res = sa
			.get( uri )
			.set( context.headers || {} )
			.end( function( err, res ) {

				context.req = { uri: uri };
				context.verb = "get";
				context.err = err;
				context.res = res;
				done();

			} );

	}

};