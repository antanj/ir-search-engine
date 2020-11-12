const csv = require('csv-parser');
const fs = require('fs');
const nlp = require('./nlp');

/** get document sources from the document_sources.csv */
const getDocumentSources = () => {
  const documents = [];
  return new Promise ((resolve, reject) => {
    fs.createReadStream('document_sources.csv')
    .pipe(csv())
    .on('data', (row) => {
      documents.push(row);
    })
    .on('end', () => {
      resolve(documents);
    })
    .on('error', reject);
  });
};

const getDocumentsByKey = async () => {
  const documents = await getDocumentSources();

  const documentsByKey = documents.reduce((acc, val) => {
    acc[`${val.engine}__${val.rank}`] = val;
    return acc;
  }, {}); 

  return documentsByKey;
};

const collectWordsFromDocument = (fileName, config) => {
  return new Promise ((resolve, reject) => {
    fs.readFile(`./documents/${fileName}.txt`, 'utf8', function(err, data) {
      if (err) throw err;
      // console.log('OK: ' + fileName);
      // console.log(data);

      const terms  = data.split(/[\t'ˈˌ:{}.,  ;:()|\[\]\n=?/"]/g).map(item => {
        let updatedItem = item;

        if (config.lemmatize) {
          updatedItem = nlp.lemmatize(updatedItem);
        }

        return updatedItem.toLowerCase().trim();
      }).filter(item => !!item);
      resolve(terms);

      // fs.writeFile(
      //   `test.txt`,
      //   terms.join('\n'),
      //   (err) => {
      //     if (err) return console.log(err);
      //     console.log(`Create test.txt`);
      //   }
      // );
    });
  });
};

const buildDocumentIndex = async (config = {}) => {
  const documents = await getDocumentSources();

  console.log('Collecting terms from documents...');
  const termsByDocument = {};
  const result = await Promise.all(
    documents.map(doc => {
      const docKey = `${doc.engine}__${doc.rank}`;
      return collectWordsFromDocument(docKey, config).then(terms => {
        // console.log(terms);
        termsByDocument[docKey] = terms;
      });
    })
  );
  console.log('...done.');

  const documentsByKey = documents.reduce((acc, val) => {
    acc[`${val.engine}__${val.rank}`] = val;
    return acc;
  }, {});

  const precedenceIndex = {};

  console.log('Indexing...');
  Object.entries(termsByDocument).forEach(([key, terms]) => {
    terms.forEach(term => {
      if (!precedenceIndex[term]) {
        precedenceIndex[term] = Object.keys(documentsByKey).reduce((acc, item) => {
          acc[item] = 0;
          return acc;
        }, {});
      }
      precedenceIndex[term][key] += 1;
    });
  });
  console.log('...done.')

  return precedenceIndex;
};

module.exports = {
  getDocumentSources,
  getDocumentsByKey,
  buildDocumentIndex
};
