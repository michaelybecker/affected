module.exports = function(grunt) {

  grunt.registerTask(('watch'), [ 'watch' ]);

  grunt.initConfig({

    watch: {
      js: {

        files: ['javascript/*.js'],
        options: {

          livereload: true,
        }
      },


    }


  });

  grunt.loadNpmTasks('grunt-contrib-watch');

};
