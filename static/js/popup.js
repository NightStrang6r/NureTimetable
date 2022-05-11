import Storage from './storage.js';
import ListController from './listController.js';

let popupEl, popupTriggerEl, popupListEl, popupTabHeaderEl;
let storage, listController;

export default class Popup {
    constructor() {
        popupEl = document.querySelector('.cd-popup');
        popupTriggerEl = document.querySelector('.cd-popup-trigger');
        popupListEl = document.querySelector('.popup-list');
        popupTabHeaderEl = document.querySelector('.tab-header');

        storage = new Storage();
        listController = new ListController(popupListEl);

        this.setupListeners();
    }

    setupListeners() {
        popupEl.classList.remove('d-none');
        popupTriggerEl.addEventListener('click', this.open);
        popupEl.addEventListener('click', this.close);
        document.addEventListener('keyup', this.close);

        popupTabHeaderEl.addEventListener('click', this.onTabClick);

        popupListEl.addEventListener('click', this.onListClick);
    }

    async open(event) {
        event.preventDefault();
        popupEl.classList.add('is-visible');

        let data = await storage.getAllGroups();
        listController.loadGroupsList(data);
    }

    close(event) {
        if($(event.target).is('.cd-popup-close') || $(event.target).is('.cd-popup')) {
            event.preventDefault();
            $(this).removeClass('is-visible');
        }
        if(event.which == '27') {
            $('.cd-popup').removeClass('is-visible');
        }
    }

    async onTabClick(event) {
        event.preventDefault();
        const tabItem = event.target;

        if(!tabItem.className.includes('tab-header-item')) return;

        for(let i = 0; i < popupTabHeaderEl.children.length; i++) {
            let tab = popupTabHeaderEl.children[i];
            if(tab.className.includes('active')) {
                tab.classList.remove('active');
            }
        }

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

    onListClick(event) {
        event.preventDefault();
        const listItem = event.target;

        if(!listItem.className.includes('list-item')) return;

        if(!listItem.className.includes('list-item-selected')) {
            listItem.classList.add('list-item-selected');
            console.log('added');
        } else {
            listItem.classList.remove('list-item-selected');
            console.log('deleted');
        }
    }
}