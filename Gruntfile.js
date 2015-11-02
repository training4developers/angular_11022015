module.exports = function(grunt) {

	"use strict";

	grunt.initConfig({
		webServer: {
			port: 8080,
			rootFolder: "app/www"
		}
	});

	grunt.registerTask("default", function() {

		const
			http = require("http"),
			express = require("express");

		let
			app = express(),
			webServerConfig = grunt.config("webServer");

		this.async();

		app.use(express.static(webServerConfig.rootFolder));

		http.createServer(app).listen(webServerConfig.port, function() {
			console.log("web server started on port " + webServerConfig.port);
		});


	});

};
