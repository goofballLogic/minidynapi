module.exports = {

	buildForSet: function( config, permissions, set ) {

		function has( x ) { return !!~CRUD.indexOf( x ); }
		var CRUD = "";
		( permissions.sets || [] )
			.filter( function( setPermission ) { return !!setPermission.CRUD; } )
			.filter( function( setPermission ) {

				// convert to regexp if necessary
				if( !( setPermission.name instanceof RegExp ) )
					setPermission.name = new RegExp( setPermission.name );
				return setPermission.name.test( set );

			} )
			.forEach( function( setPermission ) {

				for( var i = 0; i < setPermission.CRUD.length; i++ ) {

					var perm = setPermission.CRUD[ i ].toLowerCase();
					if( !has( perm ) ) CRUD = CRUD + perm.toLowerCase();

				}

			} );

		var canRead = has( "r" );
		var canCreate = has( "c" );
		if( !( canRead || canCreate ) ) return null;
		var verbs = [];
		if( canRead ) verbs.push( "get" );
		if( canCreate ) verbs.push( "post" );
		return {

			"rel" : set,
			"href" : makeSetURI( config, set ),
			"verbs" : verbs

		};

	},
	buildForItem: function( config, permissions, set, item ) {

		return {

			"rel" : item,
			"href" : makeItemURI( config, set, item ),
			"verbs" : []

		};

	}

};

function makeSetURI( config, setName ) {

	return config.baseUri + config.path + "/" + setName;

}
function makeItemURI( config, setName, itemName ) {

	return makeSetURI( config, setName ) + "/" + itemName;

}