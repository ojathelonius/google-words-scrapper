/**
 * Words Scrapper using Axios and JSDOM
 * This should work... but does not.
 * The Google JS file that loads the book covers throws an error :   [TypeError: Cannot read property 'closure_lm_651988' of null]
 * 
 * Note : XMLSerializer is required before attempting to parse the source with JSDom, however there is currently a pull request that would add a w3c-xmlserializer out of the box
 * See : https://github.com/jsdom/jsdom/tree/feature/xmlserializer
 */

const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');
const XMLSerializer = require('xmldom').XMLSerializer;

axios.get('https://www.googleapis.com/books/v1/volumes?q=quilting')
    .then(jsonResponse => {
        var URL = jsonResponse.data.items.map(item => {

            axios.get(item.volumeInfo.previewLink).then(htmlResponse => {
                let dom = new JSDOM(htmlResponse.data,
                    {
                        runScripts: "dangerously",
                        resources: "usable",
                        pretendToBeVisual: true,
                        url: 'https://books.google.fr',
                        beforeParse(window) {
                            window.XMLSerializer = XMLSerializer
                        }
                    }
                );
                /* The following does not return the expected result, as the Javascript that loads its content is not executed, the div is empty */
                console.log(JSON.stringify(dom.window.document.querySelectorAll('.pageImageDisplay')));
                writeLog("test.html", htmlResponse.data);

            }).catch(error => {
                console.log(error);
            })
        })
    })
    .catch(error => {
        console.log(error);
    });


function writeLog(log, data) {
    fs.writeFile(log, data, function (err) {
        console.log(err);
    });
}
