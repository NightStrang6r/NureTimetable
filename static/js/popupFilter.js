import Storage from './storage.js';
import Popup from './popup.js';

export default class PopupAdd extends Popup {
    constructor(popupSelector, triggerSelector) {
        super(popupSelector, triggerSelector);

        this.checkboxesEl = document.querySelector('.checkboxes');
        this.checkboxEl = document.querySelector('.checkbox');
        this.popupSaveEl = document.querySelector('.popup-filter-save')

        this.popupSaveEl.addEventListener('click', (event) => this.save(event));

        this.storage = new Storage();
    }

    async open(event) {
        super.open(event);

        this.checkboxesEl.innerHTML = '';
        let selectedId = this.storage.getSelected();

        if(!selectedId) return;
        
        let timetable = await this.storage.getTimetable(selectedId);
        let filters = this.storage.getFilters();
        
        let types = timetable.types;
        let filterTypes = [];

        if(!types) return;

        // Добавляем возможные значения фильтра в массив
        for(let i = 0; i < types.length; i++) {
            let type = types[i];

            if(!filterTypes.includes(type.type)) {
                filterTypes.push(type.type);
            }
        }

        // Добавляем значения фильтра на страницу
        for(let i = 0; i < filterTypes.length; i++) {
            let type = filterTypes[i];
            let checkbox = this.checkboxEl.cloneNode(true);
            checkbox.classList.remove('d-none');

            let label = checkbox.children[0];
            let input = label.children[0];
            let span = label.children[1];
            let typeName = this.getLessonName(type);

            span.innerHTML = typeName;
            input.value = type;

            if(filters.includes(type)) {
                input.checked = false;
            } else {
                input.checked = true;
            }

            this.checkboxesEl.append(checkbox);
        }
    }

    // Получаем названия фильтра из html с учётом локализации
    getLessonName(type) {
        let nameEl = document.querySelector(`#${type}`);
        if(nameEl == null) return type;

        return nameEl.innerHTML;
    }

    getUnselected() {
        let unselected = [];

        for(let i = 0; i < this.checkboxesEl.children.length; i++) {
            let checkbox = this.checkboxesEl.children[i];

            if(checkbox.className.includes('d-none')) continue;

            let label = checkbox.children[0];
            let input = label.children[0];

            if(input.checked) continue;

            unselected.push(input.value);
        }

        return unselected;
    }

    save() {
        let filters = this.getUnselected();
        this.storage.saveFilters(filters);
        this.close();
    }
}