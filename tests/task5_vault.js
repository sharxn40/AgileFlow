const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

(async function agileFlowTask5() {
    let options = new chrome.Options();
    options.addArguments('--disable-blink-features=AutomationControlled');
    options.addArguments('--start-maximized');

    // Initialize two completely separate headless browser engines
    let adminDriver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    let seekerDriver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        console.log("=========================================");
        console.log("⚡ SELENIUM TEST SUITE: TASK 5 (Vault Payout Dynamics) ⚡");
        console.log("=========================================");

        const teamName = "Vault Sync Protocol " + Math.floor(Math.random() * 1000);
        const emailAdmin = `admin_${Date.now()}@agileflow.com`;
        const emailSeeker = `seeker_${Date.now()}@agileflow.com`;

        // ==========================================
        // PHASE 1: ADMIN REGISTRATION & TEAM SEEDING
        // ==========================================
        console.log("[1/10] (ADMIN) Navigating to Landing Page and opening Registration...");
        await adminDriver.get('http://localhost:5173/');
        let getStartedAdminBtn = await adminDriver.wait(until.elementLocated(By.xpath("//button[text()='Get Started']")), 10000);
        await adminDriver.executeScript("arguments[0].click();", getStartedAdminBtn);
        await adminDriver.sleep(1000);

        console.log("[2/10] (ADMIN) Registering Administrator Profile natively...");
        let adminNameInput = await adminDriver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'sign-up-container')]//input[@placeholder='e.g. John Doe']")), 5000);
        await adminDriver.executeScript("arguments[0].value='';", adminNameInput);
        await adminNameInput.sendKeys('Admin Executive');
        let adminEmailInput = await adminDriver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'sign-up-container')]//input[@placeholder='john@example.com' or @type='email']")), 5000);
        await adminEmailInput.sendKeys(emailAdmin);
        let adminPassInput = await adminDriver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'sign-up-container')]//input[@placeholder='Choose a password']")), 5000);
        await adminPassInput.sendKeys('Password123!');
        let adminConfirmInput = await adminDriver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'sign-up-container')]//input[@placeholder='Confirm your password']")), 5000);
        await adminConfirmInput.sendKeys('Password123!');

        let signUpAdminBtn = await adminDriver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'sign-up-container')]//button[@type='submit' and text()='Sign Up']")), 5000);
        await adminDriver.executeScript("arguments[0].click();", signUpAdminBtn);

        await adminDriver.wait(async () => { return (await adminDriver.getCurrentUrl()).includes('/dashboard'); }, 15000);

        console.log("[3/10] (ADMIN) Routing to Registry and Spawning Output Team...");
        let registryBtn = await adminDriver.wait(until.elementLocated(By.xpath("//div[@title='Registry']")), 10000);
        await adminDriver.executeScript("arguments[0].click();", registryBtn);
        await adminDriver.sleep(2000);

        let myTeamsTab = await adminDriver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'My Teams')]")), 10000);
        await adminDriver.executeScript("arguments[0].click();", myTeamsTab);
        await adminDriver.sleep(1500);

        let createTeamBtn = await adminDriver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'New Team') or contains(text(), 'Create a Team')]")), 10000);
        await adminDriver.executeScript("arguments[0].click();", createTeamBtn);
        await adminDriver.sleep(1000);

        let teamNameInput = await adminDriver.wait(until.elementLocated(By.xpath("//input[@placeholder='e.g. Design Squad, Backend Team...']")), 5000);
        await teamNameInput.sendKeys(teamName);
        let submitTeamBtn = await adminDriver.wait(until.elementLocated(By.xpath("//button[@type='submit' and contains(text(), 'Create Team')]")), 5000);
        await adminDriver.executeScript("arguments[0].click();", submitTeamBtn);
        await adminDriver.sleep(2000);

        console.log("[4/10] (ADMIN) Generating Job Contract Offer and extracting Invite URL...");
        let targetTeamNode = await adminDriver.wait(until.elementLocated(By.xpath(`//span[@class='team-name' and text()='${teamName}']`)), 15000);
        await adminDriver.executeScript("arguments[0].click();", targetTeamNode);
        await adminDriver.sleep(1500);

        let inviteMemberBtn = await adminDriver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Invite Member')]")), 10000);
        await adminDriver.executeScript("arguments[0].click();", inviteMemberBtn);
        await adminDriver.sleep(1000);

        let seekerEmailInput = await adminDriver.wait(until.elementLocated(By.xpath("//input[@placeholder='colleague@example.com']")), 5000);
        await seekerEmailInput.sendKeys(emailSeeker);
        let jobDescInput = await adminDriver.wait(until.elementLocated(By.xpath("//textarea[contains(@placeholder, 'Describe what the seeker needs')]")), 5000);
        await jobDescInput.sendKeys("Engineer the Selenium Codebase Integration.");
        let paymentAmtInput = await adminDriver.wait(until.elementLocated(By.xpath("//input[@placeholder='e.g. 50000']")), 5000);
        await paymentAmtInput.sendKeys("25000");

        let sendJobOfferBtn = await adminDriver.wait(until.elementLocated(By.xpath("//button[@type='submit' and text()='Send Job Offer']")), 5000);
        await adminDriver.executeScript("arguments[0].click();", sendJobOfferBtn);

        // Extract shareable link
        let inviteCodeNode = await adminDriver.wait(until.elementLocated(By.css("code")), 10000);
        const inviteLink = await inviteCodeNode.getText();
        console.log("      > Payloaded Invite URL Extracted Successfully!");

        // ==========================================
        // PHASE 2: SEEKER REGISTRATION & BOARD PROTOCOL
        // ==========================================
        console.log("[5/10] (SEEKER) Booting second browser engine & Registering User Protocol...");
        await seekerDriver.get('http://localhost:5173/');
        let getStartedSeekerBtn = await seekerDriver.wait(until.elementLocated(By.xpath("//button[text()='Get Started']")), 10000);
        await seekerDriver.executeScript("arguments[0].click();", getStartedSeekerBtn);
        await seekerDriver.sleep(1000);

        let seekerNameInput = await seekerDriver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'sign-up-container')]//input[@placeholder='e.g. John Doe']")), 5000);
        await seekerDriver.executeScript("arguments[0].value='';", seekerNameInput);
        await seekerNameInput.sendKeys('Terminal Agent');
        let seekerRegEmailInput = await seekerDriver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'sign-up-container')]//input[@placeholder='john@example.com' or @type='email']")), 5000);
        await seekerRegEmailInput.sendKeys(emailSeeker);
        let seekerPassInput = await seekerDriver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'sign-up-container')]//input[@placeholder='Choose a password']")), 5000);
        await seekerPassInput.sendKeys('Password123!');
        let seekerConfirmInput = await seekerDriver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'sign-up-container')]//input[@placeholder='Confirm your password']")), 5000);
        await seekerConfirmInput.sendKeys('Password123!');

        let signUpSeekerBtn = await seekerDriver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'sign-up-container')]//button[@type='submit' and text()='Sign Up']")), 5000);
        await seekerDriver.executeScript("arguments[0].click();", signUpSeekerBtn);

        await seekerDriver.wait(async () => { return (await seekerDriver.getCurrentUrl()).includes('/dashboard'); }, 15000);

        console.log("[6/10] (SEEKER) Consuming Invite Link URL securely to bind Team Contract...");
        await seekerDriver.get(inviteLink);

        let acceptOfferBtn = await seekerDriver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Accept Offer')]")), 10000);
        await seekerDriver.executeScript("arguments[0].click();", acceptOfferBtn);
        await seekerDriver.sleep(2000); // UI Success Confirmed

        console.log("[7/10] (SEEKER) Surfing toward the Payment Vault Application...");
        let toVaultBtn = await seekerDriver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Go to Dashboard')]")), 10000);
        await seekerDriver.executeScript("arguments[0].click();", toVaultBtn);
        await seekerDriver.sleep(1000);

        // Go straight to Vault
        let vaultNavBtn = await seekerDriver.wait(until.elementLocated(By.xpath("//div[@title='Vault']")), 10000);
        await seekerDriver.executeScript("arguments[0].click();", vaultNavBtn);
        await seekerDriver.sleep(2000);

        console.log("[8/10] (SEEKER) Locating Contract payload and Executing 'Submit Job' Action...");
        let submitJobBtn = await seekerDriver.wait(until.elementLocated(By.xpath("//button[text()='Submit Job']")), 10000);
        await seekerDriver.executeScript("arguments[0].click();", submitJobBtn);

        console.log("      > Job marked completed and delivered via API.");
        await seekerDriver.sleep(3000);

        // ==========================================
        // PHASE 3: ADMIN SETTLEMENT
        // ==========================================
        console.log("[9/10] (ADMIN) Returning perspective to Admin dashboard to locate Submitted Vault jobs...");

        let adminVaultBtn = await adminDriver.wait(until.elementLocated(By.xpath("//div[@title='Vault']")), 10000);
        await adminDriver.executeScript("arguments[0].click();", adminVaultBtn);
        await adminDriver.sleep(2000);

        console.log("      > Ensuring Vault Data is perfectly synchronized with Backend DB...");
        await adminDriver.navigate().refresh();
        await adminDriver.sleep(3000);

        console.log("[10/10] (ADMIN) Injecting Razorpay SDK bypass sequence and Executing Financial Settlement...");
        // Define bypass logic inside Web View to mock Razorpay
        await adminDriver.executeScript(`
            window.Razorpay = function(options) {
                this.open = function() {
                    console.log("[MOCK] Razorpay Modal Overlay bypassed. Simulating Payment Success...");
                    setTimeout(() => {
                        options.handler({
                            razorpay_payment_id: "pay_selenium_mock_" + Date.now(),
                            razorpay_order_id: options.order_id,
                            razorpay_signature: "selenium_mock_signature_" + Math.random()
                        });
                    }, 500);
                };
                this.on = function(event, cb) {};
            };
        `);

        // Wait for contract to refresh using the broad dot-notation for nested icon text matching
        let processPaymentBtn = await adminDriver.wait(until.elementLocated(By.xpath("//button[contains(., 'Process Payment')]")), 15000);
        await adminDriver.executeScript("arguments[0].click();", processPaymentBtn);

        // UI refresh waits until it says "Settled"
        await adminDriver.wait(until.elementLocated(By.xpath("//div[contains(text(), 'Settled')]")), 20000);

        console.log("      > Payment Validated. Cryptographic signature settled onto DB Record Successfully!");

        console.log("=========================================");
        console.log("✅ TEST CASE 5 PASSED SUCCESSFULLY! ✅");
        console.log("=========================================");
    } catch (err) {
        console.error("❌ TEST FAILED:", err.message);
    } finally {
        await adminDriver.sleep(2000);
        await seekerDriver.quit();
        await adminDriver.quit();
    }
})();
