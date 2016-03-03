const gulp = require('gulp');

const obt = require('origami-build-tools');

function buildFile(opts){
	return obt.build.js(gulp, opts);
}

gulp.task('build', function() {
	
	const files = ['main.js', 'background.js', 'popup.js'];
	
	files.forEach(file => {
		buildFile({
			js: './src/scripts/' + file,
			buildJs: file,
			buildFolder: './build/scripts/',
			sourcemaps : false,
			env : "production"
		});
	});
	
});

gulp.task('verify', function() {
	return obt.verify(gulp);
});

gulp.task('default', ['verify', 'build']);