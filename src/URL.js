class URL {
    getTimetableUrl(groupId) {
        return 'https://cist.nure.ua/ias/app/tt/P_API_EVEN_JSON'
            + '?type_id=1'
            + `&timetable_id=${groupId}`
            + '&idClient=KNURESked';
    }

    getGroupsUrl() {
        return 'https://cist.nure.ua/ias/app/tt/P_API_GROUP_JSON';
    }

    getTeachersUrl() {
        return 'https://cist.nure.ua/ias/app/tt/P_API_PODR_JSON';
    }

    getAudiencesUrl() {
        return 'https://cist.nure.ua/ias/app/tt/P_API_AUDITORIES_JSON';
    }
}

module.exports = URL;