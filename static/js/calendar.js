export default class Calendar {
    constructor(selector) {
        const calendarEl = document.querySelector(selector);
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
} 