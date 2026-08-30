import React from "react";
import { useMainContext } from "@/context/MainContext";
import { ClassType } from "@/models/types/classes";
import { classSchema } from "@/models/validation/class";
import ListRow from "@/components/ui/list/ListRow/ListRow";
import useConfirmPopup from "@/hooks/useConfirmPopup";
import useSubmit from "@/hooks/useSubmit";
import messages from "@/resources/messages";
import { PopupAction } from "@/context/PopupContext";
import DeleteWarningContent from "@/components/popups/DeleteWarningContent/DeleteWarningContent";
import { countClassUsage } from "@/utils/entityUsage";

type ClassRowProps = {
    classItem: ClassType;
};

const ClassRow: React.FC<ClassRowProps> = ({ classItem }) => {
    const { updateClass, school, deleteClass, annualScheduleTable } = useMainContext();
    const { handleOpenPopup } = useConfirmPopup();

    const { handleSubmitDelete } = useSubmit(
        () => { },
        classItem.activity
            ? messages.classes.deleteGroupSuccess
            : messages.classes.deleteClassSuccess,
        messages.classes.deleteError,
        messages.classes.invalid,
    );

    const handleDeleteClassFromState = async (classId: string, force: boolean = false) => {
        if (!school?.id) return;
        await handleSubmitDelete(school.id, classId, deleteClass, force);
    };

    const handleDeleteClass = (classItem: ClassType) => {
        const entityName = classItem.activity ? "קבוצת העבודה" : "הכיתה";
        const usageCount = countClassUsage(classItem.id, annualScheduleTable);

        if (usageCount > 0) {
            handleOpenPopup(
                PopupAction.deleteClass,
                <DeleteWarningContent
                    title={`האם למחוק את ${entityName} "${classItem.name}"?`}
                    warningText={`${entityName} משובצת ב-${usageCount} שיעורים במערכת השנתית.`}
                    usageCount={usageCount}
                />,
                () => handleDeleteClassFromState(classItem.id, true),
                "מחק בכל זאת",
                "ביטול",
                "no",
            );
        } else {
            handleOpenPopup(
                PopupAction.deleteClass,
                `האם למחוק את ${entityName} ${classItem.name}?`,
                () => handleDeleteClassFromState(classItem.id, false),
            );
        }
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
