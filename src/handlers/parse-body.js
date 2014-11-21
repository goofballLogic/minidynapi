var bodyparser = require( "body-parser" );

module.exports = function( app, config ) {

	app.use( bodyparser.json() );
	app.use( bodyparser.text() );

};