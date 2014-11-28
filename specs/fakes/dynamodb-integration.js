"use strict";
var ddb = require( "../../src/agents/dynamodb" );

function buildEntitlementItems( entitlements, xkey ) {

	var items = [];
	for( var xvalue in entitlements ) {

		var item = {};
		item[ xkey ] = xvalue;
		for( var key in entitlements[ xvalue ] ) {

			item[ key ] = entitlements[ xvalue ][ key ];

		}
		items.push( item );

	}
	return items;

}

ddb.init = function( config, manifest, callback ) {

	var items = [];
	for( var setting in manifest ) items.push( {

		setting: setting,
		value: manifest[ setting ]

	} );
	this.setItems( config, "metadata", items, callback );

};
ddb.fakeUserEntitlements = function( config, entitlements, callback ) {

	var items = buildEntitlementItems( entitlements, "uid" );
	this.setItems( config, "user_entitlements", items, callback );

};
ddb.fakeRoleEntitlements = function( config, entitlements, callback ) {

	var items = buildEntitlementItems( entitlements, "role" );
	this.setItems( config, "role_entitlements", items, callback );

};
ddb.forceItems = function( config, set, uid, itemsToAdd, callback ) {

	var items = [];
	for( var iid in itemsToAdd ) {

		items.push( { "iid" : iid, "value" : itemsToAdd[ iid ] } );

	}
	forceEachItem.call( this, config, set, uid, items, callback );

};
function forceEachItem( config, set, uid, items, callback ) {

	if( !items.length ) return callback();
	var item = items.pop();
	this.setUserItem( config, set, uid, item.iid, item.value, function( err ) {

		if( err ) return callback( err );
		forceEachItem.call( this, config, set, uid, items, callback );

	}.bind( this ) );

}
ddb.resetItems = function( config, set, callback ) {

	this.scanTable( config, set, function( err, items ) {

		if( err ) return callback( err );
		if( !items.length ) return callback();
		items = items.map( this.parseData ).map( function( x ) {
			return { uid: x.uid, vid: x.vid };
		} );
		this.deleteItems( config, set, items, function( err ) {

			if( err ) return callback( err );
			// loop until there are no items returned from the scan
			this.resetItems( config, set, callback );

		}.bind( this ) );

	}.bind( this ) );

};

module.exports = ddb;