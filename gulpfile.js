var gulp = require( "gulp" );
var mocha  = require( "gulp-mocha" );
var watch = require( "gulp-watch" );

gulp.task( "test", function() {

	return gulp.src( "./specs/**/*.js" )
		.pipe( mocha( { report: "spec" } ) )
		.on( "error", handleError );
} );

gulp.task( "autotest", function() {


	watch( "./**/*.js", function( files, cb ) {

		gulp.start( "test", cb );

	} );

} );

function handleError() {

	console.log( "Gulp detected an error: " +  arguments[ 0 ] );
	this.emit( "end" );

}