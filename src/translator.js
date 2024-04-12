import puppeteer from "puppeteer";
import languages from "./languages.js"

export class Translator {
    constructor() {
        this.languages = {
            from: false,
            to: false
        }
    }

    async init() {
        const browser = await puppeteer.launch({
            defaultViewport: null,
            headless: true,
            args: [
                '--window-position=-2560,0',
                '--window-size=2560,1440',
            ],
        })

        const page = await browser.newPage()
        await page.goto('https://translate.google.com')
        await page.waitForNetworkIdle();

        this.page = page

        const [accept] = await this.findText("span", "Accept all")
        await accept.click()

        await page.waitForSelector("textarea")
    }

    async translate(text) {
        const t0 = Date.now()

        await this.page.type('textarea', text)
        await this.page.waitForSelector('path[d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-.8 2L12 10.8 4.8 6h14.4zM4 18V7.87l8 5.33 8-5.33V18H4z"]')

        const translation = await this.page.evaluate(() => {
            let element = document.querySelector('path[d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-.8 2L12 10.8 4.8 6h14.4zM4 18V7.87l8 5.33 8-5.33V18H4z"]')
            let translation = false

            while (translation == false) {
                if (element.tagName == 'A') {
                    translation = decodeURIComponent(element.href.split('mailto:?body=')[1])
                    break
                }

                element = element.parentNode
            }

            return translation
        })

        await this.clearInput()

        console.log(`[${Date.now() - t0}ms] ${text} => ${translation}`);

        return translation
    }

    async clearInput() {
        await this.page.focus('textarea');
        await this.page.keyboard.down('Control');
        await this.page.keyboard.press('A');
        await this.page.keyboard.up('Control');
        await this.page.keyboard.press('Backspace');
    }

    async setLanguages(from, to) {
        if (from == this.languages.from && to == this.languages.to) {
            return
        }

        const langFrom = this.getLanguage(from)
        const langTo = this.getLanguage(to)
        const [expandLanguaeFrom, expandLanguaeTo] = await this.findInnerHtml('svg', `<path d="M5.41 7.59L4 9l8 8 8-8-1.41-1.41L12 14.17"></path>`)
        const [inputLanguageFrom, inputLanguageTo] = await this.page.$$("input[type=text]")

        await expandLanguaeFrom.click()
        await this.sleep(500);
        await inputLanguageFrom.type(`${langFrom}\n`)
        await this.sleep(500);


        await expandLanguaeTo.click()
        await this.sleep(500);
        await inputLanguageTo.type(`${langTo}\n`)
        await this.sleep(500)

        this.languages.from = from
        this.languages.to = to

        console.log(`> languages set: ${langFrom} => ${langTo}`);
    }

    async findText(selector, text) {
        const elements = await this.page.$$(`${selector}`);
        let foundElements = [];

        for (let i = 0; i < elements.length; i++) {
            const eInner = await this.page.evaluate(element => element.innerText, elements[i]);

            if (eInner == text) {
                foundElements.push(elements[i])
            }
        }

        if (foundElements.length == 0) {
            return false
        }
        else {
            return foundElements
        }
    }

    async findInnerHtml(selector, innerHtml) {
        const elements = await this.page.$$(`body ${selector}`);
        let foundElements = [];

        for (let i = 0; i < elements.length; i++) {
            const eInner = await this.page.evaluate(element => element.innerHTML, elements[i]);

            if (eInner == innerHtml) {
                foundElements.push(elements[i])
            }
        }

        if (foundElements.length == 0) {
            return false
        }
        else {
            return foundElements
        }
    }

    getLanguage(code) {
        for (const lang of languages) {
            if (lang.code == code) {
                return lang.name
            }
        }

        return false
    }

    async sleep(ms) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, ms);
        })
    }
}

async function test() {
    const t = new Translator()
    await t.init()

    await t.setLanguages("en", "de")

    await t.translate("youre getting botted")
    await t.translate("this is a test")
}