module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				mangle: false
			},
			build: {
				src: 'src/js/mapalive.js',
				dest: 'build/js/mapalive.js'
			}
		},
		cssmin: {
			target: {
		    	files: [{
		      		expand: true,
		      		cwd: 'src/css/',
		      		src: ['*.css'],
		      		dest: 'build/css',
		      		ext: '.css'
		    	}]
		  	}
		},
		htmlmin: {
		    dist: {
		      	options: {
		        	removeComments: true,
		        	collapseWhitespace: true
		      	},
		      	files: {
		        	'build/index.html': 'src/index.html'
		        	// 'destination': 'source'
		      	}
		    }
		},
  		watch: {
    		files: ['src/js/mapalive.js', 'src/css/mapalive.css', 'src/index'],
      		tasks: ['default']
  		}
	});

	grunt.registerTask('default', [
		'uglify',
		'cssmin',
		'htmlmin',
		'watch'
		]);
}

// TODO PROBLEM: when changing js and css files to min.js and min.css, how to change the path in the html files to include the .min.