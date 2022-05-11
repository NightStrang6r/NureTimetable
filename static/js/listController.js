let popupListEl = null;

export default class ListController {
    constructor(listEl) {
        popupListEl = listEl;
    }

    loadGroupsList(items) {
        items.forEach((group) => {
            if(!group) return;

            let listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.innerHTML = group.name;
            listItem.dataset.id = group.id;

            popupListEl.append(listItem);
        });
    }

    loadTeachersList(items) {
        items.forEach((teacher) => {
            if(!teacher) return;

            let listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.innerHTML = teacher.short_name;
            listItem.dataset.id = teacher.id;

            popupListEl.append(listItem);
        });
    }

    loadAudiencesList(items) {
        items.forEach((audience) => {
            if(!audience) return;

            let listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.innerHTML = audience.short_name;
            listItem.dataset.id = audience.id;

            popupListEl.append(listItem);
        });
    }
}