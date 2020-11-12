
const prompt = require('prompt-sync')();
const reader = require('./src/reader');
const nlp = require('./src/nlp');
const config = require('./config')

const validateInput = (input) => {
  let valid = true;
  const splitInput = input.split(' ');

  splitInput.forEach((val, i) => {
    if (i % 2 !== 0) {
      valid = val.toLowerCase() === 'and'
    }
  });

  return valid && splitInput.length > 0;
};

(async () => {
  const termsByDocumentIncidence = await reader.buildDocumentIndex({ lemmatize: config.lemmatize });
  const documentsByKey = await reader.getDocumentsByKey();

  const performSearch = (input) => {
    const searchTerms = input.split(' ')
      .filter((val, i) => i % 2 === 0)
      .map(searchTerm => {
        return config.lemmatize ?
          nlp.lemmatize(searchTerm)
          : searchTerm;
      });

    const resultSets = [];
    searchTerms.forEach(term => {
      const resultSet = new Set();
      Object.entries(termsByDocumentIncidence[term.toLowerCase()] || {}).forEach(([document, incidence]) => {
        if (incidence > 0) {
          resultSet.add(document);
        }
      });
      resultSets.push(resultSet);
    });

    const result = resultSets.reduce((acc, value) => {
      return new Set([...acc].filter(x => value.has(x)));
    }, resultSets[0]);

    const resultArray = [...result];

    if (resultArray.length === 0) {
      console.log('');
      console.log('No results found.');
      console.log('');
      return;
    }

    console.log('');
    console.log(`${resultArray.length} results found for: ${input}`);
    console.log('');
    resultArray.forEach((val, i) => {
      const document = documentsByKey[val];
      console.log(i + 1);
      console.log(`Document name: ${val}.txt`);
      console.log(`Engine: ${document.engine}`);
      console.log(`Url: ${document.url}`);
      console.log('');
    });


    return;
  };


  console.log('Search engine ready.');
  console.log('');
  console.log('Enter a term(s) to search for in the document database');
  console.log('Available operators: AND');
  console.log('Type /q to exit');
  console.log('---------------');

  let continueSearch = true;
  while (continueSearch) {
    const input = prompt('Search: ');
    if (input === '/q') {
      break;
    }

    if (!validateInput(input)) {
      console.log('Invalid search.');
    } else {
      performSearch(input);
    }
  }
})();
