let timetable = null;

export default class Parser {
    constructor(timetab) {
        timetable = timetab;
    }

    getSubjectById(id) {
        let subject = {};
        
        timetable.subjects.forEach(subj => {
            if(subj.id == id) {
                subject = subj;
                return;
            }
        });
    
        return subject;
    }

    getTypeById(id) {
        let type = {};
        
        timetable.types.forEach(tp => {
            if(tp.id == id) {
                type = tp;
                return;
            }
        });
    
        return type;
    }

    getGroupById(id) {
        let group = {};
        
        timetable.groups.forEach(gr => {
            if(gr.id == id) {
                group = gr;
                return;
            }
        });
    
        return group;
    }

    getTeacherById(id) {
        let teacher = {};
        
        timetable.teachers.forEach(teach => {
            if(teach.id == id) {
                teacher = teach;
                return;
            }
        });
    
        return teacher;
    }

    countLessons(id, type, teachers) {
        let counter = 0;

        timetable.events.forEach(event => {
            if(event.subject_id == id && event.type == type) {
                counter++;
            }
        });

        return counter;
    }
}