let calendar;
let timetable;

document.addEventListener('DOMContentLoaded', init);

function init() {
    calendar = initCalendar();
    main();
}

async function main() {
    if(!localStorage.timetable) {
        timetable = await getTimetable(9291672);
        localStorage.timetable = JSON.stringify(timetable);
    } else {
        timetable = JSON.parse(localStorage.timetable);
    }

    timetable.events.forEach(event => {
        addEvent(event);
    });
}

function initCalendar() {
    const calendarEl = document.querySelector('#calendar');
    const options = {
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
        },
        buttonText: {
            today:    'сегодня',
            month:    'месяц',
            week:     'неделя',
            day:      'день',
            list:     'список'
        },
        initialView: 'timeGridWeek',
        locale: "ru",
        firstDay: 1,
        height: '100%',
        nowIndicator: true,
        slotMinTime: "08:00:00",
        slotMaxTime: "18:00:00",
        slotDuration: "00:25:00",
        slotLabelFormat: {
            hour: 'numeric',
            minute: '2-digit',
            omitZeroMinute: false,
            meridiem: 'short'
        }
    }

    const calendar = new FullCalendar.Calendar(calendarEl, options);

    calendar.render();
    return calendar;
}

async function getAllGroups() {
    const url = '/api/groups/';
    const options = {
        method: 'GET'
    };

    const res = await fetch(url, options);
    const json = await res.json();

    let groups = [];
    json.university.faculties.forEach(faculty => {
        faculty.directions.forEach(direction => {
            groups = groups.concat(direction.groups);
        })
    });

    return groups;
}

async function getTimetable(groupId) {
    const url = `/api/get/?group_id=${groupId}`;
    const options = {
        method: 'GET'
    };

    const res = await fetch(url, options);
    const json = await res.json();

    return json;
}

function getTypeById(id) {
    let type = {};
    
    timetable.types.forEach(typef => {
        if(typef.id == id) {
            type = typef;
            return;
        }
    });

    return type;
}

function getSubjectById(id) {
    let subject = {};
    
    timetable.subjects.forEach(subj => {
        if(subj.id == id) {
            subject = subj;
            return;
        }
    });

    return subject;
}

function addEvent(event) {
    let type = getTypeById(event.type);
    let subject = getSubjectById(event.subject_id);
    let color;

    switch (type.short_name) {
        case 'Лб':
            color = '#b300a7';
            break;
        case 'Пз':
            color = '#009e18';
            break;
        case 'Лк':
            color = '#bf9300';
            break;
        case 'Конс':
            color = '#00b9bf';
        default: 
            color = '#b50000';
            break;
    }

    calendar.addEvent({
        title: `${subject.brief} ${type.short_name} 103i`,
        start: event.start_time * 1000,
        end: event.end_time * 1000,
        description: type.short_name,
        color: color
    });
}