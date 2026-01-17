import path from 'path';
import fs from 'fs';
import { glob } from 'glob'
import { src, dest, watch, series, parallel } from 'gulp';
import * as dartSass from 'sass'
import gulpSass from 'gulp-sass';
import sharp from 'sharp';


const sass = gulpSass(dartSass);

import terser from 'gulp-terser';

function js(done) {

    src('src/js/app.js')
        .pipe(terser())
        .pipe(dest('build/js'));

    done();
}

function css(done) {

    src('src/scss/app.scss', { sourcemaps: true }) // Identificar el archivo SASS
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError)) // Compilarlo
        .pipe(dest('build/css', { sourcemaps: true })) // Almacenarlo en el disco duro

    done();
}

export async function crop(done) {
    const inputFolder = 'src/img/gallery/full'
    const outputFolder = 'src/img/gallery/thumb';
    const width = 250;
    const height = 180;
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true })
    }
    const images = fs.readdirSync(inputFolder).filter(file => {
        return /\.(jpg)$/i.test(path.extname(file));
    });
    try {
        images.forEach(file => {
            const inputFile = path.join(inputFolder, file)
            const outputFile = path.join(outputFolder, file)
            sharp(inputFile)
                .resize(width, height, {
                    position: 'centre'
                })
                .toFile(outputFile)
        });

        done()
    } catch (error) {
        console.log(error)
    }
}
export async function imagenes(done) {
    const srcDir = './src/img';
    const buildDir = './build/img';
    const images = await glob('./src/img/**/*{jpg,png}')

    images.forEach(file => {
        const relativePath = path.relative(srcDir, path.dirname(file));
        const outputSubDir = path.join(buildDir, relativePath);
        procesarImagenes(file, outputSubDir);
    });
    done();
}

function procesarImagenes(file, outputSubDir) {
    if (!fs.existsSync(outputSubDir)) {
        fs.mkdirSync(outputSubDir, { recursive: true })
    }
    const baseName = path.basename(file, path.extname(file))
    const extName = path.extname(file)
    const outputFile = path.join(outputSubDir, `${baseName}${extName}`)
    const outputFileWebp = path.join(outputSubDir, `${baseName}.webp`)

    const options = { quality: 80 }
    sharp(file).jpeg(options).toFile(outputFile)
    sharp(file).webp(options).toFile(outputFileWebp)
}

function dev(done) {
    watch('src/scss/**/*.scss', css);
    watch('src/js/**/*.js', js);
    watch('src/js/**/*.js', js);
    watch('src/img/**/*.{jpg,png}', imagenes);

    done();
}

export default series(crop, js, css, imagenes, dev);

export { js, sass, css, dev }; 