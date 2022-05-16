import Parser from './Parser.js';

let calendar = null, 
    timetable = null;

export default class Calendar {
    constructor(selector) {
        const calendarEl = document.querySelector(selector);
        const options = {
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
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
            },
            eventClick: this.onEventClick
        }
    
        calendar = new FullCalendar.Calendar(calendarEl, options);
    }

    render() {
        calendar.render();
    }

    destroy() {
        calendar.destroy();
    }

    setTimetable(timetab) {
        timetable = timetab;
    }

    loadEvents(events) {
        events.forEach(async (event) => {
            this.addEvent(event);
        });
    }

    removeEvents() {
        let events = calendar.getEvents();
        events.forEach((event) => {
            event.remove();
        });
    }

    async addEvent(event) {
        let parser = new Parser(timetable);

        let type = parser.getTypeById(event.type);
        let subject = parser.getSubjectById(event.subject_id);
        let auditory = event.auditory;
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
            title: `${subject.brief} ${type.short_name} ${auditory}`,
            start: event.start_time * 1000,
            end: event.end_time * 1000,
            color: color,
            extendedProps: {
                subject: subject,
                type: type,
                auditory: auditory,
                teachers: event.teachers,
                groups: event.groups
            }
        });
    }

    onEventClick(info) {
        let parser = new Parser(timetable);

        console.log(info.event);
        let properties = info.event.extendedProps;

        let title = properties.subject.title;
        let type = properties.type.full_name;
        let auditory = properties.auditory;
        let groups = '';
        let teachers = '';
        let day = info.event.start.toLocaleString('ru-RU', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' });
        let start = info.event.start.toLocaleString('ru-RU', { hour: 'numeric', minute: 'numeric' });
        let end = info.event.end.toLocaleString('ru-RU', { hour: 'numeric', minute: 'numeric' });
        let lessonsCount = parser.countLessons(properties.subject.id, properties.type.id, properties.teachers);

        properties.teachers.forEach(id => {
            teachers += `${parser.getTeacherById(id).full_name} `;
        });

        properties.groups.forEach(id => {
            groups += `${parser.getGroupById(id).name} `;
        });

        alert(`${title}\n\nТип: ${type} (?/${lessonsCount})\nАудитория: ${auditory}\nПреподаватели: ${teachers}\nГруппы: ${groups}\nДень: ${day}\nВремя: ${start} - ${end}`);
    }
} 