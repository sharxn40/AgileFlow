const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

(async function agileFlowTask2() {
    let options = new chrome.Options();
    options.addArguments('--disable-blink-features=AutomationControlled');
    options.addArguments('--start-maximized');

    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        console.log("=========================================");
        console.log("⚡ SELENIUM TEST SUITE: TASK 2 (Registration Auth) ⚡");
        console.log("=========================================");

        console.log("[1/6] Navigating to AgileFlow Landing Page...");
        await driver.get('http://localhost:5173/');

        console.log("[2/6] Opening Registration Modal...");
        // Click 'Get Started' on the landing nav to open register mode
        let registerNavBtn = await driver.wait(until.elementLocated(By.xpath("//button[text()='Get Started']")), 10000);
        await driver.executeScript("arguments[0].click();", registerNavBtn);

        console.log("[3/6] Clicking 'Sign up with Google'...");
        await driver.sleep(2000);

        const originalWindow = await driver.getWindowHandle();

        // Target the Google button inside the sign up container
        let googleBtn = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'sign-up-container')]//button[contains(text(), 'Sign up with Google')]")), 10000);
        await driver.executeScript("arguments[0].click();", googleBtn);

        console.log("[4/6] Waiting for Google Account Picker Popup...");
        await driver.wait(
            async () => (await driver.getAllWindowHandles()).length === 2,
            10000
        );

        const windows = await driver.getAllWindowHandles();
        windows.forEach(async handle => {
            if (handle !== originalWindow) {
                await driver.switchTo().window(handle);
            }
        });

        console.log("      > Switched to Google pop-up. Injecting provided email...");

        try {
            let emailField = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 15000);
            await driver.executeScript("arguments[0].value='sharonshibupandakasalayil2028@mca.ajce.in';", emailField);
            await driver.sleep(1000);
            await emailField.sendKeys(Key.RETURN);

            console.log("      > Email injected. Waiting a few seconds for password prompt...");
            await driver.sleep(3000);

            console.log("      > ===========================================================");
            console.log("      > 🚨 ACTION REQUIRED: Please enter your password in the popup browser. 🚨");
            console.log("      > You have 60 seconds to complete the registration process manually.");
            console.log("      > ===========================================================");

            // Wait an extended time for the user to enter the password and the popup to close
            await driver.wait(
                async () => (await driver.getAllWindowHandles()).length === 1,
                60000
            );
            console.log("      > Pop-up closed. Proceeding...");

        } catch (e) {
            console.log("      > Warning: Could not find Google login field automatically.", e.message);
            console.log("      > 🚨 ACTION REQUIRED: Please authenticate manually in the opened Chrome popup! 🚨");

            await driver.wait(
                async () => (await driver.getAllWindowHandles()).length === 1,
                60000
            );
        }

        console.log("[5/6] Authenticating and Routing to Command Center...");

        await driver.switchTo().window(originalWindow);

        // The API returns the token and routes to dashboard just like login
        await driver.wait(async () => {
            const url = await driver.getCurrentUrl();
            return url.includes('/dashboard') || url.includes('/admin');
        }, 30000);
        console.log("      > Authentication Successful. Dashboard Reached.");

        await driver.sleep(3000);

        console.log("[6/6] Surfing Dashboard & Terminating Session (Logout)...");
        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes('/dashboard')) {
            let boardBtn = await driver.wait(until.elementLocated(By.xpath("//div[@title='Tasks']")), 5000);
            await driver.executeScript("arguments[0].click();", boardBtn);
            await driver.sleep(2000);

            let sprintBtn = await driver.wait(until.elementLocated(By.xpath("//div[@title='Scheduler']")), 5000);
            await driver.executeScript("arguments[0].click();", sprintBtn);
            await driver.sleep(2000);
        }

        let logoutBtn = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'logout')]")), 10000);
        await (await driver.wait(until.elementIsVisible(logoutBtn), 5000)).click();

        await driver.wait(until.urlContains('/'), 10000);
        console.log("      > Session Terminated.");

        console.log("=========================================");
        console.log("✅ TEST CASE 2 PASSED SUCCESSFULLY! ✅");
        console.log("=========================================");

    } catch (err) {
        console.error("❌ TEST FAILED:", err.message);
    } finally {
        await driver.sleep(2000);
        await driver.quit();
    }
})();
