"use strict";
var sa = require( "superagent" );

module.exports = {

	get: function( context, uri, done ) {

		var handler = handleResponse.bind( this, context, uri, done );
		this.res = sa
			.get( uri )
			.set( context.headers || {} )
			.end( handler );

	},

	post: function( context, uri, payload, done ) {

		var isObject = ( !!payload ) && typeof payload == "object";
		var handler = handleResponse.bind( this, context, uri, done );
		this.res = sa
			.post( uri )
			.type( isObject ? "json" : "text" )
			.set( context.headers || {} )
			.send( payload )
			.end( handler );

	},

	put: function( context, uri, payload, done ) {

		var isObject = ( !!payload ) && typeof payload == "object";
		var handler = handleResponse.bind( this, context, uri, done );
		this.res = sa
			.put( uri )
			.type( isObject ? "json" : "text" )
			.set( context.headers || {} )
			.send( payload )
			.end( handler );

	},

	del: function( context, uri, done ) {

		var handler = handleResponse.bind( this, context, uri, done );
		this.res = sa
			.del( uri )
			.set( context.headers || {} )
			.end( handler );
	}

};

function handleResponse( context, uri, callback, err, res ) {

	context.req = { uri: uri };
	context.verb = "get";
	context.err = err;
	context.res = res;
	callback( err );

}