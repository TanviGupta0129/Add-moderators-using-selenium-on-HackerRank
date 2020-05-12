let fs = require("fs");
require("chromedriver");
let swd = require("selenium-webdriver");
let bldr = new swd.Builder();
let driver = bldr.forBrowser("chrome").build();
let cFile = process.argv[2];
let questionsFile = process.argv[3];
let count = 0;
let ModName = "xxxxxxxxxxx";
(async function () {
    try {
        await loginHelper();
        let DropDownBtn = await driver.findElement(swd.By.css("a[data-analytics=NavBarProfileDropDown]"))
        await DropDownBtn.click();
        let adminLinkanchor = await driver.findElement(swd.By.css("a[data-analytics=NavBarProfileDropDownAdministration]"));
        await adminLinkanchor.click();
        await waitForLoader();
        let manageTabs = await driver.findElements(swd.By.css(".administration header ul li"));
        await manageTabs[1].click();
        let ManageChallengePage = await driver.getCurrentUrl();
        let questions = require(questionsFile);
        await ChallengeCreate(ManageChallengePage,questions.length);        
        let quesPage = ManageChallengePage;
        await AddMod(quesPage);
        await drive.get(ManageChallengePage);       
        await AddTestCase(quesPage, question, count);
        await drive.get(ManageChallengePage);
    } catch (err) {
        console.log(err);
    }
})()

async function ChallengeCreate(ManageChallengePage,NoOfQuestions){
    for (let i = 0; i < NoOfQuestions; i++) {
            await driver.get(ManageChallengePage)
            await waitForLoader();
            await createNewChallenge(questions[i]);            
        }
}

async function createNewChallenge(question) {
    let createChallenge = await driver.findElement(swd.By.css(".btn.btn-green.backbone.pull-right"));
    await createChallenge.click();
    await waitForLoader();
    // opertion => selection ,data entry
    let eSelector = ["#name", "textarea.description", "#problem_statement-container .CodeMirror div textarea", "#input_format-container .CodeMirror textarea", "#constraints-container .CodeMirror textarea", "#output_format-container .CodeMirror textarea", "#tags_tag"];
    let eWillBeselectedPromise = eSelector.map(function (s) {
        return driver.findElement(swd.By.css(s));
    })
    let AllElements = await Promise.all(eWillBeselectedPromise);
    // submit name ,description
    let NameWillAddedPromise = AllElements[0].sendKeys(question["Challenge Name"]);
    let descWillAddedPromise = AllElements[1].sendKeys(question["Description"]);

    await Promise.all([NameWillAddedPromise, descWillAddedPromise]);
    await editorHandler("#problem_statement-container .CodeMirror div", AllElements[2], question["Problem Statement"]);
    await editorHandler("#input_format-container .CodeMirror div", AllElements[3], question["Input Format"]);
    await editorHandler("#constraints-container .CodeMirror div", AllElements[4], question["Constraints"]);
    await editorHandler("#output_format-container .CodeMirror div", AllElements[5], question["Output Format"]);
    // tags
    let TagsInput = AllElements[6];
    await TagsInput.sendKeys(question["Tags"]);
    await TagsInput.sendKeys(swd.Key.ENTER);
    // submit 
    let submitBtn = await driver.findElement(swd.By.css(".save-challenge.btn.btn-green"))
    await submitBtn.click();

}
async function loginHelper() {
    await driver.manage().setTimeouts({ implicit: 10000, pageLoad: 10000 })
    let data = await fs.promises.readFile(cFile);
    let { url, pwd, user } = JSON.parse(data);
    await driver.get(url);
    let unInputWillBeFoundPromise = driver.findElement(swd.By.css("#input-1"));
    let psInputWillBeFoundPromise = driver.findElement(swd.By.css("#input-2"));
    let unNpsEl = await Promise.all([unInputWillBeFoundPromise, psInputWillBeFoundPromise]);
    let uNameWillBeSendPromise = unNpsEl[0].sendKeys(user);
    let pWillBeSendPromise = unNpsEl[1].sendKeys(pwd);
    await Promise.all([uNameWillBeSendPromise, pWillBeSendPromise]);
    let loginBtn = await driver.findElement(swd.By.css("button[data-analytics=LoginPassword]"));
    await loginBtn.click();
}

async function waitForLoader() {
    let loader = await driver.findElement(swd.By.css("#ajax-msg"));
    await driver.wait(swd.until.elementIsNotVisible(loader));
}
async function editorHandler(parentSelector, element, data) {
    let parent = await driver.findElement(swd.By.css(parentSelector));
    // selenium => browser js execute 
    await driver.executeScript("arguments[0].style.height='10px'", parent);
    await element.sendKeys(data);
}

async function HandleQuestionPage(ManageChallengePage) {
    await (await driver).get(ManageChallengePage);
    let allQuestions = await driver.findElements(swd.By.css(".backbone.block-center"));
    for (let j = 0; j < allQuestions.length; j++) {
        allQuestions = await driver.findElements(swd.By.css(".backbone.block-center"));
        await allQuestions[j].click();
        await waitForLoader();
        let TabSelect = await driver.findElements(swd.By.css(".tabs-cta-wrapper ul li"));
        await driver.sleep(1200);
        await TabSelect[1].click();
        await waitForLoader();
        let moderator = await driver.findElement(swd.By.css("#moderator"));
        await moderator.sendKeys(ModName);
        await moderator.sendKeys(swd.Key.ENTER);
        let saveBtn = await driver.findElement(swd.By.css(".save-challenge.btn.btn-green"));
        await saveBtn.click();
        (await driver).get(ManageChallengePage);

    }
}

async function AddMod(quesPage) {
    while (true) {
        await driver.get(quesPage);
        let nextBTNS = await driver.findElements(swd.By.css(".pagination ul li"));
        let nxtBtn = nextBTNS[nextBTNS.length - 2];
        let status = await nxtBtn.getAttribute("class");
        if (status == "disabled") {
            await HandleQuestionPage(quesPage);
            break;
        } else {
            
            await HandleQuestionPage(quesPage);
            await driver.get(quesPage);
            let nextBTNS = await driver.findElements(swd.By.css(".pagination ul li"));
            let nxtBtn = nextBTNS[nextBTNS.length - 2];
            await nxtBtn.click();
            quesPage = await driver.getCurrentUrl();
        }
    }
    (await driver).get(ManageChallengePage);
}

async function AddTestCase(quesPage, questions, count) {
    let newCount;
    while (true) {
        await driver.get(quesPage);
        let nextBTNS = await driver.findElements(swd.By.css(".pagination ul li"));
        let nxtBtn = nextBTNS[nextBTNS.length - 2];
        let status = await nxtBtn.getAttribute("class");
        if (status == "disabled") {
            
            await HandleTestCase(quesPage, questions, newCount);
            break;
        } else {
            
            newCount = await HandleTestCase(quesPage, questions, count);
            await driver.get(quesPage);
            let nextBTNS = await driver.findElements(swd.By.css(".pagination ul li"));
            let nxtBtn = nextBTNS[nextBTNS.length - 2];
            await nxtBtn.click();
            quesPage = await driver.getCurrentUrl();
        }
    }
}

async function HandleTestCase(ManageChallengePage, questions, count) {
    await (await driver).get(ManageChallengePage);
    let allQuestions = await driver.findElements(swd.By.css(".backbone.block-center"));
    for (let j = 0; j < allQuestions.length; j++) {
        allQuestions = await driver.findElements(swd.By.css(".backbone.block-center"));
        await allQuestions[j].click();
        await waitForLoader();
        let TabSelect = await driver.findElements(swd.By.css(".tabs-cta-wrapper ul li"));
        await driver.sleep(1200);
        await TabSelect[2].click();
        await waitForLoader();
        let quesPageIndi = await driver.getCurrentUrl();
        await testEdit(quesPageIndi, questions[count]["Testcases"],count);
        let saveBtn = await driver.findElement(swd.By.css(".save-challenge.btn.btn-green"));
        await saveBtn.click();
        count++;
        await driver.get(ManageChallengePage);
    }

    return count;
}
async function testEdit(questionNO,count) {
    let AddTEstBtn;
    for (let i = 0; i < questionNO.length; i++) {
        await driver.sleep(1000);
        await console.log("inside question no: "+count);
        AddTEstBtn = await driver.findElement(swd.By.css(".btn.add-testcase.btn-green"));
        await AddTEstBtn.click();
        let inputTA = await driver.findElement(swd.By.css('.formgroup.horizontal.input-testcase-row.row .CodeMirror.cm-s-default.CodeMirror-wrap div textarea'));
        let outputTA = await driver.findElement(swd.By.css('.formgroup.horizontal.output-testcase-row.row .CodeMirror.cm-s-default.CodeMirror-wrap div textarea'));
        await editorHandler(".formgroup.horizontal.input-testcase-row.row .CodeMirror.cm-s-default.CodeMirror-wrap div", inputTA, questionNO[i]["Input"]);
        await editorHandler(".formgroup.horizontal.output-testcase-row.row .CodeMirror.cm-s-default.CodeMirror-wrap div", outputTA, questionNO[i]["Output"]);
        let saveBtn = await driver.findElement(swd.By.css(".btn.btn-primary.btn-large.save-testcase"));
        await saveBtn.click();
        await driver.sleep(1500);
    }


}