import { SchoolAgeGroup } from "@/models/types/school";

const initClasses = (type: SchoolAgeGroup) => {
    switch (type) {
        case "Elementary":
            return [
                "כיתה א1",
                "כיתה א2",
                "כיתה ב1",
                "כיתה ב2",
                "כיתה ג1",
                "כיתה ג2",
                "כיתה ד1",
                "כיתה ד2",
                "כיתה ה1",
                "כיתה ה2",
                "כיתה ו1",
                "כיתה ו2",
            ];
        case "Middle":
            return ["כיתה ז1", "כיתה ז2", "כיתה ח1", "כיתה ח2", "כיתה ט1", "כיתה ט2"];
        case "High":
            return ["כיתה י1", "כיתה י2", "כיתהיא1", "כיתהיא2", "כיתהיב1", "כיתהיב2"];
        default:
            return [];
    }
};

const initSubjects = (type: SchoolAgeGroup) => {
    switch (type) {
        case "Elementary":
            return ["חשבון", "עברית", "אנגלית", "מדעים", "תנך", "ספורט"];
        case "Middle":
            return ["מתמטיקה", "עברית", "אנגלית", "מדעים", "תנך", "אזרחות", "ספרות", "ספורט"];
        case "High":
            return ["מתמטיקה", "לשון", "אנגלית", "היסטוריה", "תנך", "אזרחות", "ספרות", "ספורט"];
        default:
            return [];
    }
};

export { initClasses, initSubjects };
