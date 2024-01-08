import Parser from './parser.js';
import PopupEventAdd from './popupEventAdd.js';
import PopupEventView from './popupEventView.js';
import PopupFixedEventView from './popupFixedEventView.js';

export default class Calendar {
    constructor(selector) {
        this.calendarEl = document.querySelector(selector);

        this.loadLocalization();

        this.options = {
            swipeEffect: 'slide',
            swipeSpeed: 250,
            swipeTitlePosition: 'none',

            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            buttonText: {
                today:    this.locale.today,
                month:    this.locale.month,
                week:     this.locale.week,
                day:      this.locale.day
            },
            moreLinkText: '',
            allDayText: '',
            initialView: 'timeGridWeek',
            locale: this.locale.lang,
            selectable: true,
            dayMaxEvents: true,
            selectMirror: true,
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
            unselectCancel: '.cd-popup-container',
            schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
            select: (event) => this.onSelect(event),
            eventClick: (event) => this.onEventClick(event),
            eventChange: (event) => this.onEventChange(event)
        }
    
        this.calendar = null;
        this.storage = window.storage;
        this.popupAdd = new PopupEventAdd('.cd-popup-event-add', this);
        this.popupView = new PopupEventView('.cd-popup-event-view', this);
        this.popupFixedView = new PopupFixedEventView('.cd-popup-fixed-event-view');

        document.addEventListener('click', () => this.onCalendarElClick());
    }

    create() {
        this.calendar = new SwipeCalendar(this.calendarEl, this.options);
    }

    render() {
        this.calendar.render();
    }

    destroy() {
        this.calendar.destroy();
    }

    setViewable(view) {
        if (view) {
            this.calendarEl.classList.remove('d-none');
        } else {
            this.calendarEl.classList.add('d-none');
        }
    }

    setTimetable(timetab) {
        this.timetable = timetab;
    }

    loadLocalization() {
        this.locale = {
            lang: document.querySelector('#l-lang').innerHTML,
            today: document.querySelector('#l-today').innerHTML,
            month: document.querySelector('#l-month').innerHTML,
            week: document.querySelector('#l-week').innerHTML,
            day: document.querySelector('#l-day').innerHTML,
            type: document.querySelector('#l-type').innerHTML,
            audience: document.querySelector('#l-audience').innerHTML,
            teachers: document.querySelector('#l-teachers').innerHTML,
            groups: document.querySelector('#l-groups').innerHTML,
            dayUpper: document.querySelector('#l-dayUpper').innerHTML,
            time: document.querySelector('#l-time').innerHTML,
            toDelete: document.querySelector('#l-toDelete').innerHTML
        }
    }

    loadEvents(events) {
        events.forEach(async (event) => {
            this.addEvent(event);
        });
    }

    loadAllCustomEvents() {
        let events = this.storage.getCustomEvents();
        let filters = this.storage.getFilters();
        
        events.forEach(async (event) => {
            if(filters && filters.includes('custom_event')) return;

            let calendarEvent = this.calendar.addEvent(event);
            calendarEvent.setProp('editable', true);
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
        if(filters && filters.includes(type.type)) return;

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
        if(info.event.extendedProps.subject) {
            this.onFixedEvent(info);
        } else {
            this.onCustomEvent(info);
        }
    }

    onFixedEvent(info) {
        //console.log(this.calendar);
        let parser = new Parser(this.timetable);

        //console.log('Calendar: Fixed event click:');
        //console.log(info);
        let properties = info.event.extendedProps;

        let title = properties.subject.title;
        let type = properties.type.full_name;
        let auditory = properties.auditory;
        let groups = '';
        let teachers = '';
        let day = info.event.start.toLocaleString(this.locale.lang, { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' });
        let start = info.event.start.toLocaleString(this.locale.lang, { hour: 'numeric', minute: 'numeric' });
        let end = info.event.end.toLocaleString(this.locale.lang, { hour: 'numeric', minute: 'numeric' });
        let lessonsCount = parser.countLessons(properties.subject.id, properties.type.id, properties.teachers);
        let currentLesson = parser.countCurrentLesson(properties.subject.id, properties.type.id, properties.start, properties.end);

        properties.teachers.forEach(id => {
            teachers += `${parser.getTeacherById(id).full_name} `;
        });

        properties.groups.forEach(id => {
            groups += `${parser.getGroupById(id).name} `;
        });

        const options = {
            title: title,
            type: type,
            auditory: auditory,
            groups: groups,
            teachers: teachers,
            day: day,
            start: start,
            end: end,
            lessonsCount: lessonsCount,
            currentLesson: currentLesson
        }

        this.popupFixedView.open(options, this.locale);
    }

    onCustomEvent(info) {
        //console.log('Calendar: Custom event click:');
        //console.log(info);
        this.popupView.open(info);
    }

    onSelect(info) {
        //console.log('Calendar: Area selected:');
        //console.log(info);
        this.popupAdd.open(info);
    }

    onEventChange(info) {
        this.storage.updateCustomEvent(info.event, info.oldEvent);
    }

    onCalendarElClick() {
        let parser = new Parser(this.timetable);

        if(this.calendar.currentData && this.calendar.currentData.currentViewType == "timeGridDay") {
            //console.log('Added')
            this.calendar.getEvents().forEach((event) => {
                if(event.start.toDateString() != new Date().toDateString()) return;
                
                let properties = event.extendedProps;
    
                if(properties.fullDataView == 'true') return;
    
                let groups = '';
                let teachers = '';
    
                properties.teachers.forEach(id => {
                    teachers += `${parser.getTeacherById(id).full_name} `;
                });
    
                properties.groups.forEach(id => {
                    groups += `${parser.getGroupById(id).name} `;
                });
    
                let lessonsCount = parser.countLessons(properties.subject.id, properties.type.id, properties.teachers);
                let currentLesson = parser.countCurrentLesson(properties.subject.id, properties.type.id, properties.start, properties.end);
    
                let title = `${event.title}\n${teachers}\n${groups}\n${currentLesson}/${lessonsCount}`;
    
                event.setProp('title', title);
                event.setExtendedProp('fullDataView', 'true');
            });
        } else {
            //console.log('Cleared')
            this.calendar.getEvents().forEach((event) => {
                if(event.extendedProps.fullDataView != 'true') return;

                event.setProp('title', `${event.extendedProps.subject.brief} ${event.extendedProps.type.short_name} ${event.extendedProps.auditory}`);
                event.setExtendedProp('fullDataView', 'false');
            });
        }
    }
}