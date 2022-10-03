export default class Parser {
    constructor(timetab) {
        this.timetable = timetab;
    }

    getSubjectById(id) {
        let subject = {};
        
        this.timetable.subjects.forEach(subj => {
            if(subj.id == id) {
                subject = subj;
                return;
            }
        });
    
        return subject;
    }

    getTypeById(id) {
        let type = {};
        
        this.timetable.types.forEach(tp => {
            if(tp.id == id) {
                type = tp;
                return;
            }
        });
    
        return type;
    }

    getGroupById(id) {
        let group = {};
        
        this.timetable.groups.forEach(gr => {
            if(gr.id == id) {
                group = gr;
                return;
            }
        });
    
        return group;
    }

    getTeacherById(id) {
        let teacher = {};
        
        this.timetable.teachers.forEach(teach => {
            if(teach.id == id) {
                teacher = teach;
                return;
            }
        });
    
        return teacher;
    }

    getColorByType(type) {
        let color = '#b50000';

        switch (type) {
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

        return color;
    }

    countLessons(id, typeId, teachers) {
        let counter = 0;

        this.timetable.events.forEach(event => {
            if(event.subject_id == id && event.type == typeId) {
                counter++;
            }
        });

        return counter;
    }

    countCurrentLesson(id, typeId, startTime, endTime) {
        let counter = 0;

        for(let i = 0; i < this.timetable.events.length; i++) {
            let event = this.timetable.events[i];

            if(event.subject_id == id && event.type == typeId) {
                counter++;

                if(event.start_time == startTime && event.end_time == endTime)
                    break;
            }
        }

        return counter;
    }
}