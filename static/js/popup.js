import Storage from './storage.js';
import ListController from './listController.js';

let popupEl, popupTriggerEl, popupListEl, popupTabHeaderEl, popupSaveEl;
let storage, listController;
let close, removeTabSelection;

export default class Popup {
    constructor() {
        popupEl = document.querySelector('.cd-popup');
        popupTriggerEl = document.querySelector('.cd-popup-trigger');
        popupListEl = document.querySelector('.popup-list');
        popupTabHeaderEl = document.querySelector('.tab-header');
        popupSaveEl = document.querySelector('.save-button');

        storage = new Storage();

        close = this.close;
        removeTabSelection = this.removeTabSelection;

        this.setupListeners();
    }

    setupListeners() {
        popupEl.classList.remove('d-none');
        popupTriggerEl.addEventListener('click', this.open);
        popupEl.addEventListener('click', this.closeEvent);
        document.addEventListener('keyup', this.closeEvent);
        popupSaveEl.addEventListener('click', this.save);

        popupTabHeaderEl.addEventListener('click', this.onTabClick);
    }

    async open(event) {
        event.preventDefault();
        popupEl.classList.add('is-visible');

        removeTabSelection();
        popupTabHeaderEl.children[0].classList.add('active');

        listController = new ListController(popupListEl, storage);
        popupListEl.innerHTML = '';
        let data = await storage.getAllGroups();
        listController.loadGroupsList(data);
    }

    close() {
        listController.setSelected([]);
        popupEl.classList.remove('is-visible');
        listController = null;
    }

    save() {
        let selected = listController.getSelected();
        storage.saveTimetables(selected);
        close();
    }

    closeEvent(event) {
        if($(event.target).is('.cd-popup-close') || $(event.target).is('.cd-popup')) {
            event.preventDefault();
            close();
        }

        if(event.which == '27') {
            close();
        }
    }

    removeTabSelection() {
        for(let i = 0; i < popupTabHeaderEl.children.length; i++) {
            let tab = popupTabHeaderEl.children[i];
            if(tab.className.includes('active')) {
                tab.classList.remove('active');
            }
        }
    }

    async onTabClick(event) {
        event.preventDefault();
        const tabItem = event.target;

        if(!tabItem.className.includes('tab-header-item')) return;

        removeTabSelection();
        tabItem.classList.add('active');
        let data;

        popupListEl.innerHTML = '';
        switch (tabItem.dataset.tab) {
            case 'groups': 
                data = await storage.getAllGroups();
                listController.loadGroupsList(data);
                break;
            case 'teachers':
                data = await storage.getAllTeachers();
                listController.loadTeachersList(data);
                break;
            case 'audiences':
                data = await storage.getAllAudiences();
                listController.loadAudiencesList(data);
                break;
        }
    }
}