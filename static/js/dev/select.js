let createOption, onSelected;

export default class Select {
    constructor(selector) {
        this.select = document.querySelector(selector);
        this.defaultSelect = this.select.options[0];
        this.select.addEventListener('input', this.onSelect);

        createOption = this.createOption;
        onSelected = this.onSelected;
    }

    set(timetables) {
        this.clearOptions();

        timetables.forEach(timetable => {
            let option = createOption(timetable.name, timetable.id, timetable.type);
            if(option == null) return;
            this.select.append(option);
        });
    }

    setSelected(id) {
        let options = this.select.options;
        for(let i = 0; i < options.length; i++) {
            let option = options[i];
            if(option.dataset.id == id) {
                option.selected = true;
            }
        }
    }

    clearOptions() {
        this.select.innerHTML = '';
        this.select.append(this.defaultSelect);
    }

    onSelect(event) {
        let target = event.target;

        let option = target.options[target.selectedIndex];
        if(option.dataset.id) {
            onSelected(option.dataset.id);
        }
    }

    onSelected(callback) {
        onSelected = callback;
    }

    getFirstOption() {
        if(!this.select.options[1]) return null;

        return {
            id: this.select.options[1].dataset.id,
            name: this.select.options[1].innerHTML,
            type: this.select.options[1].dataset.type
        };
    }

    createOption(name, id, type) {
        if(!name || !id || !type) return null;
        
        let option = document.createElement('option');
        option.innerHTML = name;
        option.dataset.id = id;
        option.dataset.type = type;
        return option;
    }
}