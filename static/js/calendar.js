import Parser from './parser.js';
import Storage from './storage.js';

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
    
        this.calendar = new FullCalendar.Calendar(calendarEl, options);
        this.storage = new Storage();
    }

    render() {
        this.calendar.render();
    }

    destroy() {
        this.calendar.destroy();
    }

    setTimetable(timetab) {
        this.timetable = timetab;
    }

    loadEvents(events) {
        events.forEach(async (event) => {
            this.addEvent(event);
        });
    }

    removeEvents() {
        let events = this.calendar.getEvents();
        events.forEach((event) => {
            event.remove();
        });
    }

    async addEvent(event) {
        let parser = new Parser(this.timetable);

        let type = parser.getTypeById(event.type);

        let filters = this.storage.getFilters();
        if(filters.includes(type.type)) return;

        let subject = parser.getSubjectById(event.subject_id);
        let auditory = event.auditory;
        let color = parser.getColorByType(type.short_name);
    
        this.calendar.addEvent({
            title: `${subject.brief} ${type.short_name} ${auditory}`,
            start: event.start_time * 1000,
            end: event.end_time * 1000,
            color: color,
            extendedProps: {
                subject: subject,
                type: type,
                auditory: auditory,
                teachers: event.teachers,
                groups: event.groups,
                start: event.start_time,
                end: event.end_time
            }
        });
    }

    onEventClick(info) {
        let parser = new Parser(this.timetable);

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
        let currentLesson = parser.countCurrentLesson(properties.subject.id, properties.type.id, properties.start, properties.end);

        properties.teachers.forEach(id => {
            teachers += `${parser.getTeacherById(id).full_name} `;
        });

        properties.groups.forEach(id => {
            groups += `${parser.getGroupById(id).name} `;
        });

        alert(`${title}\n\nТип: ${type} (${currentLesson}/${lessonsCount})\nАудитория: ${auditory}\nПреподаватели: ${teachers}\nГруппы: ${groups}\nДень: ${day}\nВремя: ${start} - ${end}`);
    }
} 