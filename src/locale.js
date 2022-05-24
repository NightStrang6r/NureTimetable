const fs = require('fs');
const fsa = require('fs').promises;
const path = require('path');

class Localization {
    constructor(localesPath, defaultLang) {
        this.locales = fs.readFileSync(localesPath, "utf8");
        this.locales = JSON.parse(this.locales);
        this.default = defaultLang;
    }

    async translate(path, lang) {
        let file = await fsa.readFile(path);
        file = file.toString('utf8');

        if(!this.checkLang(lang)) lang = this.default;

        for(let locale in this.locales) {
            if(locale == lang) {
                locale = this.locales[locale];

                for(let word in locale) {
                    let replacement = '\\${' + word + '}';
                    file = this.replaceAll(file, replacement, locale[word]);
                }
                break;
            }
        }

        return file;
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