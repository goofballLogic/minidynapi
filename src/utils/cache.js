module.exports = {

	bucket : getBucket

};

var cache = {};
var cacheSeconds = 60 * 5;
var bucketSizeLimit = 100;

function getBucket( bucket ) {

	return new Bucket( bucket );

}
function Bucket( bucketName ) {

	this.bucketName = bucketName;

}
function cacheObject( bucketName ) {

	return cache[ bucketName ] = cache[ bucketName ] || {};

}
Bucket.prototype.retrieve = function( key ) {

	var storee = cacheObject( this.bucketName )[ key ];
	if( !storee ) return undefined;
	if( storee.when < new Date() ) {

		delete cacheObject( this.bucketName )[ key ];
		return undefined;

	}
	return JSON.parse( storee.content );

};
Bucket.prototype.deposit = function( key, value ) {

	var storee = {

		content : JSON.stringify( value ),
		when : new Date()

	};
	storee.when.setSeconds( storee.when.getSeconds() + cacheSeconds );
	cacheObject( this.bucketName )[ key ] = storee;
	this.prune();

};
Bucket.prototype.prune = function() {

	var obj = cacheObject( this.bucketName );
	if( obj.length < bucketSizeLimit ) return;
	var toRemove = Object.keys( obj ).reduce( function( previous, current ) {

		if( !previous ) return obj[ current ];
		current = obj[ current ];
		return ( current.when < previous.when )	? current : previous;

	}, null );
	delete obj[ toRemove ];

};
Bucket.prototype.remove = function( key ) {

	delete cacheObject( this.bucketName )[ key ];

};