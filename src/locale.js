class Localization {
    constructor(pagesFolder, defaultLang) {
        this.index = global.storage.getIndex();
        this.locales = global.storage.getLocales();

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

            global.storage.saveLocales(langCode, translation);
        }
    }

    async getIndex(lang) {
        if(!this.checkLang(lang)) lang = this.default;
        return await global.storage.getTranslatedIndex(lang);
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