document.addEventListener('DOMContentLoaded', initCalendar);

function initCalendar() {
    const date = new Date();
    const dateNew = new Date(date.getTime() + 3600000);

    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
        },
        initialView: 'timeGridWeek',
        locale: "ru",
        firstDay: 1,
        height: '100%',
        nowIndicator: true,
        slotMinTime: "08:00:00",
        slotMaxTime: "18:00:00",
        slotDuration: "00:30:00",
        slotLabelFormat: {
            hour: 'numeric',
            minute: '2-digit',
            omitZeroMinute: false,
            meridiem: 'short'
        },
        events: [
            {
                title: 'Фіз Лк',
                start: date,
                end: dateNew,
                extendedProps: {
                    department: 'BioChemistry'
                },
                description: 'Lecture'
            }
        ]
    });
    calendar.render();
}