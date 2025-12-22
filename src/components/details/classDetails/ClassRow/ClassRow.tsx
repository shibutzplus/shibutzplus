import React from "react";
import { useMainContext } from "@/context/MainContext";
import { ClassType } from "@/models/types/classes";
import { classSchema } from "@/models/validation/class";
import ListRow from "@/components/ui/list/ListRow/ListRow";
import useDeletePopup from "@/hooks/useDeletePopup";
import useSubmit from "@/hooks/useSubmit";
import messages from "@/resources/messages";
import { PopupAction } from "@/context/PopupContext";

type ClassRowProps = {
    classItem: ClassType;
};

const ClassRow: React.FC<ClassRowProps> = ({ classItem }) => {
    const { updateClass, school, deleteClass } = useMainContext();
    const { handleOpenPopup } = useDeletePopup();

    const { handleSubmitDelete } = useSubmit(
        () => { },
        classItem.activity
            ? messages.classes.deleteGroupSuccess
            : messages.classes.deleteClassSuccess,
        messages.classes.deleteError,
        messages.classes.invalid,
    );

    const handleDeleteClassFromState = async (classId: string) => {
        if (!school?.id) return;
        await handleSubmitDelete(school.id, classId, deleteClass);
    };

    const handleDeleteClass = (classItem: ClassType) => {
        const entityName = classItem.activity ? "הקבוצה" : "הכיתה";
        handleOpenPopup(
            PopupAction.deleteClass,
            `האם אתה בטוח שברצונך למחוק את ${entityName} ${classItem.name}`,
            () => handleDeleteClassFromState(classItem.id),
        );
    };

    return (
        <ListRow
            item={classItem}
            schema={classSchema}
            onUpdate={(id, data) =>
                updateClass(id, {
                    name: (data.name ?? classItem.name) as string,
                    schoolId: classItem.schoolId,
                })
            }
            onDelete={handleDeleteClass}
            field={{ key: "name", placeholder: "לדוגמה: כיתה א1" }}
            getId={(c) => c.id}
            getInitialValue={(c) => c.name}
            updateExtraFields={() => ({ schoolId: classItem.schoolId })}
        />
    );
};

export default ClassRow;
