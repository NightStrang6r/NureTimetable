(() => {
  // static/js/dev/preloader.js
  var Preloader = class {
    constructor(selector) {
      this.preloaderEl = document.querySelector(selector);
      this.preloaderImg = this.preloaderEl.children[0];
    }
    async start() {
      this.preloaderEl.classList.remove("d-none");
    }
    stop() {
      this.preloaderEl.classList.add("d-none");
    }
    getRandomPreloader() {
      return `assets/loaders/loader-${this.getRandomInt(1, 6)}.gif`;
    }
    getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  };

  // static/js/dev/parser.js
  var Parser = class {
    constructor(timetab) {
      this.timetable = timetab;
    }
    getSubjectById(id) {
      let subject = {};
      this.timetable.subjects.forEach((subj) => {
        if (subj.id == id) {
          subject = subj;
          return;
        }
      });
      return subject;
    }
    getTypeById(id) {
      let type = {};
      this.timetable.types.forEach((tp) => {
        if (tp.id == id) {
          type = tp;
          return;
        }
      });
      return type;
    }
    getGroupById(id) {
      let group = {};
      this.timetable.groups.forEach((gr) => {
        if (gr.id == id) {
          group = gr;
          return;
        }
      });
      return group;
    }
    getTeacherById(id) {
      let teacher = {};
      this.timetable.teachers.forEach((teach) => {
        if (teach.id == id) {
          teacher = teach;
          return;
        }
      });
      return teacher;
    }
    getColorByType(type) {
      let color = "#b50000";
      switch (type) {
        case "Лб":
          color = "#b300a7";
          break;
        case "Пз":
          color = "#009e18";
          break;
        case "Лк":
          color = "#bf9300";
          break;
        case "Конс":
          color = "#00b9bf";
        default:
          color = "#b50000";
          break;
      }
      return color;
    }
    countLessons(id, typeId, teachers) {
      let counter = 0;
      this.timetable.events.forEach((event) => {
        if (event.subject_id == id && event.type == typeId) {
          counter++;
        }
      });
      return counter;
    }
    countCurrentLesson(id, typeId, startTime, endTime) {
      let counter = 0;
      for (let i = 0; i < this.timetable.events.length; i++) {
        let event = this.timetable.events[i];
        if (event.subject_id == id && event.type == typeId) {
          counter++;
          if (event.start_time == startTime && event.end_time == endTime)
            break;
        }
      }
      return counter;
    }
  };

  // static/js/dev/API.js
  var API = class {
    async getTimetable(id, type) {
      const url = `/get?id=${id}&type=${type}`;
      const options = {
        method: "GET"
      };
      let res, json;
      try {
        res = await fetch(url, options);
        json = await res.json();
      } catch (err) {
        json = false;
      }
      return json;
    }
    async getAllGroups() {
      const url = "/getGroups";
      const options = {
        method: "GET"
      };
      const res = await fetch(url, options);
      const json = await res.json();
      return json;
    }
    async getAllTeachers() {
      const url = "/getTeachers";
      const options = {
        method: "GET"
      };
      const res = await fetch(url, options);
      const json = await res.json();
      return json;
    }
    async getAllAudiences() {
      const url = "/getAudiences";
      const options = {
        method: "GET"
      };
      const res = await fetch(url, options);
      const json = await res.json();
      return json;
    }
  };

  // static/js/dev/storage.js
  var api = new API();
  var onTimetablesSaved = null;
  var onFiltersSaved = null;
  var getTimetable = null;
  var getTimetables = null;
  var Storage = class {
    constructor() {
      this.timetable = null;
      this.groups = null;
      this.reloadButton = null;
      getTimetable = this.getTimetable;
      getTimetables = this.getTimetables;
    }
    getTimetables() {
      if (!localStorage.timetables)
        return [];
      return JSON.parse(localStorage.timetables);
    }
    saveTimetables(timetables) {
      localStorage.timetables = JSON.stringify(timetables);
      onTimetablesSaved(timetables);
    }
    onTimetablesSaved(callback) {
      onTimetablesSaved = callback;
    }
    deleteSelected() {
      return delete localStorage.selected;
    }
    saveSelected(id) {
      localStorage.selected = id;
    }
    getSelected() {
      if (localStorage.selected)
        return Number(localStorage.selected);
      return null;
    }
    saveFilters(filter) {
      localStorage.filter = JSON.stringify(filter);
      onFiltersSaved(filter);
    }
    getFilters() {
      if (localStorage.filter)
        return JSON.parse(localStorage.filter);
      return null;
    }
    onFiltersSaved(callback) {
      onFiltersSaved = callback;
    }
    saveDarkTheme(enabled) {
      this.deleteCookie("dark");
      this.setCookie("dark", enabled);
    }
    getDarkTheme() {
      let dark = this.getCookie("dark");
      if (dark == "true")
        return true;
      if (dark == "false")
        return false;
      return null;
    }
    saveDarkCSS(css) {
      localStorage.darkCSS = css;
    }
    getDarkCSS() {
      if (localStorage.darkCSS)
        return localStorage.darkCSS;
      return null;
    }
    saveCustomEvents(events) {
      let updatedEvents = [];
      events.forEach((event) => {
        updatedEvents.push(event);
      });
      localStorage.customEvents = JSON.stringify(updatedEvents);
    }
    addCustomEvent(event) {
      let events = [];
      if (localStorage.customEvents) {
        events = JSON.parse(localStorage.customEvents);
      }
      events.push(event);
      localStorage.customEvents = JSON.stringify(events);
    }
    getCustomEvents() {
      if (localStorage.customEvents)
        return JSON.parse(localStorage.customEvents);
      return [];
    }
    setAuth(auth) {
      this.setCookie("key", auth);
    }
    deleteAuth() {
      this.deleteCookie("key");
    }
    getAuth() {
      let auth = this.getCookie("key");
      if (auth)
        return auth;
      return null;
    }
    getClient() {
      let client = this.getCookie("client");
      if (client)
        return decodeURIComponent(client).split(";");
      return null;
    }
    updateCustomEvent(newEvent, oldEvent) {
      let events = this.getCustomEvents();
      events.forEach((event, index) => {
        if (!this.isEventEqual(event, oldEvent))
          return;
        events.splice(index, 1);
        if (newEvent != null) {
          newEvent.allDayEvent = true;
          events.push(newEvent);
          console.log("Storage: Event updated");
          return;
        }
        console.log("Storage: Event removed");
      });
      this.saveCustomEvents(events);
    }
    isEventEqual(event1, event2) {
      if (event2.start && event2.end) {
        if (new Date(event1.start).getTime() != event2.start.getTime())
          return false;
        if (new Date(event1.end).getTime() != event2.end.getTime())
          return false;
      }
      if (event1.title != event2.title)
        return false;
      if (String(event1.extendedProps.description) != event2.extendedProps.description)
        return false;
      return true;
    }
    deleteCacheById(id) {
      let timetables = this.getTimetables();
      if (timetables.length > 0) {
        for (let i = 0; i < timetables.length; i++) {
          let timetable = timetables[i];
          if (timetable.id == id) {
            if (!timetable.data)
              break;
            delete timetable.data;
            break;
          }
        }
      }
      localStorage.timetables = JSON.stringify(timetables);
    }
    async getTimetable(id, reload = false) {
      let timetables = this.getTimetables();
      let type, name;
      if (timetables.length > 0) {
        for (let i = 0; i < timetables.length; i++) {
          let timetable = timetables[i];
          if (timetable.id == id) {
            if (!timetable.data) {
              type = timetable.type;
              name = timetable.name;
              timetables.splice(i, 1);
              break;
            } else if (reload) {
              delete timetable.data;
              break;
            }
            this.timetable = JSON.parse(timetable.data);
            return this.timetable;
          }
        }
      }
      this.timetable = await api.getTimetable(id, type);
      if (!this.timetable) {
        this.timetable = {};
        this.timetable.error = true;
        return this.timetable;
      }
      timetables.push({
        id,
        type,
        name,
        data: JSON.stringify(this.timetable)
      });
      localStorage.timetables = JSON.stringify(timetables);
      return this.timetable;
    }
    async getAllGroups() {
      if (!localStorage.groups) {
        this.groups = await api.getAllGroups();
        localStorage.groups = JSON.stringify(this.groups);
      } else {
        this.groups = JSON.parse(localStorage.groups);
      }
      return this.groups;
    }
    async getAllTeachers() {
      if (!localStorage.teachers) {
        this.teachers = await api.getAllTeachers();
        localStorage.teachers = JSON.stringify(this.teachers);
      } else {
        this.teachers = JSON.parse(localStorage.teachers);
      }
      return this.teachers;
    }
    async getAllAudiences() {
      if (!localStorage.audiences) {
        this.audiences = await api.getAllAudiences();
        localStorage.audiences = JSON.stringify(this.audiences);
      } else {
        this.audiences = JSON.parse(localStorage.audiences);
      }
      return this.audiences;
    }
    saveLanguage(language) {
      this.setCookie("lang", language);
    }
    getLanguage() {
      let lang = this.getCookie("lang");
      if (!lang)
        return null;
      return lang;
    }
    getCookie(name) {
      let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : void 0;
    }
    setCookie(name, value, options = {}) {
      options = {
        path: "/",
        ...options
      };
      if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString();
      }
      let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
      for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
          updatedCookie += "=" + optionValue;
        }
      }
      document.cookie = updatedCookie;
    }
    deleteCookie(name) {
      this.setCookie(name, "", {
        "max-age": -1
      });
    }
    deleteAllCookies() {
      let cookies = document.cookie.split(";");
      for (var i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        let eqPos = cookie.indexOf("=");
        let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;";
        document.cookie = name + "=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      }
    }
    setClearTrigger(selector) {
      let trigger = document.querySelector(selector);
      trigger.addEventListener("click", (event) => this.clear(event));
    }
    clear() {
      let lToClearCache = document.querySelector("#l-toClearCache");
      if (!confirm(lToClearCache.innerHTML))
        return;
      localStorage.clear();
      this.deleteAllCookies();
      window.location.reload();
    }
  };

  // static/js/dev/popup.js
  var Popup = class {
    constructor(popupSelector, triggerSelector) {
      this.popupEl = document.querySelector(popupSelector);
      if (triggerSelector != null)
        this.popupTriggerEl = document.querySelector(triggerSelector);
      this.setupListeners();
    }
    setupListeners() {
      this.popupEl.classList.remove("d-none");
      this.popupTriggerEl.addEventListener("click", (event) => this.open(event));
      this.popupEl.addEventListener("click", (event) => this.closeEvent(event));
      document.addEventListener("keyup", (event) => this.closeEvent(event));
    }
    open(event) {
      event.preventDefault();
      this.popupEl.classList.add("is-visible");
    }
    close() {
      this.popupEl.classList.remove("is-visible");
    }
    closeEvent(event) {
      if ($(event.target).is(".cd-popup-close") || $(event.target).is(".cd-popup")) {
        event.preventDefault();
        this.close();
      }
      if (event.which == "27") {
        this.close();
      }
    }
    addOpenSelect(selector, selectId) {
      let select = document.querySelector(selector);
      if (select == null)
        return;
      select.addEventListener("input", (event) => {
        if (select.selectedIndex != selectId)
          return;
        this.open(event);
      });
    }
  };

  // static/js/dev/popupEventAdd.js
  var PopupEventAdd = class extends Popup {
    constructor(popupSelector, calendar) {
      super(popupSelector, null);
      this.popupNameEl = document.querySelector(".event-name");
      this.popupDescriptionEl = document.querySelector(".event-description");
      this.popupTimeFromEl = document.querySelector(".event-time-from");
      this.popupTimeToEl = document.querySelector(".event-time-to");
      this.popupDateEl = document.querySelector(".event-date");
      this.popupSaveEl = document.querySelector(".popup-event-save");
      this.popupSaveEl.addEventListener("click", (event) => this.save(event));
      this.pageCalendar = calendar;
      this.calendar = calendar.calendar;
      this.storage = window.storage;
    }
    setupListeners() {
      this.popupEl.classList.remove("d-none");
      this.popupEl.addEventListener("click", (event) => this.closeEvent(event));
      document.addEventListener("keyup", (event) => this.closeEvent(event));
    }
    open(info) {
      this.info = info;
      this.popupEl.classList.add("is-visible");
      let timeFrom, timeTo, date;
      if (!info.event) {
        this.popupNameEl.value = "";
        this.popupDescriptionEl.value = "";
      } else {
        info = info.event;
        if (info.title) {
          this.info.editing = true;
          this.popupNameEl.value = info.title;
        }
        if (info.extendedProps.description && info.extendedProps.description != "") {
          this.popupDescriptionEl.value = info.extendedProps.description;
        }
      }
      timeFrom = this.getTimeString(info.start);
      timeTo = this.getTimeString(info.end);
      date = this.getDateString(info.start);
      this.popupTimeFromEl.value = timeFrom;
      this.popupTimeToEl.value = timeTo;
      this.popupDateEl.value = date;
    }
    getTimeString(time) {
      if (!time)
        return "--:--";
      let hours = time.getHours();
      let minutes = time.getMinutes();
      hours = this.validateTimeValue(hours);
      minutes = this.validateTimeValue(minutes);
      return `${hours}:${minutes}`;
    }
    getDateString(date) {
      if (!date)
        return "";
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      month = this.validateTimeValue(month);
      day = this.validateTimeValue(day);
      return `${year}-${month}-${day}`;
    }
    validateTimeValue(time) {
      if (time.toString().length == 1)
        time = `0${time}`;
      return time;
    }
    getDateValue(initialDate, timeString, dateString = null) {
      let year, month, day;
      let time = timeString.split(":");
      if (dateString != null) {
        let date = dateString.split("-");
        year = date[0];
        month = date[1] - 1;
        day = date[2];
      } else {
        year = initialDate.getFullYear();
        month = initialDate.getMonth();
        day = initialDate.getDate();
      }
      let newDate = new Date(year, month, day, time[0], time[1]);
      return newDate;
    }
    close() {
      if (this.popupNameEl.value.length > 0 || this.popupDescriptionEl.value.length > 0) {
        let lUnsavedData = document.querySelector("#l-unsavedData");
        if (!confirm(lUnsavedData.innerHTML))
          return;
      }
      super.close();
      this.calendar.unselect();
    }
    save() {
      let name = this.popupNameEl.value;
      let description = this.popupDescriptionEl.value;
      let info = this.info;
      if (name.length >= 150) {
        let lTooLongName = document.querySelector("#l-tooLongName");
        alert(lTooLongName.innerHTML);
        return;
      }
      if (description.length >= 500) {
        let lTooLongDesc = document.querySelector("#l-tooLongDescription");
        alert(lTooLongDesc.innerHTML);
        return;
      }
      if (this.popupTimeFromEl.value >= this.popupTimeToEl.value) {
        let lInvalidTime = document.querySelector("#l-invalidTime");
        alert(lInvalidTime.innerHTML);
        return;
      }
      if (this.info.editing) {
        info = Object.assign(this.info.event);
        this.storage.updateCustomEvent(null, this.info.event);
        this.info.event.remove();
      }
      let start, end, eventDate = info.start;
      start = this.getDateValue(eventDate, this.popupTimeFromEl.value, this.popupDateEl.value);
      if (info.end) {
        eventDate = info.end;
      }
      end = this.getDateValue(eventDate, this.popupTimeToEl.value);
      if (name != "") {
        let event = {
          title: name,
          start,
          end,
          allDay: info.allDay,
          editable: true,
          extendedProps: {
            description
          }
        };
        this.storage.addCustomEvent(event);
        this.calendar.addEvent(event);
        this.calendar.unselect();
      }
      this.popupNameEl.value = "";
      this.popupDescriptionEl.value = "";
      this.popupTimeFromEl.value = "00:00";
      this.popupTimeToEl.value = "00:00";
      this.close();
    }
  };

  // static/js/dev/popupEventView.js
  var PopupEventView = class extends Popup {
    constructor(popupSelector, calendar) {
      super(popupSelector, null);
      this.popupNameEl = document.querySelector(".event-data-title");
      this.popupDescriptionEl = document.querySelector(".event-data-description");
      this.popupTimeEl = document.querySelector(".event-data-time");
      this.popupDateEl = document.querySelector(".event-data-date");
      this.popupEditEl = document.querySelector(".event-data-edit");
      this.popupDeleteEl = document.querySelector(".event-data-delete");
      this.popupDeleteEl.addEventListener("click", (event) => this.delete(event));
      this.popupEditEl.addEventListener("click", (event) => this.edit(event));
      this.pageCalendar = calendar;
      this.calendar = calendar.calendar;
      this.storage = window.storage;
    }
    setupListeners() {
      this.popupEl.classList.remove("d-none");
      this.popupEl.addEventListener("click", (event) => this.closeEvent(event));
      document.addEventListener("keyup", (event) => this.closeEvent(event));
    }
    open(info) {
      this.info = info;
      this.popupEl.classList.add("is-visible");
      this.popupNameEl.innerHTML = info.event.title;
      if (info.event.extendedProps.description || info.event.extendedProps.description == "") {
        this.popupDescriptionEl.innerHTML = info.event.extendedProps.description;
      }
      if (info.event.allDay)
        return;
      this.popupTimeEl.innerHTML = `${this.getTimeString(info.event.start)}&nbsp;&mdash;&nbsp;${this.getTimeString(info.event.end)}`;
      this.popupDateEl.innerHTML = this.getDateString(info.event.start);
    }
    getTimeString(time) {
      if (!time)
        return "--:--";
      let hours = time.getHours();
      let minutes = time.getMinutes();
      hours = this.validateTimeValue(hours);
      minutes = this.validateTimeValue(minutes);
      return `${hours}:${minutes}`;
    }
    getDateString(date) {
      if (!date)
        return "";
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      month = this.validateTimeValue(month);
      day = this.validateTimeValue(day);
      return `${year}-${month}-${day}`;
    }
    validateTimeValue(time) {
      if (time.toString().length == 1)
        time = `0${time}`;
      return time;
    }
    close() {
      super.close();
    }
    delete() {
      if (!confirm(this.pageCalendar.locale.toDelete))
        return;
      this.storage.updateCustomEvent(null, this.info.event);
      this.info.event.remove();
      this.close();
    }
    edit() {
      this.close();
      this.pageCalendar.onSelect(this.info);
    }
  };

  // static/js/dev/calendar.js
  var Calendar = class {
    constructor(selector) {
      const calendarEl = document.querySelector(selector);
      this.loadLocalization();
      const options = {
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        },
        buttonText: {
          today: this.locale.today,
          month: this.locale.month,
          week: this.locale.week,
          day: this.locale.day
        },
        moreLinkText: "",
        allDayText: "",
        initialView: "timeGridWeek",
        locale: this.locale.lang,
        selectable: true,
        dayMaxEvents: true,
        selectMirror: true,
        firstDay: 1,
        height: "100%",
        nowIndicator: true,
        slotMinTime: "08:00:00",
        slotMaxTime: "18:00:00",
        slotDuration: "00:25:00",
        slotLabelFormat: {
          hour: "numeric",
          minute: "2-digit",
          omitZeroMinute: false,
          meridiem: "short"
        },
        unselectCancel: ".cd-popup-container",
        schedulerLicenseKey: "CC-Attribution-NonCommercial-NoDerivatives",
        select: (event) => this.onSelect(event),
        eventClick: (event) => this.onEventClick(event),
        eventChange: (event) => this.onEventChange(event)
      };
      this.calendar = new FullCalendar.Calendar(calendarEl, options);
      this.storage = window.storage;
      this.popupAdd = new PopupEventAdd(".cd-popup-event-add", this);
      this.popupView = new PopupEventView(".cd-popup-event-view", this);
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
    loadLocalization() {
      this.locale = {
        lang: document.querySelector("#l-lang").innerHTML,
        today: document.querySelector("#l-today").innerHTML,
        month: document.querySelector("#l-month").innerHTML,
        week: document.querySelector("#l-week").innerHTML,
        day: document.querySelector("#l-day").innerHTML,
        type: document.querySelector("#l-type").innerHTML,
        audience: document.querySelector("#l-audience").innerHTML,
        teachers: document.querySelector("#l-teachers").innerHTML,
        groups: document.querySelector("#l-groups").innerHTML,
        dayUpper: document.querySelector("#l-dayUpper").innerHTML,
        time: document.querySelector("#l-time").innerHTML,
        toDelete: document.querySelector("#l-toDelete").innerHTML
      };
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
        if (filters && filters.includes("custom_event"))
          return;
        let calendarEvent = this.calendar.addEvent(event);
        calendarEvent.setProp("editable", true);
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
      if (filters && filters.includes(type.type))
        return;
      let subject = parser.getSubjectById(event.subject_id);
      let auditory = event.auditory;
      let color = parser.getColorByType(type.short_name);
      this.calendar.addEvent({
        title: `${subject.brief} ${type.short_name} ${auditory}`,
        start: event.start_time * 1e3,
        end: event.end_time * 1e3,
        color,
        extendedProps: {
          subject,
          type,
          auditory,
          teachers: event.teachers,
          groups: event.groups,
          start: event.start_time,
          end: event.end_time
        }
      });
    }
    onEventClick(info) {
      if (info.event.extendedProps.subject) {
        this.onFixedEvent(info);
      } else {
        this.onCustomEvent(info);
      }
    }
    onFixedEvent(info) {
      let parser = new Parser(this.timetable);
      console.log("Calendar: Fixed event click:");
      console.log(info);
      let properties = info.event.extendedProps;
      let title = properties.subject.title;
      let type = properties.type.full_name;
      let auditory = properties.auditory;
      let groups = "";
      let teachers = "";
      let day = info.event.start.toLocaleString(this.lang, { weekday: "long", year: "numeric", month: "numeric", day: "numeric" });
      let start = info.event.start.toLocaleString(this.lang, { hour: "numeric", minute: "numeric" });
      let end = info.event.end.toLocaleString(this.lang, { hour: "numeric", minute: "numeric" });
      let lessonsCount = parser.countLessons(properties.subject.id, properties.type.id, properties.teachers);
      let currentLesson = parser.countCurrentLesson(properties.subject.id, properties.type.id, properties.start, properties.end);
      properties.teachers.forEach((id) => {
        teachers += `${parser.getTeacherById(id).full_name} `;
      });
      properties.groups.forEach((id) => {
        groups += `${parser.getGroupById(id).name} `;
      });
      alert(`${title}

${this.locale.type}: ${type} (${currentLesson}/${lessonsCount})
${this.locale.audience}: ${auditory}
${this.locale.teachers}: ${teachers}
${this.locale.groups}: ${groups}
${this.locale.dayUpper}: ${day}
${this.locale.time}: ${start} - ${end}`);
    }
    onCustomEvent(info) {
      console.log("Calendar: Custom event click:");
      console.log(info);
      this.popupView.open(info);
    }
    onSelect(info) {
      console.log("Calendar: Area selected:");
      console.log(info);
      this.popupAdd.open(info);
    }
    onEventChange(info) {
      this.storage.updateCustomEvent(info.event, info.oldEvent);
    }
  };

  // static/js/dev/select.js
  var createOption;
  var onSelected;
  var Select = class {
    constructor(selector) {
      this.select = document.querySelector(selector);
      this.defaultSelect = this.select.options[0];
      this.select.addEventListener("input", this.onSelect);
      createOption = this.createOption;
      onSelected = this.onSelected;
    }
    set(timetables) {
      this.clearOptions();
      timetables.forEach((timetable) => {
        let option = createOption(timetable.name, timetable.id, timetable.type);
        if (option == null)
          return;
        this.select.append(option);
      });
    }
    setSelected(id) {
      let options = this.select.options;
      for (let i = 0; i < options.length; i++) {
        let option = options[i];
        if (option.dataset.id == id) {
          option.selected = true;
        }
      }
    }
    clearOptions() {
      this.select.innerHTML = "";
      this.select.append(this.defaultSelect);
    }
    onSelect(event) {
      let target = event.target;
      let option = target.options[target.selectedIndex];
      if (option.dataset.id) {
        onSelected(option.dataset.id);
      }
    }
    onSelected(callback) {
      onSelected = callback;
    }
    getFirstOption() {
      if (!this.select.options[1])
        return null;
      return {
        id: this.select.options[1].dataset.id,
        name: this.select.options[1].innerHTML,
        type: this.select.options[1].dataset.type
      };
    }
    createOption(name, id, type) {
      if (!name || !id || !type)
        return null;
      let option = document.createElement("option");
      option.innerHTML = name;
      option.dataset.id = id;
      option.dataset.type = type;
      return option;
    }
  };

  // static/js/dev/listController.js
  var ListController = class {
    constructor(listEl, storage) {
      this.popupListEl = listEl;
      this.popupListEl.addEventListener("click", (event) => this.onListClick(event));
      this.searchString = "";
      this.selected = storage.getTimetables();
    }
    onListClick(event) {
      event.preventDefault();
      const listItem = event.target;
      if (!listItem.className.includes("list-item"))
        return;
      if (!listItem.className.includes("list-item-selected")) {
        listItem.classList.add("list-item-selected");
        let type = this.popupListEl.dataset.type;
        this.selected.push({
          type,
          id: listItem.dataset.id,
          name: listItem.innerHTML
        });
      } else {
        listItem.classList.remove("list-item-selected");
        this.selected.forEach((item, index) => {
          if (item.id == listItem.dataset.id && item.name == listItem.innerHTML) {
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
        if (!item)
          return;
        let name;
        if (!item.name) {
          name = item.short_name;
        } else {
          name = item.name;
        }
        if (!name.toLowerCase().includes(this.searchString))
          return;
        let listItem = document.createElement("div");
        listItem.className = "list-item";
        listItem.innerHTML = name;
        listItem.dataset.id = item.id;
        if (item.full_name)
          listItem.title = item.full_name;
        this.checkIfSelected(listItem);
        this.popupListEl.append(listItem);
        counter++;
      });
      console.log(`ListController: Search: found ${counter} elements.`);
    }
    checkIfSelected(listItem) {
      this.selected.forEach((item) => {
        if (item.type != this.popupListEl.dataset.type)
          return;
        if (item.id == listItem.dataset.id) {
          listItem.classList.add("list-item-selected");
        }
      });
    }
    setSelected(select) {
      this.selected = select;
    }
    getSelected() {
      return this.selected;
    }
  };

  // static/js/dev/popupAdd.js
  var PopupAdd = class extends Popup {
    constructor(popupSelector, triggerSelector) {
      super(popupSelector, triggerSelector);
      this.popupListEl = document.querySelector(".popup-list");
      this.popupTabHeaderEl = document.querySelector(".tab-header");
      this.popupSaveEl = document.querySelector(".popup-add-save");
      this.searchInputEl = document.querySelector(".input-search");
      this.popupSaveEl.addEventListener("click", (event) => this.save(event));
      this.popupTabHeaderEl.addEventListener("click", (event) => this.onTabClick(event));
      this.searchInputEl.addEventListener("input", (event) => this.onInput(event));
      this.storage = window.storage;
      this.listController = new ListController(this.popupListEl, this.storage);
    }
    async open(event) {
      super.open(event);
      this.removeTabSelection();
      this.popupTabHeaderEl.children[0].classList.add("active");
      this.popupListEl.innerHTML = "";
      this.searchInputEl.value = "";
      let data = await this.storage.getAllGroups();
      this.listController.loadList(data, "groups");
    }
    close() {
      super.close();
      if (!this.listController)
        return;
      this.listController.setSearch("");
    }
    save() {
      let selected = this.listController.getSelected();
      if (selected.length == 0) {
        this.storage.deleteSelected();
      }
      this.storage.saveTimetables(selected);
      this.close();
    }
    async onInput(event) {
      let tab = this.getActiveTab();
      this.listController.setSearch(event.srcElement.value);
      this.loadList(tab);
    }
    getActiveTab() {
      for (let i = 0; i < this.popupTabHeaderEl.children.length; i++) {
        let tab = this.popupTabHeaderEl.children[i];
        if (tab.className.includes("active")) {
          return tab.dataset.tab;
        }
      }
    }
    removeTabSelection() {
      for (let i = 0; i < this.popupTabHeaderEl.children.length; i++) {
        let tab = this.popupTabHeaderEl.children[i];
        if (tab.className.includes("active")) {
          tab.classList.remove("active");
        }
      }
    }
    onTabClick(event) {
      event.preventDefault();
      const tabItem = event.target;
      if (!tabItem.className.includes("tab-header-item"))
        return;
      this.removeTabSelection();
      tabItem.classList.add("active");
      this.loadList(tabItem.dataset.tab);
    }
    async loadList(tab) {
      let data;
      this.popupListEl.innerHTML = "";
      switch (tab) {
        case "groups":
          data = await this.storage.getAllGroups();
          break;
        case "teachers":
          data = await this.storage.getAllTeachers();
          break;
        case "audiences":
          data = await this.storage.getAllAudiences();
          break;
      }
      this.listController.loadList(data, tab);
    }
  };

  // static/js/dev/darkTheme.js
  var DarkTheme = class {
    constructor(selector) {
      this.selector = selector;
      this.storage = window.storage;
      document.addEventListener("DOMContentLoaded", () => this.onDOMContentLoaded());
      this.onLoad();
    }
    onDOMContentLoaded() {
      this.trigger = document.querySelector(this.selector);
      this.trigger.addEventListener("click", (event) => this.onTrigger(event));
      let isEnabled = this.isEnabled();
      this.setButtonImage(!isEnabled);
    }
    isEnabled() {
      let isEnabled = this.storage.getDarkTheme();
      if (isEnabled == null)
        isEnabled = false;
      return isEnabled;
    }
    onLoad() {
      let isEnabled = this.isEnabled();
      if (isEnabled) {
        this.enable();
      } else {
        this.disable();
      }
    }
    onTrigger(event) {
      event.preventDefault();
      let isEnabled = this.isEnabled();
      this.setButtonImage(isEnabled);
      this.storage.saveDarkTheme(!isEnabled);
      if (isEnabled) {
        this.disable();
      } else {
        this.enable();
      }
    }
    setButtonImage(isEnabled) {
      let img = this.trigger.children[0];
      if (isEnabled) {
        img.src = "assets/sun.png";
      } else {
        img.src = "assets/moon.png";
      }
    }
    async enable() {
      let dark = document.createElement("style");
      let css = await this.getDarkCSS();
      dark.innerHTML = css;
      dark.id = "darkCSS";
      document.head.append(dark);
    }
    disable() {
      let darkStyle = document.querySelectorAll("#darkCSS");
      let darkLink = document.querySelector('link[href="css/dark.css"]');
      if (darkLink != null)
        darkLink.remove();
      if (darkStyle != null)
        darkStyle.forEach((el) => el.remove());
    }
    async getDarkCSS() {
      let css = this.storage.getDarkCSS();
      if (css != null)
        return css;
      let res = await fetch("css/dark.css");
      css = await res.text();
      this.storage.saveDarkCSS(css);
      return css;
    }
  };

  // static/js/dev/popupFilter.js
  var PopupFilter = class extends Popup {
    constructor(popupSelector, triggerSelector) {
      super(popupSelector, triggerSelector);
      this.checkboxesEl = document.querySelector(".checkboxes");
      this.checkboxEl = document.querySelector(".checkbox");
      this.popupSaveEl = document.querySelector(".popup-filter-save");
      this.popupSaveEl.addEventListener("click", (event) => this.save(event));
      this.storage = window.storage;
    }
    async open(event) {
      super.open(event);
      this.checkboxesEl.innerHTML = "";
      let selectedId = this.storage.getSelected();
      if (!selectedId)
        return;
      let timetable = await this.storage.getTimetable(selectedId);
      let filters = this.storage.getFilters();
      let types = timetable.types;
      let filterTypes = [];
      if (!types)
        return;
      for (let i = 0; i < types.length; i++) {
        let type = types[i];
        if (!filterTypes.includes(type.type)) {
          filterTypes.push(type.type);
        }
      }
      filterTypes.push("custom_event");
      for (let i = 0; i < filterTypes.length; i++) {
        let type = filterTypes[i];
        let checkbox = this.checkboxEl.cloneNode(true);
        checkbox.classList.remove("d-none");
        let label = checkbox.children[0];
        let input = label.children[0];
        let span = label.children[1];
        let typeName = this.getLessonName(type);
        span.innerHTML = typeName;
        input.value = type;
        if (filters && filters.includes(type)) {
          input.checked = false;
        } else {
          input.checked = true;
        }
        this.checkboxesEl.append(checkbox);
      }
    }
    getLessonName(type) {
      let nameEl = document.querySelector(`#${type}`);
      if (nameEl == null)
        return type;
      return nameEl.innerHTML;
    }
    getUnselected() {
      let unselected = [];
      for (let i = 0; i < this.checkboxesEl.children.length; i++) {
        let checkbox = this.checkboxesEl.children[i];
        if (checkbox.className.includes("d-none"))
          continue;
        let label = checkbox.children[0];
        let input = label.children[0];
        if (input.checked)
          continue;
        unselected.push(input.value);
      }
      return unselected;
    }
    save() {
      let filters = this.getUnselected();
      this.storage.saveFilters(filters);
      this.close();
    }
  };

  // static/js/dev/popupLanguage.js
  var PopupLanguage = class extends Popup {
    constructor(popupSelector, triggerSelector) {
      super(popupSelector, triggerSelector);
      this.select = document.querySelector(".language-select");
      this.popupSaveEl = document.querySelector(".popup-language-save");
      this.popupSaveEl.addEventListener("click", (event) => this.save(event));
      this.storage = window.storage;
    }
    open(event) {
      super.open(event);
      let lang = this.storage.getLanguage();
      this.select.value = lang;
    }
    save() {
      this.storage.saveLanguage(this.select.value);
      this.close();
      window.location.reload();
    }
  };

  // static/js/dev/auth.js
  var Auth = class {
    constructor(selector) {
      this.authEl = document.querySelector(selector);
      this.authButton = document.querySelector(".auth-button");
      this.logoutButton = document.querySelector(".logout-button");
      this.selectEl = document.querySelector(".select-group");
      this.menuRightEl = document.querySelector(".menu-right");
      this.calendar = document.querySelector("#calendar-container");
      this.addTip = document.querySelector(".addTip");
      this.logo = document.querySelector(".logo");
      this.authButton.addEventListener("click", (event) => this.onAuth(event));
      this.logoutButton.addEventListener("click", (event) => this.onLogout(event));
      this.storage = window.storage;
      if (!this.check()) {
        this.setVisibility("deauthed");
      } else {
        this.setVisibility("authed");
      }
      if (this.authError()) {
        history.pushState(null, null, "/");
        let lAuthError = document.querySelector("#l-authError");
        if (lAuthError == null)
          return;
        alert(lAuthError.innerHTML);
      }
    }
    check() {
      if (this.storage.getAuth() == null)
        return false;
      return true;
    }
    onAuth() {
      const url = this.getAuthURL();
      window.location.href = url;
    }
    onLogout() {
      this.storage.deleteAuth();
      window.location.reload();
    }
    setVisibility(visibility) {
      if (visibility == "deauthed") {
        this.authEl.classList.remove("d-none");
        this.logo.classList.add("d-none");
        this.calendar.classList.add("d-none");
        this.selectEl.classList.add("d-none");
        this.menuRightEl.classList.add("d-none");
        this.logoutButton.classList.add("d-none");
        this.addTip.classList.add("d-none");
        return;
      }
    }
    authError() {
      const search = window.location.search;
      if (search && search.includes("auth") && search.includes("error"))
        return true;
      return false;
    }
    getAuthURL() {
      const data = this.storage.getClient();
      const client = data[0];
      const redirect = data[1];
      const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
      const options = `redirect_uri=${redirect}&client_id=${client}&access_type=offline&response_type=code&prompt=consent&scope=https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email`;
      return `${rootUrl}?${options}`;
    }
  };

  // static/js/dev/app.js
  var App = class {
    run() {
      document.addEventListener("DOMContentLoaded", (event) => this.main(event));
      this.init();
    }
    async init() {
      window.storage = new Storage();
      this.storage = window.storage;
      this.darkTheme = new DarkTheme(".dark-trigger");
    }
    async main() {
      this.preloader = new Preloader(".preloader");
      this.preloader.start();
      this.calendar = new Calendar("#calendar");
      this.select = new Select(".timetable-select");
      this.auth = new Auth(".auth");
      this.calendarContainer = document.querySelector("#calendar-container");
      this.addTip = document.querySelector(".addTip");
      this.reloadButton = document.querySelector(".reload-trigger");
      this.storage.setClearTrigger(".clear-button");
      let timetables = this.storage.getTimetables();
      let lastTimetableId = this.storage.getSelected();
      this.select.set(timetables);
      if (lastTimetableId) {
        this.select.setSelected(lastTimetableId);
        this.loadTimetable(lastTimetableId);
      } else {
        if (!this.calendarContainer.className.includes("d-none")) {
          this.calendarContainer.classList.add("d-none");
          this.addTip.classList.remove("d-none");
          this.addTip.addEventListener("click", () => {
            document.querySelector(".cd-popup-add-trigger").click();
          });
        }
        this.preloader.stop();
      }
      this.select.onSelected((prop) => this.onSelectedCallback(prop));
      this.storage.onTimetablesSaved((prop) => this.onTimetablesSavedCallback(prop));
      this.storage.onFiltersSaved((prop) => this.onFiltersSavedCallback(prop));
      this.reloadButton.addEventListener("click", (prop) => this.onReloadButton(prop));
      this.popupAdd = new PopupAdd(".cd-popup-add", ".cd-popup-add-trigger");
      new PopupFilter(".cd-popup-filter", ".cd-popup-filter-trigger");
      new PopupLanguage(".cd-popup-language", ".cd-popup-language-trigger");
      this.popupAdd.addOpenSelect(".timetable-select", 0);
    }
    async loadTimetable(id) {
      let timetable;
      if (this.auth.check()) {
        this.calendarContainer.classList.remove("d-none");
        this.addTip.classList.add("d-none");
      }
      this.calendar.destroy();
      this.preloader.start();
      if (!id) {
        this.calendar.removeEvents();
        this.calendar.render();
        this.preloader.stop();
        return;
      }
      this.storage.saveSelected(id);
      this.calendar.removeEvents();
      timetable = await this.storage.getTimetable(id);
      if (timetable.error) {
        this.preloader.stop();
        this.ttUnavailable = document.querySelector("#timetable-unavailable");
        alert(this.ttUnavailable.innerHTML);
      } else {
        this.calendar.setTimetable(timetable);
        this.calendar.loadEvents(timetable.events);
        this.calendar.loadAllCustomEvents();
      }
      this.calendar.render();
      this.preloader.stop();
    }
    onSelectedCallback(id) {
      this.loadTimetable(id);
    }
    onTimetablesSavedCallback(timetables) {
      this.select.set(timetables);
    }
    onFiltersSavedCallback(filters) {
      let selected = this.storage.getSelected();
      if (!selected)
        return;
      this.loadTimetable(selected);
    }
    onReloadButton() {
      let selected = this.storage.getSelected();
      if (!selected)
        return;
      this.storage.deleteCacheById(selected);
      this.loadTimetable(selected);
    }
  };

  // static/js/dev/script.js
  var app = new App();
  app.run();
})();
