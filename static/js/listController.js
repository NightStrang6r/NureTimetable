let popupListEl = null;
let selected = [];

export default class ListController {
    constructor(listEl, storage) {
        popupListEl = listEl;
        popupListEl.addEventListener('click', this.onListClick);
        selected = storage.getTimetables();
    }

    onListClick(event) {
        event.preventDefault();
        const listItem = event.target;

        if(!listItem.className.includes('list-item')) return;

        if(!listItem.className.includes('list-item-selected')) {
            listItem.classList.add('list-item-selected');

            let type = popupListEl.dataset.type;

            selected.push({
                type: type,
                id: listItem.dataset.id,
                name: listItem.innerHTML
            });
        } else {
            listItem.classList.remove('list-item-selected');
            
            selected.forEach((item, index) => {
                if(item.id == listItem.dataset.id && item.name == listItem.innerHTML) {
                    selected.splice(index, 1);
                }
            });
        }
    }

    loadGroupsList(items) {
        popupListEl.dataset.type = "groups";

        items.forEach((group) => {
            if(!group) return;

            let listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.innerHTML = group.name;
            listItem.dataset.id = group.id;

            this.checkIfSelected(listItem);

            popupListEl.append(listItem);
        });
    }

    loadTeachersList(items) {
        popupListEl.dataset.type = "teachers";

        items.forEach((teacher) => {
            if(!teacher) return;

            let listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.innerHTML = teacher.short_name;
            listItem.dataset.id = teacher.id;

            this.checkIfSelected(listItem);

            popupListEl.append(listItem);
        });
    }

    loadAudiencesList(items) {
        popupListEl.dataset.type = "audiences";

        items.forEach((audience) => {
            if(!audience) return;

            let listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.innerHTML = audience.short_name;
            listItem.dataset.id = audience.id;

            this.checkIfSelected(listItem);

            popupListEl.append(listItem);
        });
    }

    checkIfSelected(listItem) {
        selected.forEach((item) => {
            if(item.type != popupListEl.dataset.type) return;

            if(item.id == listItem.dataset.id) {
                listItem.classList.add('list-item-selected');
            }
        });
    }

    setSelected(select) {
        selected = select;
    }

    getSelected() {
        return selected;
    }
}