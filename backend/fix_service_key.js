/**
 * This script reads the serviceAccountKey.json, fixes any
 * private_key formatting issues, and rewrites the file.
 */
const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, 'serviceAccountKey.json');
const sa = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

// Fix 1: Replace literal \n with real newlines (if corrupted)
let key = sa.private_key;
if (!key.includes('\n')) {
    key = key.replace(/\\n/g, '\n');
    console.log('Fixed: Replaced literal \\n with real newlines');
} else {
    console.log('Newlines look fine. Checking for other issues...');
}

// Fix 2: Ensure proper PEM structure - no trailing spaces on lines
const lines = key.split('\n');
const cleanedLines = lines.map(l => l.trim());
key = cleanedLines.join('\n');

// Fix 3: Ensure ends with newline
if (!key.endsWith('\n')) {
    key += '\n';
}

sa.private_key = key;

fs.writeFileSync(keyPath, JSON.stringify(sa, null, 2));
console.log('serviceAccountKey.json rewritten successfully.');
console.log('Line count:', key.split('\n').length);
console.log('First line:', key.split('\n')[0]);
console.log('Last non-empty line:', key.split('\n').filter(l => l).pop());
