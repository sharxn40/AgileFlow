const fs = require('fs');
const data = JSON.parse(fs.readFileSync('UML DIAGRAMS  & Table Design.json', 'utf8'));
let out = '';
function extractStrings(obj) {
    if (typeof obj === 'string') { }
    else if (Array.isArray(obj)) { obj.forEach(extractStrings); }
    else if (typeof obj === 'object' && obj !== null) {
        if (obj.T !== undefined) { out += decodeURIComponent(obj.T) + " "; }
        else { Object.values(obj).forEach(extractStrings); }
    }
}
extractStrings(data);
fs.writeFileSync('pdf_out_utf8.txt', out, 'utf8');
