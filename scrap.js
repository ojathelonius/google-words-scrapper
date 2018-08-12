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
const rimraf = require('rimraf');
/* Required to allow deleting temp files after use */
sharp.cache(false);


(async function () {
    searchForKeywords(['Omar','ma','tuer']);
})();

async function searchForKeywords(keywords) {
    console.log('Scrapping started, deleting previous results...')
    rimraf('./result/*', function () {
        console.log('Previous results deleted.');
    });
    for (keyword of keywords) {
        console.log('Searching for ' + keyword + '...')
        await searchBooks(keyword);
    }
    console.log('Scrapping done !');
}

/**
 * Search books based on a given keyword
 * @param {String} keyword 
 */
async function searchBooks(keyword) {
    const books = await axios('https://www.googleapis.com/books/v1/volumes?q=' + keyword);
    for (const [index, value] of books.data.items.entries()) {
        console.log('Scrapping book number ' + index + ' : ' + value.volumeInfo.previewLink);
        let wordFound = await getWord(value.volumeInfo.previewLink, keyword, index);
        if (wordFound) {
            return;
        }
    }

}

/**
 * Get word as a picture 
 * @param {String} previewUrl 
 * @param {String} keyword 
 * @param {Number} index 
 */
async function getWord(previewUrl, keyword, index) {
    let success = false;
    const instance = await phantom.create();
    const page = await instance.createPage();

    const status = await page.open(previewUrl);
    const testDom = await page.evaluate();
    const img = await page.evaluate(function () {
        return document.querySelector('.pageImageDisplay > div > img');
    })

    const imgSrc = img.src;
    const imgWidth = parseInt(img.width);

    const temp_path = path.resolve(__dirname, 'temp', 'temp_' + index + '.jpg');

    const highlightBox = await getHighlightBox(page);

    if (highlightBox) {
        await downloadFrom(imgSrc, temp_path);

        try {
            /* Resize image to fit Google's, then extract the highlighted part */
            await sharp(temp_path)
                .resize(imgWidth)
                .extract(highlightBox)
                .toFile('./result/' + keyword + '.jpg');
            success = true;

        } catch (err) {
            console.log(err);
            console.log('Error: cannot resize or crop the picture.')
        }

        try {
            rimraf('./temp/temp_' + index + '.jpg', function () {
                console.log('Temporary file deleted.')
            });

        } catch (err) {
            console.log('Error: cannot resize or crop the picture.')
        }

    }
    await instance.exit();

    return success;
}

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
 * @param {String} path
 */
async function downloadFrom(url, path) {

    const initialRequest = await axios({
        method: 'GET',
        url: 'https://google.com'
    })

    console.log('Downloading image from : ' + url);
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        headers: {
            'Cookie': initialRequest.headers['set-cookie']
        }
    })

    response.data.pipe(fs.createWriteStream(path))

    return new Promise((resolve, reject) => {
        response.data.on('end', () => {
            resolve();
        })
        response.data.on('error', () => {
            reject();
        })
    })
}

/**
 * Retrieve highlightbox position and properties
 * @param {Page} page 
 */
async function getHighlightBox(page) {
    let highlightStyle;

    try {
        /* Retrieve word highlight */
        const highlight = await page.evaluate(function () {
            return document.querySelectorAll('.pageImageDisplay')[0].querySelectorAll('div')[7].querySelector('div');
        })
        /* And its position */
        highlightStyle = {
            height: parseInt(highlight.style.height),
            width: parseInt(highlight.style.width),
            left: parseInt(highlight.style.left),
            top: parseInt(highlight.style.top)
        }
    } catch (err) {
        console.log('Error: chances are there is no highlighted text on this cover.')
    }
    return highlightStyle;
}