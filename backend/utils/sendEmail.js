const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const sendEmail = async (options) => {
    // MOCK MODE: Always "send" by logging
    console.log('-------- EMAIL MOCK MODE --------');
    console.log('To:', options.email);
    console.log('Message:', options.message);
    console.log('---------------------------------');

    // Write to a specific log file for easy retrieval
    const logPath = path.join(__dirname, '../mock_emails.log');
    const logData = `\n[${new Date().toISOString()}]\nTo: ${options.email}\nSubject: ${options.subject}\nMessage: ${options.message}\n-----------------------------------\n`;

    fs.appendFile(logPath, logData, (err) => {
        if (err) console.error('Failed to log mock email:', err);
    });

    // Return success immediately
    return Promise.resolve();
};

module.exports = sendEmail;
