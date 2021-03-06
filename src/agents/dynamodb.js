var AWS = require( "aws-sdk" );

function buildClient( config ) {

	if( config._cachedClient && config._cachedClient.batchGetItem ) return config._cachedClient;
	var opts = {

		apiVersion : "2012-08-10",
		region: config.region,

	};
	if( config.dev ) {

		opts.logger = console;

	}
	config._cachedClient = new AWS.DynamoDB( opts );
	if( config.dbendpoint ) {

		config._cachedClient.setEndpoint( config.dbendpoint );

	}
	return config._cachedClient;

}
function asValueObject( value ) {

	if( Array.isArray( value ) ) {

		if( typeof value[ 0 ] === "string" )
			return { SS : value };
		if( typeof( value[ 0 ] === "object" ) )
			return { L : value.map( function( x ) { return { M: asAttrs( x ) }; } ) };
		throw new Error( "Unhandled array value type: " + typeof value + " " + JSON.stringify( value ) );

	}
	if( typeof value === "boolean" )
		return { BOOL : value };
	if( typeof value === "string" )
		return { S : value };
	if( typeof( value ) === "object" )
		return { M: asAttrs( value ) };
	if( typeof( value ) === "number" )
		return { N: value.toString() };
	throw new Error( "Unhandled value type: " + typeof value + " " + JSON.stringify( value )  );

}
function parseObjectValue( obj ) {

	if( "BOOL" in obj ) return obj[ "BOOL" ];
	if( "SS" in obj ) return obj[ "SS" ];
	if( "S" in obj ) return obj[ "S" ];
	if( "N" in obj ) return obj[ "N" ];
	if( "L" in obj ) return obj[ "L" ].map( parseObjectValue );
	if( "M" in obj ) {

		var ret = {};
		for( var key in obj[ "M" ] ) {

			ret[ key ] = parseObjectValue( obj[ "M" ][ key ] );

		}
		return ret;

	}
	throw new Error( "Unhandled value object: " + JSON.stringify( obj ) );

}
function asKeys( rawKeys ) {

	return [].concat( rawKeys ).map( function( rawKey ) {

		return Object.keys( rawKey || {} ).reduce( function( key, keyName ) {

			key[ keyName ] = asValueObject( rawKey[ keyName ] );
			return key;

		}, {} );

	} );

}
function asKeyObject( keyPairs ) {

	var ret = {};
	for( var keyName in keyPairs ) {

		ret[ keyName ] = asValueObject( keyPairs[ keyName ] );

	}
	return ret;

}
function asAttrs( item ) {

	var ret = {};
	for( var keyName in item ) ret[ keyName ] = asValueObject( item[ keyName ] );
	return ret;

}
function scanTable( config, rawTableName, callback ) {

	var table = config.ns + "_" + rawTableName;
	var dynamodb = buildClient( config );
	var params = { TableName: table };
	dynamodb.scan( params, function( err, data ) {

		if( !err ) return callback( null, data.Items );
		console.error && console.error( err );
		callback( new Error( err ) );

	} );

}
function getItem( config, rawTableName, keyPairs, callback ) {

	var table = config.ns + "_" + rawTableName;
	var dynamodb = buildClient( config );
	var params = { Key: asKeyObject( keyPairs ), TableName: table };
	dynamodb.getItem( params, function( err, data ) {

		if( !err ) return callback( null, data.Item );
		console.error && console.error( err, params );
		callback( new Error( err ) );

	} );

}
function getItemAttr( config, rawTableName, keyPairs, attrNames, expression, callback ) {

	var table = config.ns + "_" + rawTableName;
	var dynamodb = buildClient( config );
	var params = { Key: asKeyObject( keyPairs ), TableName: table, ExpressionAttributeNames: attrNames, ProjectionExpression: expression };
	dynamodb.getItem( params, function( err, data ) {

		if( !err ) return callback( null, data.Item );
		console.error && console.error( err, params );
		callback( new Error( err ) );

	} );

}
function getItems( config, rawTableName, keyPairs, callback ) {

	var table = config.ns + "_" + rawTableName;
	var dynamodb = buildClient( config );
	var params = { RequestItems : { } };
	var keys = asKeys( keyPairs );
	params.RequestItems[ table ] = {

		Keys : keys,
		ConsistentRead: true

	};
	dynamodb.batchGetItem( params, function( err, data ) {

		if( !err ) return callback( null, data.Responses[ table ] );
		console.error && console.error( err, params );
		callback( new Error( err ) );

	} );

}
function setItems( config, rawTableName, items, callback ) {

	var table = config.ns + "_" + rawTableName;
	var dynamodb = buildClient( config );
	var params = { RequestItems: { } };
	var tableParams = params.RequestItems[ table ] = [ ];
	( items || [] ).forEach( function( item ) {

		var attrs = asAttrs( item );
		tableParams.push( { PutRequest: { Item: attrs } } );

	} );
	dynamodb.batchWriteItem( params, function( err, data ) {

		if( !err ) return callback( null );
		console.error && console.error( err, params );
		callback( new Error( err ) );

	} );

}
function deleteItems( config, rawTableName, items, callback ) {

	var table = config.ns + "_" + rawTableName;
	var dynamodb = buildClient( config );
	var params = { RequestItems: { } };
	var tableParams = params.RequestItems[ table ] = [ ];
	( items || [] ).forEach( function( item ) {

		var attrs = asAttrs( item );
		tableParams.push( { DeleteRequest: { Key: attrs } } );

	} );
	dynamodb.batchWriteItem( params, function( err, data ) {

		if( !err ) return callback( null );
		console.error && console.error( err, params );
		callback( new Error( err ) );

	} );

}
function updateItem( config, rawTableName, key, attrNames, attrValues, updateExpression, callback) {

	var dynamodb = buildClient( config );
	var params = {
		Key: asAttrs( key ),
		TableName: config.ns + "_" + rawTableName,
		ExpressionAttributeNames: attrNames,
		UpdateExpression: updateExpression,
		ReturnValues: "ALL_NEW"
	};
	if( attrValues )
		params.ExpressionAttributeValues = asAttrs( attrValues )

	dynamodb.updateItem( params, function( err, data ) {

		if( !err ) return callback( null, data.Attributes.value );
		console.error && console.error( err, params );
		callback( new Error( err ) );

	} );

}
function scan( config, rawTableName, attrNames, attrValues, filterExpression, requestedAttrNames, callback ) {

	var dynamodb = buildClient( config );
	var params = {

		ProjectionExpression: requestedAttrNames.join( ", " ),
		ExpressionAttributeNames: attrNames,
		ExpressionAttributeValues: asAttrs( attrValues ),
		FilterExpression: filterExpression,
		TableName: config.ns + "_" + rawTableName

	};
	dynamodb.scan( params, function( err, data ) {

		if( !err ) return callback( null, data.Items );
		console.error && console.error( err, params );
		callback( new Error( err ) );

	} );

}




function updateUserIndex( config, set, uid, iid, vid, callback ) {

	var key = { uid: uid, vid: uid + "_index" };
	var attrNames1 = { "#content" : "content" };
	var attrValues1 = { ":empty" : {} };
	var expression1 = "SET #content = if_not_exists(#content, :empty)";
	updateItem( config, set, key, attrNames1, attrValues1, expression1, function( err ) {

		if( err ) return callback( err );
		var attrNames2 = { "#content" : "content", "#iid" : iid };
		var attrValues2 = { ":vid" : vid };
		var expression2 = "SET #content.#iid = :vid";
		updateItem( config, set, key, attrNames2, attrValues2, expression2, callback );

	} );

}
function removeItemFromUserIndex( config, set, uid, iid, callback ) {

	var key = { uid: uid, vid: uid + "_index" };
	var attrNames = { "#content" : "content", "#iid" : iid };
	var attrValues = null;
	var expression = "REMOVE #content.#iid";
	updateItem( config, set, key, attrNames, attrValues, expression, callback );

}

function updateItemIndex( config, set, uid, iid, when, vid, callback ) {

	var key = { uid: uid, vid: iid + "_index" };
	var attrNames1 = { "#content" : "content" };
	var attrValues1 = { ":empty" : {} };
	var expression1 = "SET #content = if_not_exists(#content, :empty)";
	updateItem( config, set, key, attrNames1, attrValues1, expression1, function( err ) {

		if( err ) return callback( err );
		var attrNames2 = { "#content" : "content", "#when" : when };
		var attrValues2 = { ":vid" : vid };
		var expression2 = "SET #content.#when = :vid";
		updateItem( config, set, key, attrNames2, attrValues2, expression2, callback );

	} );

}
var DELETION_PENDING = "DELETION_PENDING";
function markUserIndexItemForDeletion( config, set, uid, iid, callback) {

	var key = { uid: uid, vid: uid + "_index" };
	var attrNames = { "#content" : "content", "#iid" : iid };
	var attrValues = { ":value" : DELETION_PENDING };
	var expression = "SET #content.#iid = :value";
	updateItem( config, set, key, attrNames, attrValues, expression, callback );

}
function removeAllItems( config, set, uid, iid, callback ) {

	var attrNames = { "#vid" : "vid", "#uid" : "uid" };
	var attrValues = { ":uid" : uid, ":vidPrefix" : iid + "_" };
	var expression = "begins_with( #vid, :vidPrefix ) and #uid = :uid";
	var requestedAttrNames = [ "vid" ];
	scan( config, set, attrNames, attrValues, expression, requestedAttrNames, function( err, data ) {

		if( err ) return callback( err );
		if( data.length == 0 ) {

			// no more items
			return callback( null );

		}
		var vids = data.map( function( item ) {

			return parseObjectValue( item.vid );

		} );
		// now we have a list of vids to remove
		removeItems( config, set, uid, vids, function( err ) {

			if( err ) return callback( err );
			// loop around to see if there are any more to remove
			removeAllItems( config, set, uid, iid, callback );

		} );

	} );

}

function removeItems( config, set, uid, vids, callback ) {


	var items = vids.map( function( vid ) {

		return { "uid" : uid, "vid" : vid };

	} );
	deleteItems( config, set, items, callback )

}

function getUserIndexItem( config, set, uid, iid, callback ) {

	var key = { uid: uid, vid: uid + "_index" };
	var attrNames = { "#content" : "content", "#iid" : iid };
	var expression = "#content.#iid";
	getItemAttr( config, set, key, attrNames, expression, callback );

}
function getUserIndex( config, set, uid, callback ) {

	var key = { uid: uid, vid: uid + "_index" };
	var attrNames = { "#content" : "content" };
	var expression = "#content";
	getItemAttr( config, set, key, attrNames, expression, callback );

}
function getItemVersion( config, set, uid, vid, callback ) {

	var key = { vid: vid, uid: uid };
	getItems( config, set, key, function( err, results ) {

		if( err ) return callback( err );
		if( !( results && results.length ) ) return callback();
		try {

			var rawItem = results[ 0 ].content;
			var parsed = parseObjectValue( rawItem );
			callback( null, parsed, true );

		}
		catch( ex ) {

			callback( ex );
		}

	} );

}
function setItemVersion( config, set, uid, iid, vid, value, callback ) {

	var item = { vid: vid, uid: uid, iid: iid, content: value };
	setItems( config, set, [ item ], callback );

}
function getNextItemId( config, set, callback ) {

	var key = { setting : set + "_seed" };
	var attrNames = { "#value" : "value" };
	var attrValues = { ":inc" : 1 };
	var expression = "SET #value = #value + :inc";
	updateItem( config, "metadata", key, attrNames, attrValues, expression, callback );

}


module.exports = {

	// internal methods
	getItems: function( config, tableName, keys, callback ) {

		return getItems( config, tableName, keys, callback );

	},
	setItems: function( config, tableName, items, callback ) {

		return setItems( config, tableName, items, callback );

	},
	scanTable: function( config, tableName, callback ) {

		return scanTable( config, tableName, callback );

	},
	deleteItems: function( config, tableName, items, callback ) {

		return deleteItems( config, tableName, items, callback );

	},
	parseData: function( data ) {

		var ret = {};
		for( var key in data ) {

			ret[ key ] = parseObjectValue( data[ key ] );

		}
		return ret;

	},
	ensureItemId: function( config, set, iid, callback ) {

		if( iid ) return process.nextTick( function() { callback( null, iid ); } );

		// if necessary call to get a new item id
		getNextItemId( config, set, function( err, value ) {

			if( err ) return callback( err );
			callback( null, parseObjectValue( value ) );

		} );


	},
	// public methods
	setUserItem: function( config, set, uid, iid, value, callback ) {

// TODO: ensure that the user index isn't marked for deletion
		this.ensureItemId( config, set, iid, function( err, iid ) {

			if( err ) return callback( err );
			// we now have an id to set the user item against
			var when = createTimestamp();
			var vid = iid + "_" + when;
			setItemVersion( config, set, uid, iid, vid, value, function( err ) {

				if( err ) return callback( err );
				// item version was created, so update the item index
				updateItemIndex( config, set, uid, iid, when, vid, function( err ) {

					if( err ) return callback( err );
					// TODO: ensure that the user index isn't marked for deletion
					// item index is updated, so update the user index
					updateUserIndex( config, set, uid, iid, vid, function( err ) {

						if( err ) return callback( err );
						callback( null, iid );

					} );

				} );

			} );

		} );

	},
	removeUserItem: function( config, set, uid, iid, callback ) {

		// mark the item for deletion in the user index
		markUserIndexItemForDeletion( config, set, uid, iid, function( err ) {

			if( err ) return callback( err );
			// remove all item indexes and items
			removeAllItems( config, set, uid, iid, function( err ) {

				if( err ) return callback( err );
				// clear the user index
				removeItemFromUserIndex( config, set, uid, iid, callback );

			} );

		} );

	},
	fetchAppDefinition: function( config, callback ) {

		getItems( config, "metadata", { "setting" : "sets" }, function( err, results ) {

			if( err ) return callback( err );
			var ret = {};
			results.forEach( function( result ) {

				ret[ parseObjectValue( result.setting ) ] = parseObjectValue( result.value );

			} );
			callback( null, ret );

		} );

	},
	fetchUserEntitlements: function( config, uid, callback ) {

		getItems( config, "user_entitlements", { "uid" : uid }, function( err, results ) {

			if( err ) return callback( err );
			var ret = {};
			results.forEach( function( result ) {

				for( var key in result )
					ret[ key ] = parseObjectValue( result[ key ] );
				delete ret[ "uid" ];

			} );
			callback( null, ret );

		} );

	},
	fetchRoleEntitlements: function( config, role, callback ) {

		var keys = { "role" : role };
		getItems( config, "role_entitlements", keys, function( err, results ) {

			if( err ) return callback( err );
			var ret = {};
			results.forEach( function( result ) {

				for( var key in result )
					ret[ key ] = parseObjectValue( result[ key ] );
				delete ret[ "role" ];

			} );
			callback( null, ret );

		} );

	},
	fetchSetUserIndex: function( config, set, uid, callback ) {

		getUserIndex( config, set, uid, function( err, results ) {

			if( err ) return callback( err );
			var parsed = parseObjectValue( results.content );
			callback( null, parsed );

		} );

	},
	fetchUserItem: function( config, set, uid, iid, callback ) {

		// look up the user index for this user and item
		getUserIndexItem( config, set, uid, iid, function( err, results ) {

			if( err ) return callback( err );
			if( !( results && results.content ) ) return callback();
			var item = parseObjectValue( results.content );
			var vid = item[ iid ];
			getItemVersion( config, set, uid, vid, callback );

		} );

	}

};

function createTimestamp() {

	return Date.now() + "_" + process.hrtime().join( "_" );

}
function extractTimestamp( itemVersionId ) {

	return itemVersionId.split( "_" ).slice( -3 ).join( "_" );

}