# Google Books word scrapper

This NodeJS application retrieves words as a picture from book covers, using the Google Books API and its integrated OCR.
It just scrapes the data from the page, and extracts the part corresponding to the researched term from the book.

## Getting started
### Dependencies
**Words-scrapper** uses [sharp](https://github.com/lovell/sharp) to resize and crop the images.  
As a native NodeJS module, it may require some additional build toold such as Visual C++ libraries and python on Windows.

### Run
Launch the app by running :
`node scrap.js`

## TODO
* Use [phantom-pool](https://github.com/binded/phantom-pool) to optimize the browser instances between each HTTP request
* Provide a way to input a word to search 
* Find a better way to target interesting DOM elements to locate the word on the cover

##  History
* Working with Axiom and JSDom didn't lead too far as some of Google's Javascript wasn't properly executed, with the following stacktrace :
```javascript
Error: Uncaught [TypeError: Cannot read property 'closure_lm_485376' of null]
```