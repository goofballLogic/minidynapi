module.exports = {

	user1Authorization: function() {

		return "Test user1";

	},
	user2Authorization: function() {

		return "Test user2";

	},
	testApp1Def: function() {

		return {

			sets: [ "colours", "friends" ]

		};

	},
	testApp1Roles: function() {

		return {

			"su" : {

				"APIGET" : true,
				"sets": [ {

					"name": ".*",
					"CRUD": "CRUD"

				} ]

			},
			"colour-reviewer" : {

				"APIGET" : true,
				"sets" : [ {

					"name": "^colours$",
					"CRUD": "R"

				} ]

			}

		};

	}

};