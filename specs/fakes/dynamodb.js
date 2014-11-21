"use strict";
var state = {};

module.exports = {

	// behaviours
	fetchAppDefinition: function( config, callback ) {

		var manifest = this.ensureAppTable( config ).manifest || {};
		callback( null, manifest );

	},
	fetchUserEntitlements: function( config, uid, callback ) {

		var appTable = this.ensureAppTable( config );
		var entitlements = appTable[ userEntitlement( uid ) ] || {};
		callback( null, entitlements );

	},
	fetchRoleEntitlements: function( config, role, callback ) {

		var appTable = this.ensureAppTable( config );
		var entitlements = appTable[ roleEntitlement( role ) ] || {};
		callback( null, entitlements );

	},
	fetchSetUserIndex: function( config, set, uid, callback ) {

		var userIndex = this.ensureUserIndex( config, set, uid );
		userIndex = JSON.parse( JSON.stringify( userIndex ) );
		delete userIndex.seed;
		callback( null, userIndex );

	},
	fetchUserItem: function( config, set, uid, iid, callback ) {

		var userIndex = this.ensureUserIndex( config, set, uid );
		var items = this.ensureSetTable( config, set );
		if( !( iid in userIndex ) ) return callback();
		var latest = userIndex[ iid ];
		var itemName = itemVersionName( uid, iid, latest );
		var value = items[ itemName ].value;
		callback( null, value, true );

	},
	setUserItem: function( config, set, uid, iid, value, callback ) {

		var userIndex = this.ensureUserIndex( config, set, uid );
		var items = this.ensureSetTable( config, set );
		if( !iid ) {

			// generate an id if needed
			iid = ( userIndex.seed = ( userIndex.seed || 100 ) + 1 )

		};
		// save the item
		var itemVersionId = itemVersion( uid, iid );
		items[ itemVersionId ] = { "value" : value };
		// update the user index
		userIndex[ iid ] = extractTimestamp( itemVersionId );
		// return the id
		callback( null, iid );

	},
	removeUserItem: function( config, set, uid, iid, callback ) {

		var userIndex = this.ensureUserIndex( config, set, uid );
		var items = this.ensureSetTable( config, set );
		// find and remove all version of the item
		var itemIndex = this.ensureItemIndex( config, set, uid, iid );
		itemIndex.forEach( function( itemVersionId ) {

			delete items[ itemVersionId ];

		} );
		// remove the item index
		this.removeItemIndex( config, set, uid, iid );
		// remove the item index entry
		this.removeUserIndex( config, set, uid );
		callback( null );

	},

	// test seams
	init: function( config, manifest ) {

		var appTable = this.ensureAppTable( config );
		appTable.manifest = manifest;

	},
	fakeUserEntitlements: function( config, entitlements ) {

		var appTable = this.ensureAppTable( config );
		for( var uid in entitlements || {} ) {

			appTable[ userEntitlement( uid ) ] = entitlements[ uid ];

		}

	},
	fakeRoleEntitlements: function( config, entitlements ) {

		var appTable = this.ensureAppTable( config );
		for( var role in entitlements || {} ) {

			appTable[ roleEntitlement( role ) ] = entitlements[ role ];

		}

	},
	forceItems: function( config, set, uid, itemsToAdd ) {

		var userIndex = this.ensureUserIndex( config, set, uid );
		var items = this.ensureSetTable( config, set );
		for( var iid in itemsToAdd ) {

			// save the item
			var itemVersionId = itemVersion( uid, iid );
			items[ itemVersionId ] = itemsToAdd[ iid ];
			// update the users item index
			var itemIndex = this.ensureItemIndex( config, set, uid, iid );
			itemIndex.push( itemVersionId );
			// update the user index
			userIndex[ iid ] = extractTimestamp( itemVersionId );

		}

	},
	resetItems: function( config, set ) {

		var items = this.ensureSetTable( config, set );
		for( var key in items ) delete items[ key ];

	},

	// helper methods
	ensureAppTable: function( config ) {

		var appTableName = appTable( config );
		return ( state[ appTableName ] = state[ appTableName ] || {} );

	},
	ensureItemIndex: function( config, set, uid, iid ) {

		var setTable = this.ensureSetTable( config, set );
		var indexName = itemIndexName( uid, iid );
		setTable[ indexName ] = setTable[ indexName ] || [];
		return setTable[ indexName ];

	},
	removeItemIndex: function( config, set, uid, iid ) {

		var setTable = this.ensureSetTable( config, set );
		var indexName = itemIndexName( uid, iid );
		delete setTable[ indexName ];

	},
	ensureSetTable: function( config, set ) {

		var setTableName = setTable( config, set );
		state[ setTableName ] = state[ setTableName ] || {};
		return state[ setTableName ];

	},
	ensureUserIndex: function( config, set, uid ) {

		var setTable = this.ensureSetTable( config, set );
		var indexName = userIndexName( uid );
		setTable[ indexName ] = setTable[ indexName ] || {};
		return setTable[ indexName ];

	},
	removeUserIndex: function( config, set, uid ) {

		var setTable = this.ensureSetTable( config, set );
		var indexName = userIndexName( uid );
		delete setTable[ indexName ];

	}

};

function appTable( config ) {

	return config.ns + ".definition";

}
function setTable( config, set ) {

	return config.ns + "." + set;

}
function userEntitlement( user ) {

	return "user-entitlements." + user;

}
function roleEntitlement( role ) {

	return "role-entitlements." + role;

}
function userIndexName( uid ) {

	return uid + ".index";

}
function itemVersion( uid, iid ) {

	return itemVersionName( uid, iid, createTimestamp() );

}
function itemVersionName( uid, iid, latest ) {

	return uid + "." + iid + "." + latest;

}
function itemIndexName( uid, iid ) {

	return uid + "." + iid + ".index";

}
function createTimestamp() {

	return Date.now() + "." + process.hrtime().join( "." );

}
function extractTimestamp( itemVersionId ) {

	return itemVersionId.split( "." ).slice( -3 ).join( "." );

}