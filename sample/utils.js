module.exports = {
  hash : function(inWord) {
    var hash = 0, i, chr, len;
    if (inWord.length === 0) return hash;
    for (i = 0, len = inWord.length; i < len; i++) {
      chr   = inWord.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  },
  createId : function() {
    return Date.now().toString();
  }
}
