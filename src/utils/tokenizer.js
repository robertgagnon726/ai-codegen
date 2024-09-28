const { encode } = require('gpt-3-encoder');

/**
 * Calculate the number of tokens in the given content.
 * @param {string} content - The text content to tokenize.
 * @returns {number} - The number of tokens in the content.
 */
function getTokenCount(content) {
    if (!content) {
        return 0;
    }
    try {
        return encode(content).length;
    } catch (error) {
        console.error('Error tokenizing content:', error);
        return 0;
    }
}

module.exports = { getTokenCount };
