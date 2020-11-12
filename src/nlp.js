const winkLemmatize = require( 'wink-lemmatizer' );


const lemmatize = (word) => {
  const lemmaNoun = winkLemmatize.noun(word);
  if (lemmaNoun != word) {
    return lemmaNoun;
  }
  const lemmaVerb = winkLemmatize.verb(word);
  if (lemmaVerb != word) {
    return lemmaVerb;
  }
  const lemmaAdjective = winkLemmatize.adjective(word);
  if (lemmaAdjective != word) {
    return lemmaAdjective;
  }
  
  return word;
};

module.exports = {
  lemmatize
};
