let select, defaultSelect;
let createOption, onSelected;

export default class Select {
    constructor(selector) {
        select = document.querySelector(selector);
        defaultSelect = select.options[0];
        select.addEventListener('input', this.onSelect);

        createOption = this.createOption;
        onSelected = this.onSelected;
    }

    set(timetables) {
        this.clearOptions();

        timetables.forEach(timetable => {
            let option = createOption(timetable.name, timetable.id, timetable.type);
            select.append(option);
        });
    }

    setSelected(id) {
        let options = select.options;
        for(let i = 0; i < options.length; i++) {
            let option = options[i];
            if(option.dataset.id == id) {
                option.selected = true;
            }
        }
    }

    clearOptions() {
        select.innerHTML = '';
        select.append(defaultSelect);
    }

    onSelect(event) {
        let target = event.target;

        let option = target.options[target.selectedIndex];
        if(option.dataset.id) {
            onSelected({
                name: option.innerHTML,
                id: option.dataset.id,
                type: option.dataset.type
            });
            return;
        }
    }

    onSelected(callback) {
        onSelected = callback;
    }

    getFirstOption() {
        if(!select.options[1]) return null;

        return {
            id: select.options[1].dataset.id,
            name: select.options[1].innerHTML,
            type: select.options[1].dataset.type
        };
    }

    createOption(name, id, type) {
        let option = document.createElement('option');
        option.innerHTML = name;
        option.dataset.id = id;
        option.dataset.type = type;
        return option;
    }
}