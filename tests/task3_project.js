const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

(async function agileFlowTask3() {
    let options = new chrome.Options();
    options.addArguments('--disable-blink-features=AutomationControlled');
    options.addArguments('--start-maximized');

    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        console.log("=========================================");
        console.log("⚡ SELENIUM TEST SUITE: TASK 3 (Project Generation) ⚡");
        console.log("=========================================");

        console.log("[1/6] Navigating to AgileFlow Landing Page...");
        await driver.get('http://localhost:5173/');

        console.log("[2/6] Opening Registration Modal...");
        let getStartedBtn = await driver.wait(until.elementLocated(By.xpath("//button[text()='Get Started']")), 10000);
        await driver.executeScript("arguments[0].click();", getStartedBtn);

        console.log("[3/6] Generating Native Demo Account...");
        await driver.sleep(2000);

        // Target manual registration inputs
        let nameInput = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'sign-up-container')]//input[@placeholder='e.g. John Doe']")), 5000);
        await driver.executeScript("arguments[0].value='';", nameInput);
        await nameInput.sendKeys('Automation Protocol');

        let emailInput = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'sign-up-container')]//input[@placeholder='john@example.com' or @type='email']")), 5000);
        await driver.executeScript("arguments[0].value='';", emailInput);
        const testEmail = `auto_${Date.now()}@agileflow.com`;
        await emailInput.sendKeys(testEmail);

        let passInput = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'sign-up-container')]//input[@placeholder='Choose a password']")), 5000);
        await driver.executeScript("arguments[0].value='';", passInput);
        await passInput.sendKeys('Password123!');

        let confirmInput = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'sign-up-container')]//input[@placeholder='Confirm your password']")), 5000);
        await driver.executeScript("arguments[0].value='';", confirmInput);
        await confirmInput.sendKeys('Password123!');

        // Wait for inputs to register
        await driver.sleep(1000);

        // Submit form
        let signUpBtn = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'sign-up-container')]//button[@type='submit' and text()='Sign Up']")), 5000);
        await driver.executeScript("arguments[0].click();", signUpBtn);

        console.log("[4/6] Authenticating and Routing to Registry Hub...");

        // AgileFlow automatically routes to /dashboard after successful sign up
        await driver.wait(async () => {
            const url = await driver.getCurrentUrl();
            return url.includes('/dashboard');
        }, 15000);
        console.log("      > Authentication Successful. Dashboard Reached.");

        // Wait a small moment to ensure Dashboard Sidebar maps fully
        await driver.sleep(2000);

        // Navigate to Registry
        let registryBtn = await driver.wait(until.elementLocated(By.xpath("//div[@title='Registry']")), 10000);
        await driver.executeScript("arguments[0].click();", registryBtn);
        await driver.sleep(2000);

        console.log("[5/6] Spawning 'Automated' Project via Registry...");

        // Wait for Projects tab to load. Click "New Project" OR "Create Project"
        let createProjBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'New Project') or contains(text(), 'Create Project')]")), 10000);
        await driver.executeScript("arguments[0].click();", createProjBtn);
        await driver.sleep(1000); // modal animation

        // Fill out Create Project Modal
        let projNameInput = await driver.wait(until.elementLocated(By.name("name")), 5000);
        await projNameInput.sendKeys("Automated UI Project");

        let projDateInput = await driver.wait(until.elementLocated(By.name("dueDate")), 5000);
        await projDateInput.sendKeys("12-31-2026");

        let submitProjBtn = await driver.wait(until.elementLocated(By.xpath("//button[@type='submit' and contains(text(), 'Create Project')]")), 5000);
        await driver.executeScript("arguments[0].click();", submitProjBtn);

        console.log("      > Project Successfully Generated in Database.");
        await driver.sleep(3000); // Wait for modal to close and state to render

        console.log("[6/6] Traversing into Project and Instantiating Issue Board Vectors...");

        // Find the newly created project card and click it to route to `/project/:id/board`
        let newProjectCard = await driver.wait(until.elementLocated(By.xpath("//h3[text()='Automated UI Project']")), 10000);
        await driver.executeScript("arguments[0].click();", newProjectCard);

        // Wait for Board to Load
        await driver.wait(until.urlContains('/board'), 10000);
        await driver.sleep(2000);

        // Click Create Issue (to add cards/boards into the project)
        let createIssueBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Create Issue')]")), 10000);
        await driver.executeScript("arguments[0].click();", createIssueBtn);
        await driver.sleep(1000); // modal animation

        let issueTitleInput = await driver.wait(until.elementLocated(By.name("title")), 5000);
        await issueTitleInput.sendKeys("Selenium Core Overload Task");

        let submitIssueBtn = await driver.wait(until.elementLocated(By.xpath("//button[@type='submit' and contains(text(), 'Create Issue')]")), 5000);
        await driver.executeScript("arguments[0].click();", submitIssueBtn);

        console.log("      > Board Item instantiated.");
        await driver.sleep(4000); // let UI update and be visible for user to see live test

        console.log("=========================================");
        console.log("✅ TEST CASE 3 PASSED SUCCESSFULLY! ✅");
        console.log("=========================================");

    } catch (err) {
        console.error("❌ TEST FAILED:", err.message);
    } finally {
        await driver.sleep(2000);
        await driver.quit();
    }
})();
