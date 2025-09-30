import { SchoolType } from "@/models/types/school";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";

// Local storage keys
export const STORAGE_KEYS = {
    CACHE_TIMESTAMP: "cache_timestamp",
    CLASSES_DATA: "classes_data",
    TEACHERS_DATA: "teachers_data",
    SUBJECTS_DATA: "subjects_data",
    SCHOOL_DATA: "school_data",
    TEACHER_DATA: "teacher_data",
};

export const getStorage = <T>(key: string) => {
    const storage: string | null = localStorage.getItem(key);
    if (!storage) return null;
    try {
        return JSON.parse(storage) as T;
    } catch (e) {
        return null;
    }
};

export const setStorage = <T>(key: string, value: T) => {
    if (!value) return false;
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        return false;
    }
};

export const clearStorage = () => {
    localStorage.clear();
};

//
// CacheTimestamp
//
export const getCacheTimestamp = () => {
    return getStorage<string>(STORAGE_KEYS.CACHE_TIMESTAMP);
};

export const setCacheTimestamp = (timestamp: string) => {
    return setStorage(STORAGE_KEYS.CACHE_TIMESTAMP, timestamp);
};

//
// SchoolData
//
export const getStorageSchool = () => {
    return getStorage<SchoolType>(STORAGE_KEYS.SCHOOL_DATA);
};

export const setStorageSchool = (school: SchoolType) => {
    return setStorage(STORAGE_KEYS.SCHOOL_DATA, school);
};

//
// Teachers
//
export const getStorageTeachers = () => {
    return getStorage<TeacherType[]>(STORAGE_KEYS.TEACHERS_DATA);
};

export const setStorageTeachers = (teachers: TeacherType[]) => {
    return setStorage(STORAGE_KEYS.TEACHERS_DATA, teachers);
};

//
// Subjects
//
export const getStorageSubjects = () => {
    return getStorage<SubjectType[]>(STORAGE_KEYS.SUBJECTS_DATA);
};

export const setStorageSubjects = (subjects: SubjectType[]) => {
    return setStorage(STORAGE_KEYS.SUBJECTS_DATA, subjects);
};

//
// Classes
//
export const getStorageClasses = () => {
    return getStorage<ClassType[]>(STORAGE_KEYS.CLASSES_DATA);
};

export const setStorageClasses = (classes: ClassType[]) => {
    return setStorage(STORAGE_KEYS.CLASSES_DATA, classes);
};

//
// Current logged in Teacher
//
export const getStorageTeacher = () => {
    return getStorage<TeacherType>(STORAGE_KEYS.TEACHER_DATA);
};

export const setStorageTeacher = (teacher: TeacherType) => {
    return setStorage(STORAGE_KEYS.TEACHER_DATA, teacher);
};

