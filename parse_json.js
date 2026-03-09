const fs = require('fs');
const data = JSON.parse(fs.readFileSync('UML DIAGRAMS  & Table Design.json', 'utf8'));
data.formImage.Pages.forEach(p => {
    p.Texts.forEach(t => {
        process.stdout.write(decodeURIComponent(t.R[0].T) + ' ');
    });
    console.log();
});
