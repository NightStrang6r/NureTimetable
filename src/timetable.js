class Timetable {
    getTimetableName(id, type, timetable) {
        let name = '';

        switch (type) {
            case 2:
                name = this.getTeacherById(timetable, id).full_name;
                break;
            default:
                name = this.getGroupById(timetable, id).name;
                break;
        }

        return name;
    }

    getSubjectById(timetable, id) {
        let subject = {};
        
        timetable.subjects.forEach(subj => {
            if(subj.id == id) {
                subject = subj;
                return;
            }
        });
    
        return subject;
    }

    getTypeById(timetable, id) {
        let type = {};
        
        timetable.types.forEach(tp => {
            if(tp.id == id) {
                type = tp;
                return;
            }
        });
    
        return type;
    }

    getGroupById(timetable, id) {
        let group = {};
        
        timetable.groups.forEach(gr => {
            if(gr.id == id) {
                group = gr;
                return;
            }
        });
    
        return group;
    }

    getTeacherById(timetable, id) {
        let teacher = {};
        
        timetable.teachers.forEach(teach => {
            if(teach.id == id) {
                teacher = teach;
                return;
            }
        });
    
        return teacher;
    }
}

module.exports = Timetable;