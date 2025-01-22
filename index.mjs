import { Builder, By } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/firefox.js';
import open from 'open';
import fs from 'fs';
import { exit } from 'process';

(async function fetchMaxIdPost() {
    const lastResultFile = 'last-result.json';
    const driver = await new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(new Options())
    .build();

    try {
        const url = "https://www.fuvest.br/category/fuvest/vestibular-2025/";
        await driver.get(url);

        const articles = await driver.findElements(By.css('#blog-entries .blog-entry'));

        if (articles.length === 0) {
            console.error("Nenhum artigo foi encontrado.");
            exit(1);
        }

        let storedResults = [];
        if (fs.existsSync(lastResultFile)) {
            storedResults = JSON.parse(fs.readFileSync(lastResultFile, 'utf8'));
        }

        const newResults = [];

        for (let article of articles) {
            try {
                const linkElement = await article.findElement(By.css('.blog-entry-title a'));
                const linkText = await linkElement.getText();
                const linkHref = await linkElement.getAttribute('href');

                if (!linkText.toLowerCase().includes('fuvest') && !linkText.toLowerCase().includes('vestibular')) {
                    continue;
                }

                const exists = storedResults.some(
                    (item) => item.title === linkText && item.link === linkHref
                );

                if (exists) {
                    console.log(`Artigo já registrado: ${linkText} \n`);
                    continue;
                }

                const newResult = { title: linkText, link: linkHref };
                storedResults.push(newResult);
                fs.writeFileSync(lastResultFile, JSON.stringify(storedResults, null, 2), 'utf8');

                console.log(`Novo artigo registrado: ${linkText}`);

                newResults.push(1);
                if (newResults.length > 3) {
                    continue;
                }

                console.log(`Abrindo link: ${linkHref} \n`);

                open(linkHref);
            } catch (error) {
                console.error("Erro ao processar um artigo:", error.message);
            }
        }
    } finally {
        await driver.quit();
    }
})();
