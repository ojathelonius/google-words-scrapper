/**
 * Testing purposes
 */

const WordScrapper = require('./scrap.js');

const wordScrapper = new WordScrapper();
wordScrapper.init().then(() => {
  wordScrapper.search("I am the one who knocks".split(" "));
});
