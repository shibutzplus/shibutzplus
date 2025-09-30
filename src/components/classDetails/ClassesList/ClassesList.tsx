"use client";

import React from "react";
import { ClassType } from "@/models/types/classes";
import { useMainContext } from "@/context/MainContext";
import useSubmit from "@/hooks/useSubmit";
import useDeletePopup from "@/hooks/useDeletePopup";
import { PopupAction } from "@/context/PopupContext";
import { sortByHebrewName } from "@/utils/sort";
import messages from "@/resources/messages";
import TableList from "../../ui/list/TableList/TableList";
import AddClassRow from "../AddClassRow/AddClassRow";
import ClassRow from "../ClassRow/ClassRow";
import EmptyTable from "@/components/ui/table/EmptyTable/EmptyTable";
import ListRowLoading from "@/components/layout/loading/ListRowLoading/ListRowLoading";

const ClassesList: React.FC = () => {
    const { classes, deleteClass, school } = useMainContext();
    const { handleOpenPopup } = useDeletePopup();

    const { handleSubmitDelete, isLoading } = useSubmit(
        () => { },
        messages.classes.deleteSuccess,
        messages.classes.deleteError,
        messages.classes.invalid,
    );

    const handleDeleteClassFromState = async (classId: string) => {
        if (!school?.id) return;
        await handleSubmitDelete(school.id, classId, deleteClass);
    };

    const handleDeleteClass = (classItem: ClassType) => {
        handleOpenPopup(
            PopupAction.deleteClass,
            `האם אתה בטוח שברצונך למחוק את הכיתה ${classItem.name}`,
            () => handleDeleteClassFromState(classItem.id),
        );
    };

    const sortedClasses = React.useMemo(
        () => (classes !== undefined ? sortByHebrewName(classes) : undefined),
        [classes],
    );

    return (
        <TableList headThs={["שם הכיתה", "פעולות"]}>
            <tbody>
                <AddClassRow />
                {classes === undefined ? (
                    <ListRowLoading />
                ) : sortedClasses?.length === 0 ? (
                    <EmptyTable text="עדיין לא נוספו כיתות לרשימה" />
                ) : (
                    sortedClasses?.map((classItem) => (
                        <ClassRow
                            key={classItem.id}
                            classItem={classItem}
                            handleDeleteClass={handleDeleteClass}
                        />
                    ))
                )}
            </tbody>
        </TableList>
    );
};

export default ClassesList;
