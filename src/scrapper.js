const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs');
const stripHtml = require('string-strip-html'); 

const fetchHTML = async (url) => {
  const { data } = await axios.get(url)
  return cheerio.load(data)
}

/** scraps the text located in a website, and saves it. */
const scrapAndSaveSite = (url, fileName) => {
  fetchHTML(url)
    .then(data => {
      let content = data('body').text();
      content = stripHtml(content).result;

      fs.writeFile(
        `./documents/${fileName}.txt`,
        content,
        (err) => {
          if (err) return console.log(err);
          console.log(`Create ${fileName}.txt`);
        }
      );
    })
    .catch(e => {
      console.log('error');
      console.log(e);
    });
};

module.exports = {
  scrapAndSaveSite
};
