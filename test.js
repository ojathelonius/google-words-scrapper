/**
 * Testing purposes
 */

const WordScrapper = require('./scrap.js');

const wordScrapper = new WordScrapper();
wordScrapper.init().then(() => {
  wordScrapper.search(['quilting']);
});
