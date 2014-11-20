var API = require( "./index" );
var config = require( __dirname + "/config" );
config = config || {};
(new API() ).init( config );