const fs = require('fs');
const fsa = require('fs').promises;

class Localization {
    constructor(indexPath, localesPath, pagesFolder, defaultLang) {
        this.indexPath = indexPath;
        this.index = fs.readFileSync(this.indexPath, 'utf8');
        this.index = this.index.toString('utf8');

        this.locales = fs.readFileSync(localesPath, 'utf8');
        this.locales = JSON.parse(this.locales);

        this.pagesFolder = pagesFolder;
        this.default = defaultLang;

        this.preparePages();
    }

    preparePages() {
        for(let locale in this.locales) {
            let langCode = locale;
            locale = this.locales[langCode];
            let translation = this.index;

            for(let word in locale) {
                let replacement = '\\${' + word + '}';
                translation = this.replaceAll(translation, replacement, locale[word]);
            }

            fs.writeFileSync(`${this.pagesFolder}/index_${langCode}.html`, translation);
        }
    }

    async getIndex(lang) {
        if(!this.checkLang(lang)) lang = this.default;
        return await fsa.readFile(`${this.pagesFolder}/index_${lang}.html`);
    }

    checkLang(lang) {
        for(let locale in this.locales) {
            if(locale == lang) return true;
        }
        return false;
    }

    replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }
}

module.exports = Localization;