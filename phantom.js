const phantom = require('phantom');
const fs = require('fs');

(async function () {
    const instance = await phantom.create();
    const page = await instance.createPage();

    const status = await page.open('https://books.google.fr/books?id=k558CgAAQBAJ&printsec=frontcover&dq=quilting&hl=&cd=1&source=gbs_api#v=onepage&q=quilting&f=false');
    const testDom = await page.evaluate();
    const src = await page.evaluate(function() {
        return document.querySelector('.pageImageDisplay > div > img').src;
    })
    console.log(src);
    await instance.exit();
})();

function writeLog(log, data) {
    fs.writeFile(log, data, function (err) {
        console.log(err);
    });
}