const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

const target = path.join(__dirname, 'UML DIAGRAMS  & Table Design.pdf');

try {
    const dataBuffer = fs.readFileSync(target);
    pdf(dataBuffer).then(function (data) {
        console.log("PDF_TEXT_START");
        console.log(data.text);
        console.log("PDF_TEXT_END");
    }).catch(console.error);
} catch (e) {
    console.error("Read failure:", e.message);
}
