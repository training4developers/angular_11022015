module.exports = function(grunt) {

	"use strict";

	var
		path = require("path"),
		wwwFolder = path.join("app", "www"),

		tplsFolder = path.join("assets", "tpls"),
		sassFolder = path.join("assets", "sass"),
		cssFolder = path.join(wwwFolder, "css"),
		cssMinFiles = {},
		cssCompressFiles = {},
		sassFiles = {},

		libsFolder = path.join(wwwFolder, "libs"),
		jsFolder = path.join(wwwFolder, "js"),

		jsFiles = {},
		jsMinifyFiles = {},
		jsCompressFiles = {};

	sassFiles[path.join(cssFolder, "site.css")] =
		path.join(sassFolder, "site.scss");

	cssMinFiles[path.join(cssFolder, "/site.min.css")] =
		path.join(cssFolder, "/site.css");

	cssCompressFiles[path.join(cssFolder, "/site.min.gz.css")] =
		path.join(cssFolder, "/site.min.css");

	jsFiles[path.join(jsFolder, "site.js")]	= [
			path.join(libsFolder, "jquery", "dist", "jquery.js"),
			path.join(libsFolder, "angular", "angular.js"),
			path.join(jsFolder, "app.js"),
			path.join(jsFolder, "app.constants.js"),
			path.join(jsFolder, "app.templates.js"),
			path.join(jsFolder, "checkin", "controllers", "*.js"),
			path.join(jsFolder, "reservations", "controllers", "*.js"),
			path.join(jsFolder, "app_init.js")
	];

	jsMinifyFiles[path.join(jsFolder, "site.min.js")]	=
		path.join(jsFolder, "site.js");

	jsCompressFiles[path.join(jsFolder, "site.min.gz.js")]	=
		path.join(jsFolder, "site.min.js");

	grunt.initConfig({
		webServer: {
			port: 8080,
			rootFolder: "app/www"
		},
		html2js: {
    	main: {
	    	options: {
					useStrict: true,
					module: "MyApp.Templates",
					htmlmin: {
				    collapseBooleanAttributes: true,
				    collapseWhitespace: true,
				    removeAttributeQuotes: true,
				    removeComments: true,
				    removeEmptyAttributes: true,
				    removeRedundantAttributes: true,
				    removeScriptTypeAttributes: true,
				    removeStyleLinkTypeAttributes: true
				  },
					singleModule: true,
					rename: function (moduleName) {
						return moduleName.slice(moduleName.lastIndexOf("/") + 1);
					}
	    	},
      	src: ['assets/**/*.tpl.html'],
      	dest: 'app/www/js/app.templates.js'
    	}
  	},
    sass: {
			main: {
        options: {
          sourcemap: "none"
        },
				files: sassFiles
			}
		},
		cssmin: {
			main: {
        options: {
          keepSpecialComments: 0,
          sourceMap: false
        },
				files: cssMinFiles
			}
		},
		uglify: {
			combine: {
        options: {
          compress: false,
          beautify: {
            beautify: true,
            indent_level: 2,
            comments: true
          },
          mangle: false,
        },
				files: jsFiles
			},
      minify: {
        options: {
          compress: {
            drop_debugger: true,
            unsafe: true,
            drop_console: false
          },
          beautify: false,
          mangle: {},
          screwIE8: true
        },
        files: jsMinifyFiles
      }
		},
    compress: {
      css: {
        options: {
          mode: 'gzip'
        },
        files: cssCompressFiles
      },
      js: {
        options: {
          mode: 'gzip'
        },
        files: jsCompressFiles
      }
    },
		watch: {
			tpl: {
				files: path.join(tplsFolder, "**", "*.tpl.html"),
				tasks: ["html2js:main"]
			},
      css: {
				files: path.join(sassFolder, "site.scss"),
				tasks: ["sass","cssmin","compress:css"]
			},
			js: {
				files: [
					path.join(jsFolder, "**", "*.js"),
					"!" + path.join(jsFolder, "*.min.js")],
				tasks: ["uglify:combine","compress:js"]
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.loadNpmTasks("grunt-contrib-compress");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks('grunt-html2js');

	grunt.registerTask("web-server", function() {

		const
			http = require("http"),
			express = require("express");

		let
			app = express(),
			webServerConfig = grunt.config("webServer");

		//this.async();

		app.use("/css", express.static(cssFolder, {
			setHeaders: function(res, filePath) {
				res.setHeader("Content-Type", "text/css");
				if (/.gz.css$/.test(filePath)) {
					res.setHeader("Content-Encoding", "gzip");
				}
			}
		}));

		app.use("/js", express.static(jsFolder, {
			setHeaders: function(res, filePath) {
				res.setHeader("Content-Type", "text/javascript");
				if (/.gz.js$/.test(filePath)) {
					res.setHeader("Content-Encoding", "gzip");
				}
			}
		}));

		app.use(express.static(webServerConfig.rootFolder));

		http.createServer(app).listen(webServerConfig.port, function() {
			console.log("web server started on port " + webServerConfig.port);
		});


	});

	grunt.registerTask("default", "standard dev task",
		["html2js", "sass", "cssmin", "compress:css", "uglify:combine", "uglify:minify", "compress:js", "web-server", "watch"]);

};
