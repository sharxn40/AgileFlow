const fs = require('fs');
const path = require('path');
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

try {
    const serviceAccount = require(serviceAccountPath);
    console.log("Project ID:", serviceAccount.project_id);
    console.log("Client Email:", serviceAccount.client_email);
    console.log("Private Key Length:", serviceAccount.private_key ? serviceAccount.private_key.length : 0);
    console.log("Private Key Start:", serviceAccount.private_key ? serviceAccount.private_key.substring(0, 50) : "N/A");

    // Check for newlines
    const hasNewLines = serviceAccount.private_key.includes('\n');
    console.log("Private Key has '\\n':", hasNewLines);

    // Check for actual newline characters (carriage return)
    const hasLiteralNewLines = serviceAccount.private_key.includes('\r') || serviceAccount.private_key.match(/\r|\n/);
    console.log("Private Key has Regex NewLines:", !!hasLiteralNewLines);

} catch (e) {
    console.error("Error reading key:", e);
}
