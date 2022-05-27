export default class ListController {
    constructor(listEl, storage) {
        this.popupListEl = listEl;
        
        this.popupListEl.addEventListener('click', (event) => this.onListClick(event));

        this.searchString = '';
        this.selected = storage.getTimetables();
    }

    onListClick(event) {
        event.preventDefault();
        const listItem = event.target;

        if(!listItem.className.includes('list-item')) return;

        if(!listItem.className.includes('list-item-selected')) {
            listItem.classList.add('list-item-selected');

            let type = this.popupListEl.dataset.type;

            this.selected.push({
                type: type,
                id: listItem.dataset.id,
                name: listItem.innerHTML
            });
        } else {
            listItem.classList.remove('list-item-selected');
            
            this.selected.forEach((item, index) => {
                if(item.id == listItem.dataset.id && item.name == listItem.innerHTML) {
                    this.selected.splice(index, 1);
                }
            });
        }
    }

    setSearch(search) {
        this.searchString = search.toLowerCase();
    }

    loadList(items, type) {
        this.popupListEl.dataset.type = type;
        let counter = 0;

        items.forEach((item) => {
            if(!item) return;

            let name;
            if(!item.name) {
                name = item.short_name;
            } else {
                name = item.name;
            }

            if(!name.toLowerCase().includes(this.searchString)) return;

            let listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.innerHTML = name;
            listItem.dataset.id = item.id;

            this.checkIfSelected(listItem);

            this.popupListEl.append(listItem);
            counter++;
        });

        console.log(`ListController: Search: found ${counter} elements.`);
    }

    checkIfSelected(listItem) {
        this.selected.forEach((item) => {
            if(item.type != this.popupListEl.dataset.type) return;

            if(item.id == listItem.dataset.id) {
                listItem.classList.add('list-item-selected');
            }
        });
    }

    setSelected(select) {
        this.selected = select;
    }

    getSelected() {
        return this.selected;
    }
}