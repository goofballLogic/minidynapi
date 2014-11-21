module.exports = {

	compileForSet: function( permissions, set ) {

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
					if( !~CRUD.indexOf( perm ) ) CRUD = CRUD + perm.toLowerCase();

				}

			} );
		return CRUD;

	}

};