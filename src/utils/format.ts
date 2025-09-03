import { SelectOption } from "@/models/types";
import { TeacherRole, TeacherType } from "@/models/types/teachers";
import routePath from "@/routes";

export const createSelectOptions = <T extends { id: string; name: string }>(
    data: T[] | undefined,
) => {
    if (!data || data.length === 0) return [];
    const options: SelectOption[] = data.map((item) => ({
        value: item.id,
        label: item.name,
    }));
    return options;
};

export const filterTeachersByRole = (teachers: TeacherType[], role: TeacherRole) => {
    return teachers.filter((teacher) => teacher.role === role);
};

export const getPageTitleFromUrl = (pathname: string) => {
    const currentPath = pathname.split("/").filter(Boolean)[0] || "";
    const routeKey = Object.keys(routePath).find(
        (key) =>
            routePath[key].p === `/${currentPath}` ||
            (currentPath === "" && routePath[key].p === "/"),
    );
    if (routeKey) return routePath[routeKey].title;
    return;
};

/**
 * Creates a button text for a new select option
 * @param template - string with placeholder {0} for the input value
 * @param inputValue - the value to insert into the template
 * @returns 
 */
export const createNewSelectOption_btnText = (inputValue: string, template?: string) => {
    return template?.replace('{0}', inputValue) || inputValue;
}
