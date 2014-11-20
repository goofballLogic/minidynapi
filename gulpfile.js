var gulp = require( "gulp" );
var mocha  = require( "gulp-mocha" );

gulp.task( "test", function() {

	return gulp.src( "./specs/**/*.js" )
		.pipe( mocha( { report: "spec" } ) )
		.on( "error", handleError );
} );

gulp.task( "autotest", function() {

	gulp.watch( [ "./src/**/*.js", "./specs/**/*.js" ], [ "test" ] );

} );

function handleError() {

	console.log( "Gulp detected an error: " +  arguments[ 0 ] );
	this.emit( "end" );

}