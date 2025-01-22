import { Builder, By } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/firefox.js';
import open from 'open';
import fs from 'fs';

(async function fetchMaxIdPost() {
    let driver = await new Builder().forBrowser('firefox').setFirefoxOptions((new Options().addArguments('--headless'))).build();
    const lastResultFile = 'last_result.json';

    try {
        const url = "https://www.fuvest.br/category/fuvest/vestibular-2025/";
        await driver.get(url);

        const articles = await driver.findElements(By.css('article.blog-entry'));

        let maxId = 0;
        let maxTitle = "";
        let maxLink = "";

        for (let article of articles) {
            const articleId = await article.getAttribute('id');
            const numericId = parseInt(articleId.split('-')[1]);

            const titleElement = await article.findElement(By.css('h2.blog-entry-title a'));
            const title = await titleElement.getText();
            const link = await titleElement.getAttribute('href');

            if (numericId > maxId) {
                maxId = numericId;
                maxTitle = title;
                maxLink = link;
            }
        }

        let lastResult = null;
        if (fs.existsSync(lastResultFile)) {
            lastResult = JSON.parse(fs.readFileSync(lastResultFile, 'utf8'));
        }

        const currentResult = { id: maxId, title: maxTitle, link: maxLink };

        if (!lastResult || lastResult.id !== currentResult.id) {
            fs.writeFileSync(lastResultFile, JSON.stringify(currentResult), 'utf8');

            console.log(`Título do post com o maior ID (${maxId}): ${maxTitle}`);
            console.log(`Link: ${maxLink}`);

            open(maxLink);
        }
    } finally {
        await driver.quit();
    }
})();
