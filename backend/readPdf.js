const fs = require('fs');
const pdf = require('node_modules/pdf-parse');
const path = require('path');

const target = path.resolve('../UML DIAGRAMS  & Table Design.pdf');

try {
    const dataBuffer = fs.readFileSync(target);
    pdf(dataBuffer).then(function (data) {
        console.log(data.text);
    }).catch(console.error);
} catch (e) {
    console.error("Read failure:", e.message);
}
