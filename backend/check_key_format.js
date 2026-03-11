const sa = require('./serviceAccountKey.json');
const fs = require('fs');

const key = sa.private_key;
// Check if key has real newlines or literal \n strings
const hasRealNewlines = key.includes('\n');
const lines = key.split('\n').length;

const result = [
    `Key length: ${key.length}`,
    `Has real newlines: ${hasRealNewlines}`,
    `Line count when split by newline: ${lines}`,
    `First 60 chars: ${key.substring(0, 60)}`,
    `Last 40 chars: ${key.substring(key.length - 40)}`,
].join('\n');

console.log(result);
fs.writeFileSync('key_check.log', result);
