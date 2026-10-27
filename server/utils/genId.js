const crypto = require('crypto');

/**
 * Generates human-readable business IDs: ${prefix}-${8_CHAR_RANDOM_UUID}
 * Example: MOV-3B8A72F1, THR-8F12C94A, SHW-72A190BC, BKG-91A23D4E
 */
const genId = (prefix) => {
  return `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
};

module.exports = { genId };
