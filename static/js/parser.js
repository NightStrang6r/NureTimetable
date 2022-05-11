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
        
        timetable.types.forEach(typef => {
            if(typef.id == id) {
                type = typef;
                return;
            }
        });
    
        return type;
    }

    getAuditoryById(id) {
        
    }
}