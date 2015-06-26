module.exports = function(grunt) {

  grunt.registerTask(('connect'), [ 'connect' ]);

  grunt.initConfig({

    connect: {
        options: {

          livereload: true,
        },
        files: ['app/javascript/*.js']
      }


  });

  grunt.loadNpmTasks('grunt-contrib-connect');

};
