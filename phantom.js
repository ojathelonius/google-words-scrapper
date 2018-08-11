/**
 * Words Scrapper using PhantomJS, done quick and dirty
 * This lets Google do the hard OCR work, and just retrieves the result !
 * 
 */

const phantom = require('phantom');
const fs = require('fs');
const sharp = require('sharp');
const axios = require('axios');
const path = require('path');

const TEMP_PATH = path.resolve(__dirname, 'temp', 'temp.jpg');
const RESULT_PATH = path.resolve(__dirname, 'result', 'result.jpg');

(async function () {
    const instance = await phantom.create();
    const page = await instance.createPage();

    const status = await page.open('https://books.google.fr/books?id=k558CgAAQBAJ&printsec=frontcover&dq=quilting&hl=&cd=1&source=gbs_api#v=onepage&q=quilting&f=false');
    const testDom = await page.evaluate();
    const img = await page.evaluate(function () {
        return document.querySelector('.pageImageDisplay > div > img');
    })

    const imgSrc = img.src;
    const imgWidth = parseInt(img.width);

    /* Retrieve word highlight */
    const highlight = await page.evaluate(function () {
        return document.querySelectorAll('.pageImageDisplay')[0].querySelectorAll('div')[7].querySelector('div');
    })
    /* And its position */
    const highlightStyle = {
        height: parseInt(highlight.style.height),
        width: parseInt(highlight.style.width),
        left: parseInt(highlight.style.left),
        top: parseInt(highlight.style.top)
    }

    await downloadFrom(imgSrc);

    /* Resize image to fit Google's, then extract the highlighted part */
    sharp('./temp/temp.jpg')
        .resize(imgWidth)
        .extract(highlightStyle)
        .toFile(RESULT_PATH);

    await instance.exit();
})();

/**
 * Write any data to any file
 * @param {String} log 
 * @param {String} data 
 */
function writeLog(log, data) {
    fs.writeFile(log, data, function (err) {
        console.log(err);
    });
}

/**
 * Fetch image at URL
 * @param {String} url 
 */
async function downloadFrom(url) {

    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
    })

    response.data.pipe(fs.createWriteStream(TEMP_PATH))

    return new Promise((resolve, reject) => {
        response.data.on('end', () => {
            resolve();
        })
        response.data.on('error', () => {
            reject();
        })
    })
}