module.exports = function( app, config ) {

	app.use( function( err, req, res, next ) {

		res.sendStatus( 500 );
console.error( "CATCH-ALL: ", err.stack );
	} );

};