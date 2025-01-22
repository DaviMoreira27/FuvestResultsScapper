const { Builder, By } = require('selenium-webdriver');

(async function fetchMaxIdPost() {
    let driver = await new Builder().forBrowser('firefox').build();

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
        }    // Configurar o driver do Firefox


        console.log(`Título do post com o maior ID (${maxId}): ${maxTitle}`);
        console.log(`Link: ${maxLink}`);
    } finally {
        await driver.quit();
    }
})();
