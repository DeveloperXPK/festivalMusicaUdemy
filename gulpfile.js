import { src, dest, watch, series, parallel } from 'gulp';
import * as dartSass from 'sass'
import gulpSass from 'gulp-sass';


const sass = gulpSass(dartSass);

function js(done) {

    src('src/js/app.js')
        .pipe(dest('build/js'));

    done();
}

function css(done) {

    src('src/scss/app.scss', { sourcemaps: true }) // Identificar el archivo SASS
        .pipe(sass().on('error', sass.logError)) // Compilarlo
        .pipe(dest('build/css', { sourcemaps: true })) // Almacenarlo en el disco duro

    done();
}

function dev(done) {
    watch('src/scss/**/*.scss', css);
    watch('src/js/**/*.js', js);

    done();
}

export default series(js, css, dev);

export { js, sass, css, dev }; 