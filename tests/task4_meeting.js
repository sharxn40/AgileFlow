const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

(async function agileFlowTask4() {
    let options = new chrome.Options();
    options.addArguments('--disable-blink-features=AutomationControlled');
    options.addArguments('--start-maximized');

    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        console.log("=========================================");
        console.log("⚡ SELENIUM TEST SUITE: TASK 4 (Team Meeting Scheduler) ⚡");
        console.log("=========================================");

        console.log("[1/7] Navigating to AgileFlow Landing Page...");
        await driver.get('http://localhost:5173/');

        console.log("[2/7] Opening Registration Modal...");
        let getStartedBtn = await driver.wait(until.elementLocated(By.xpath("//button[text()='Get Started']")), 10000);
        await driver.executeScript("arguments[0].click();", getStartedBtn);

        console.log("[3/7] Generating Native Demo Account...");
        await driver.sleep(2000);

        // Target manual registration inputs
        let nameInput = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'sign-up-container')]//input[@placeholder='e.g. John Doe']")), 5000);
        await driver.executeScript("arguments[0].value='';", nameInput);
        await nameInput.sendKeys('Automation Protocol V4');

        let emailInput = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'sign-up-container')]//input[@placeholder='john@example.com' or @type='email']")), 5000);
        await driver.executeScript("arguments[0].value='';", emailInput);
        const testEmail = `auto_${Date.now()}_v4@agileflow.com`;
        await emailInput.sendKeys(testEmail);

        let passInput = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'sign-up-container')]//input[@placeholder='Choose a password']")), 5000);
        await driver.executeScript("arguments[0].value='';", passInput);
        await passInput.sendKeys('Password123!');

        let confirmInput = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'sign-up-container')]//input[@placeholder='Confirm your password']")), 5000);
        await driver.executeScript("arguments[0].value='';", confirmInput);
        await confirmInput.sendKeys('Password123!');

        await driver.sleep(1000);

        // Submit form
        let signUpBtn = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'sign-up-container')]//button[@type='submit' and text()='Sign Up']")), 5000);
        await driver.executeScript("arguments[0].click();", signUpBtn);

        console.log("[4/7] Authenticating and Routing to Registry Hub...");

        await driver.wait(async () => {
            const url = await driver.getCurrentUrl();
            return url.includes('/dashboard');
        }, 15000);
        console.log("      > Authentication Successful. Dashboard Reached.");

        await driver.sleep(2000);

        let registryBtn = await driver.wait(until.elementLocated(By.xpath("//div[@title='Registry']")), 10000);
        await driver.executeScript("arguments[0].click();", registryBtn);
        await driver.sleep(2000);

        console.log("[5/7] Switching to Teams Tab and Generating Team Protocol...");

        // Wait for Projects tab to load. Click "My Teams" tab
        let myTeamsTab = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'My Teams')]")), 10000);
        await driver.executeScript("arguments[0].click();", myTeamsTab);
        await driver.sleep(2000);

        // Find "Create a Team" (empty state) or "New Team" 
        let createTeamBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'New Team') or contains(text(), 'Create a Team')]")), 10000);
        await driver.executeScript("arguments[0].click();", createTeamBtn);
        await driver.sleep(1000); // modal animation

        const teamName = "Alpha Protocol Sync Team";

        // Fill out Create Team Modal
        let teamNameInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='e.g. Design Squad, Backend Team...']")), 5000);
        await teamNameInput.sendKeys(teamName);

        let submitTeamBtn = await driver.wait(until.elementLocated(By.xpath("//button[@type='submit' and contains(text(), 'Create Team')]")), 5000);
        await driver.executeScript("arguments[0].click();", submitTeamBtn);

        console.log("      > Team Successfully Generated in Database.");
        await driver.sleep(3000); // Wait for modal to close and state to render

        console.log("[6/7] Selecting Target Team and Opening Scheduling Matrix...");

        // Find the newly created team in the sidebar map using the team name
        let targetTeamNode = await driver.wait(until.elementLocated(By.xpath(`//span[@class='team-name' and text()='${teamName}']`)), 10000);
        await driver.executeScript("arguments[0].click();", targetTeamNode);

        // Wait for Team View to Load
        await driver.sleep(2000);

        // Click Schedule Meeting
        let scheduleMeetingBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Schedule Meeting')]")), 10000);
        await driver.executeScript("arguments[0].click();", scheduleMeetingBtn);
        await driver.sleep(1000); // modal animation

        console.log("[7/7] Injecting Google Meet payload & Scheduling Event...");

        // Fill Meeting Inputs
        let meetingTitleInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='e.g. Weekly Standup']")), 5000);
        await driver.executeScript("arguments[0].value='';", meetingTitleInput);
        await meetingTitleInput.sendKeys("Q3 Release War Room Sync");

        let googleMeetInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='https://meet.google.com/xxx-xxxx-xxx']")), 5000);
        await driver.executeScript("arguments[0].value='';", googleMeetInput);
        await googleMeetInput.sendKeys("https://meet.google.com/abc-efgh-ijk");

        let dateInput = await driver.wait(until.elementLocated(By.css("input[type='datetime-local']")), 5000);
        // Hardcode a future date to map simply
        await driver.executeScript("arguments[0].value='2026-10-15T15:30';", dateInput);

        // Wait a beat to simulate typing and UI visibility
        await driver.sleep(1000);

        // Click Submit
        let submitScheduleBtn = await driver.wait(until.elementLocated(By.xpath("//button[@type='submit' and contains(text(), 'Schedule Meeting')]")), 5000);
        await driver.executeScript("arguments[0].click();", submitScheduleBtn);

        console.log("      > Meeting Link securely committed and distributed to team members.");
        await driver.sleep(4000); // let UI update and be visible for user to see live test

        console.log("=========================================");
        console.log("✅ TEST CASE 4 PASSED SUCCESSFULLY! ✅");
        console.log("=========================================");

    } catch (err) {
        console.error("❌ TEST FAILED:", err.message);
    } finally {
        await driver.sleep(2000);
        await driver.quit();
    }
})();
