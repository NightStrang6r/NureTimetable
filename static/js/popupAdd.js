import Storage from './storage.js';
import ListController from './listController.js';
import Popup from './popup.js';

export default class PopupAdd extends Popup {
    constructor(popupSelector, triggerSelector) {
        super(popupSelector, triggerSelector);

        this.popupListEl = document.querySelector('.popup-list');
        this.popupTabHeaderEl = document.querySelector('.tab-header');
        this.popupSaveEl = document.querySelector('.save-button');

        this.popupSaveEl.addEventListener('click', (event) => this.save(event));
        this.popupTabHeaderEl.addEventListener('click', (event) => this.onTabClick(event));

        this.storage = new Storage();
    }

    async open(event) {
        super.open(event);

        this.removeTabSelection();
        this.popupTabHeaderEl.children[0].classList.add('active');

        this.listController = new ListController(this.popupListEl, this.storage);
        this.popupListEl.innerHTML = '';
        let data = await this.storage.getAllGroups();
        this.listController.loadGroupsList(data);
    }

    close() {
        super.close();
        if(!this.listController) return;

        this.listController.setSelected([]);
        this.listController = null;
    }

    save() {
        let selected = this.listController.getSelected();
        this.storage.saveTimetables(selected);
        this.close();
    }

    removeTabSelection() {
        for(let i = 0; i < this.popupTabHeaderEl.children.length; i++) {
            let tab = this.popupTabHeaderEl.children[i];
            if(tab.className.includes('active')) {
                tab.classList.remove('active');
            }
        }
    }

    async onTabClick(event) {
        event.preventDefault();
        const tabItem = event.target;

        if(!tabItem.className.includes('tab-header-item')) return;

        this.removeTabSelection();
        tabItem.classList.add('active');
        let data;

        this.popupListEl.innerHTML = '';
        switch (tabItem.dataset.tab) {
            case 'groups': 
                data = await this.storage.getAllGroups();
                this.listController.loadGroupsList(data);
                break;
            case 'teachers':
                data = await this.storage.getAllTeachers();
                this.listController.loadTeachersList(data);
                break;
            case 'audiences':
                data = await this.storage.getAllAudiences();
                this.listController.loadAudiencesList(data);
                break;
        }
    }
}