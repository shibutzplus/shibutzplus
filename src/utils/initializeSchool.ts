import { SchoolType } from "@/models/types/school";

const initClasses = (type: SchoolType) => {
    switch (type) {
        case "Elementary":
            return [
                "א1",
                "א2",
                "א3",
                "ב1",
                "ב2",
                "ב3",
                "ג1",
                "ג2",
                "ג3",
                "ד1",
                "ד2",
                "ד3",
                "",
                "",
                "",
            ];
        case "Middle":
            return ["", "", "", "", "", "", "", "", "", "", "", "", ""];
        case "High":
            return ["", "", "", "", "", "", "", "", "", "", "", "", ""];
        default:
            return [];
    }
};

const initProfessions = (type: SchoolType) => {
    switch (type) {
        case "Elementary":
            return [
                "מתמטיקה",
                "עברית",
                "אנגלית",
                "מדעים",
                "תנ\"ך",
                "היסטוריה",
                "גיאוגרפיה",
                "אומנות",
                "ספורט",
                "מוסיקה",
                "",
                "",
                "",
            ];
        case "Middle":
            return [
                "מתמטיקה",
                "עברית",
                "אנגלית",
                "מדעים",
                "תנ\"ך",
                "היסטוריה",
                "גיאוגרפיה",
                "אזרחות",
                "ספרות",
                "ספורט",
                "מחשבים",
                "",
                "",
            ];
        case "High":
            return [
                "מתמטיקה",
                "עברית",
                "אנגלית",
                "פיזיקה",
                "כימיה",
                "ביולוגיה",
                "היסטוריה",
                "אזרחות",
                "ספרות",
                "מדעי המחשב",
                "פסיכולוגיה",
                "סוציולוגיה",
                "",
            ];
        default:
            return [];
    }
};

export { initClasses, initProfessions };
