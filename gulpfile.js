var gulp = require( "gulp" );
var mocha  = require( "gulp-mocha" );
var exec = require( "child_process" ).exec;

gulp.task( "test", function() {

	return gulp.src( [ "./specs/**/*.js", "!./specs/shared/launchAPI.js" ] )
		.pipe( mocha( { report: "spec" } ) )
		.on( "error", handleError );
} );

gulp.task( "autotest", function() {

	gulp.watch( [ "./src/**/*.js", "./specs/**/*.js" ], [ "test" ] );

} );

gulp.task( "dev-test", function( callback ) {

	runcmd( function() {

		process.env.testConfig = JSON.stringify( require( "./specs/shared/dev-config-integration" ) );
		callback( null, gulp.start( "test" ) );

	} );

} );

gulp.task( "integration-test", function() {

	process.env.testConfig = JSON.stringify( require( "./specs/shared/test-config-integration" ) );
	return gulp.start( "test" );

} );

function handleError() {

	console.log( "Gulp detected an error: " +  arguments[ 0 ] );
	this.emit( "end" );

}



// Database initialization

	var pre = "aws dynamodb create-table --endpoint-url http://localhost:8000 ";
	var post = " --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1";
	var cmds = [
		"--table-name mda_metadata --attribute-definitions AttributeName=setting,AttributeType=S --key-schema AttributeName=setting,KeyType=HASH",
		"--table-name mda_role_entitlements --attribute-definitions AttributeName=role,AttributeType=S --key-schema AttributeName=role,KeyType=HASH",
		"--table-name mda_user_entitlements --attribute-definitions AttributeName=uid,AttributeType=S --key-schema AttributeName=uid,KeyType=HASH",
		"--table-name mda_colours --attribute-definitions AttributeName=vid,AttributeType=S AttributeName=uid,AttributeType=S --key-schema AttributeName=vid,KeyType=HASH AttributeName=uid,KeyType=RANGE",
		"--table-name mda_friends --attribute-definitions AttributeName=vid,AttributeType=S AttributeName=uid,AttributeType=S --key-schema AttributeName=vid,KeyType=HASH AttributeName=uid,KeyType=RANGE"
	]
	function runcmd( callback ) {

		exec( pre + cmds.pop() + post, function( err ) {

			if( err && !~err.toString().indexOf( "ResourceInUseException" ) ) console.log( err );
			if( cmds.length ) return runcmd( callback );
			populateTables( callback );

		} );

	}
	function populateTables( callback ) {

		putItem( "mda_metadata", { setting: { "S" : "sets" }, value: { "SS" : [ "colours", "friends" ] } }, function() {

			putItem( "mda_metadata", { setting: { "S" : "colours_seed" }, value: { "N" : "0" } }, function() {

				callback();

			} );

		} );

	}
	function putItem( tableName, obj, callback ) {

		exec( "aws dynamodb --endpoint-url http://localhost:8000 put-item --table-name " + tableName + " --item '" + JSON.stringify( obj ) + "'", function( err ) {

			if( err ) console.log( err );
			callback( err );

		} );

	}