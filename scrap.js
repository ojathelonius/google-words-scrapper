/**
 * Words Scrapper using PhantomJS
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


const GOOGLE_API_URL = 'https://www.googleapis.com/books/v1/volumes?q=';

class WordScrapper {

    constructor() {

    }

    async init() {
        console.log('Initializing...');

        // Initialize PhantomJS instance
        this.instance = await phantom.create();

        // Retrieve Google NID cookie
        this.initialRequest = await axios({
            method: 'GET',
            url: 'https://google.com',
        });

        console.log('Complete.');
    }

    async search(keywords) {
        for (const keyword of keywords) {
            console.log(`Searching for ${keyword}...`);
            await this.searchKeyword(keyword);
        }
    }

    async searchKeyword(keyword) {
        const books = await axios(GOOGLE_API_URL + keyword);
        for (const [index, value] of books.data.items.entries()) {
            console.log(`Scrapping book number ${index} : ${value.volumeInfo.previewLink}`);
            const wordFound = await this.retrieveKeyword(value.volumeInfo.previewLink, keyword, index);
            if (wordFound) {
                return;
            }
        }
    }

    async retrieveKeyword(url, keyword, index) {
        let success = false;


        const page = await this.instance.createPage();
        const status = await page.open(url);
        const img = await page.evaluate(function () { return document.querySelector('.pageImageDisplay > div > img') });

        const imgSrc = img.src;
        const imgWidth = parseInt(img.width);

        const temp_path = path.resolve(__dirname, 'temp', `temp_${index}.jpg`);

        const highlightBox = await this.getHighlightBox(page);

        if (highlightBox) {
            await this.downloadFrom(imgSrc, temp_path);

            try {
                // Resize image to fit Google's, then extract the highlighted part
                await sharp(temp_path)
                    .resize(imgWidth)
                    .extract(highlightBox)
                    .toFile(`./result/${keyword}.jpg`);
                success = true;
            } catch (err) {
                console.log('Error: cannot resize or crop the picture.');
            }

            try {
                rimraf(`./temp/temp_${index}.jpg`, () => {
                    console.log('Temporary file deleted.');
                });
            } catch (err) {
                console.log('Error: cannot resize or crop the picture.');
            }
        }

        return success;
    }

    async downloadFrom(url, path) {
        const response = await axios({
            method: 'GET',
            url,
            responseType: 'stream',
            headers: {
                Cookie: this.initialRequest.headers['set-cookie'],
            },
        });

        response.data.pipe(fs.createWriteStream(path));

        return new Promise((resolve, reject) => {
            response.data.on('end', () => {
                resolve();
            });
            response.data.on('error', () => {
                reject();
            });
        });
    }

    async getHighlightBox(page) {
        let highlightStyle;

        try {
            const highlight = await page.evaluate(function () { return document.querySelectorAll('.pageImageDisplay')[0].querySelectorAll('div')[7].querySelector('div') });

            highlightStyle = {
                height: parseInt(highlight.style.height),
                width: parseInt(highlight.style.width),
                left: parseInt(highlight.style.left),
                top: parseInt(highlight.style.top),
            };
        } catch (err) {
            console.log('Error: chances are there is no highlighted text on this cover.');
        }

        return highlightStyle;
    }
}

module.exports = WordScrapper;
