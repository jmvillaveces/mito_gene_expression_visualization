module.exports = function(grunt) {
    
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['gruntfile.js', 'main.js', 'js/**/*.js', 'tests/**/*.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        },
        browserify: {
            'dist/js/App.js': ['main.js']
        },
        handlebars: {
            compile: {
                options: {
                    node: true,
                    namespace: 'Templates',
                    partialsUseNamespace: true,
                    processName: function(filePath) {
                        var file = filePath.replace(/.*\/(\w+)\.hbs/, '$1');
                        return file;
                    }
                },
                files:{
                    'js/templates.js': ['templates/*.hbs']
                }
            }
        },
        stylus: {
            'dist/css/App.css': ['css/*.styl'], // compile and concat into single file
            options: {
                urlfunc: {
                    name:'embedurl',
                    limit:false
                },
                'include css':true
            }
        },
        clean: ['dist'],
        copy: [
            { expand: true,flatten:true, src: ['resources/*.*', 'resources/**/*.*'], dest: 'dist/' }
        ],
        simplemocha: {
            options: {
                globals: ['expect', '_', '$', 'jQuery', 'Backbone'],
                timeout: 3000,
                ignoreLeaks: true,
                reporter: 'tap'
            },
            all: { src: ['tests/**/*.js'] }
        },
        uglify: {
            my_target: {
                files: {
                    'dist/js/App.min.js': ['dist/js/App.js']
                }
            }
        }
        /*watch: {
            handlebars:{
                files: ['<%= handlebars.compile.files %>'],
                tasks: ['handlebars', 'browserify']
            },
            hinting:{
                files: ['<%= jshint.files %>'],
                tasks: ['jshint']
            },
            browserify:{
                files: ['<%= jshint.files %>'],
                tasks: ['browserify']
            },
            stylus:{
                files: ['css/*.styl'],
                tasks: ['stylus']
            }
        }*/
    });
    
    //Tasks
    grunt.registerTask('dist', ['clean', 'jshint', 'simplemocha', 'handlebars', 'copy', 'browserify', 'stylus', 'uglify']); //Generates dist folder
    
    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
};
