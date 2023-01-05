import ListController from './listController.js';
import Popup from './popup.js';

export default class PopupAdd extends Popup {
    constructor(popupSelector, triggerSelector) {
        super(popupSelector, triggerSelector);

        this.popupListEl = document.querySelector('.popup-list');
        this.popupTabHeaderEl = document.querySelector('.tab-header');
        this.popupSaveEl = document.querySelector('.popup-add-save');
        this.searchInputEl = document.querySelector('.input-search');

        this.popupSaveEl.addEventListener('click', (event) => this.save(event));
        this.popupTabHeaderEl.addEventListener('click', (event) => this.onTabClick(event));
        this.searchInputEl.addEventListener('input', (event) => this.onInput(event));

        this.storage = window.storage;
        this.listController = new ListController(this.popupListEl, this.storage);
    }

    async open(event) {
        super.open(event);

        this.removeTabSelection();
        this.popupTabHeaderEl.children[0].classList.add('active');

        this.popupListEl.innerHTML = '';
        this.searchInputEl.value = '';

        let data = await this.storage.getAllGroups();
        this.listController.loadList(data, 'groups');
    }

    close() {
        super.close();
        if(!this.listController) return;

        this.listController.setSearch('');
    }

    save() {
        let selected = this.listController.getSelected();
        
        if(selected.length == 0) {
            this.storage.deleteSelected();
        }

        this.storage.saveTimetables(selected);
        this.close();
    }

    async onInput(event) {
        let tab = this.getActiveTab();
        this.listController.setSearch(event.srcElement.value);
        this.loadList(tab);
    }

    getActiveTab() {
        for(let i = 0; i < this.popupTabHeaderEl.children.length; i++) {
            let tab = this.popupTabHeaderEl.children[i];
            if(tab.className.includes('active')) {
                return tab.dataset.tab;
            }
        }
    }

    removeTabSelection() {
        for(let i = 0; i < this.popupTabHeaderEl.children.length; i++) {
            let tab = this.popupTabHeaderEl.children[i];
            if(tab.className.includes('active')) {
                tab.classList.remove('active');
            }
        }
    }

    onTabClick(event) {
        event.preventDefault();
        const tabItem = event.target;

        if(!tabItem.className.includes('tab-header-item')) return;

        this.removeTabSelection();
        tabItem.classList.add('active');

        this.loadList(tabItem.dataset.tab);
    }

    async loadList(tab) {
        let data;
        this.popupListEl.innerHTML = '';
        switch (tab) {
            case 'groups': 
                data = await this.storage.getAllGroups();
                break;
            case 'teachers':
                data = await this.storage.getAllTeachers();
                break;
            case 'audiences':
                data = await this.storage.getAllAudiences();
                break;
        }
        this.listController.loadList(data, tab);
    }
}