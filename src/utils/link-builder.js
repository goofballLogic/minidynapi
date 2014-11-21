var permissions = require( "./permissions" );

module.exports = {

	buildForSet: function( config, permissionsRaw, set ) {

		var CRUD = permissions.compileForSet( permissionsRaw, set );
		var canRead = !!~CRUD.indexOf( "r" );
		var canCreate = !!~CRUD.indexOf( "c" );
		if( !( canRead || canCreate ) ) return null;
		var verbs = [];
		if( canRead ) verbs.push( "get" );
		if( canCreate ) verbs.push( "post" );
		if( !verbs.length ) return null;
		return {

			"rel" : set,
			"href" : makeSetURI( config, set ),
			"verbs" : verbs

		};

	},
	buildForUserItem: function( config, permissionsRaw, set, user, item ) {

		var CRUD = permissions.compileForSet( permissionsRaw, set );
		var canRead = !!~CRUD.indexOf( "r" );
		var canDelete = !!~CRUD.indexOf( "d" );
		var canUpdate = !!~CRUD.indexOf( "u" );
		var verbs = [];
		if( canRead ) verbs.push( "get" );
		if( canDelete ) verbs.push( "delete" );
		if( canUpdate ) verbs.push( "put" );
		if( !verbs.length ) return null;
		return {

			"rel" : item,
			"href" : makeUserItemURI( config, set, user, item ),
			"verbs" : verbs

		};

	}

};

function makeSetURI( config, setName ) {

	return config.baseUri + config.path + "/" + setName;

}
function makeUserItemURI( config, setName, userName, itemName ) {

	return makeSetURI( config, setName ) + "/" + userName + "/" + itemName;

}