module.exports = function(grunt){
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		uglify:{
			dist:{
				files:[
					{
						expand: true,
						cwd: 'static/script/',
						src: '*.js',
						dest: 'dist/script/',
						ext: '.min.js'
					}
				]
			}
		},
		sass:{
			dist:{
				files:[
					{
						expand: true,
						cwd: 'static/style/',
						src: '*.scss',
						dest: 'dist/style/',
						ext: '.css'
					}
				]
			}
		},
		cssmin: {
			minify: {
				expand: true,
				cwd: 'dist/style/',
				src: ['*.css','!*.min.css'],
				dest: 'dist/style/',
				ext: '.min.css'
			}
		},
		clean:{
			src: ["dist/style/*.css","!dist/style/*.min.css"]
		},
		connect:{
			server:{
				options:{
					port: "8888",
					hostname: "localhost",
					livereload: true
				}
			}
		},
		watch:{
			scripts:{
				files: ['static/script/*.js'],
				tasks: ['uglify']
			},

			sass: {
				files: ['static/style/*.scss'],
				tasks: ['sass','cssmin','clean']
			},

			html: {
				files: ['*.html'],
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-connect");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.registerTask('default',['uglify','sass','cssmin','clean','connect','watch']);
}
