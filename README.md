# Google Books word scrapper

This NodeJS application retrieves words as a picture from book covers, using the Google Books API and its integrated OCR.
It just scrapes the data from the page, and extracts the part corresponding to the researched term from the book.

### Example

Inputting "I am the one who knocks" yields the following result :

![Scrapping result](https://i.imgur.com/Wcdd2RC.jpg "Result")


## Getting started
### Dependencies
**Words-scrapper** uses [sharp](https://github.com/lovell/sharp) to resize and crop the images.  
As a native NodeJS module, it may require some additional build toold such as Visual C++ libraries and python on Windows.

### How to use
```javascript
const WordScrapper = require('./scrap.js');

const wordScrapper = new WordScrapper();
wordScrapper.init().then(() => {
  wordScrapper.search(['quilting']);
});
```


## TODO
* Use [phantom-pool](https://github.com/binded/phantom-pool) to optimize the browser instances between each HTTP request
* Provide a way to input a word to search with an UI
* Find a better way to target interesting DOM elements to locate the word on the cover
* Prioritize covers over normal pages (use querySelectorAll and iterate over the nodeList)
* Proper error handling
* Use a Promise based rimraf
* Allow FS to create directories if missing
* Proper linting/babel
* Differenciate exposed/private functions and document them

##  History
* Working with Axiom and JSDom didn't lead too far as some of Google's Javascript wasn't properly executed, with the following stacktrace :
```javascript
Error: Uncaught [TypeError: Cannot read property 'closure_lm_485376' of null]
```
* I had an issue with Google not serving some files. I found out that it was because it required the NID cookie in the outgoing request. [More details here](https://stackoverflow.com/questions/51807077/image-download-issue-with-nodejs/51812420#51812420).

## Scrapping caveats
* Full size cover picture does not always exist, and its low res version is unsufficient to extract an image properly
* Google references pages as well as book covers, and applies OCR on these, thus results could actually be extracted from pages rather than the cover.
* Some images can be cropped too thinly due to improper highlighting, while other can actually include some other text.
* I cannot seem to use concurrent PhantomJS instances performance-wise, as I run out of memory doing so.