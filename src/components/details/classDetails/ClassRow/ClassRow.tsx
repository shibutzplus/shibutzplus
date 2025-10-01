import React from "react";
import { useMainContext } from "@/context/MainContext";
import { ClassType } from "@/models/types/classes";
import { classSchema } from "@/models/validation/class";
import ListRow from "@/components/ui/list/ListRow/ListRow";

type ClassRowProps = {
    classItem: ClassType;
    handleDeleteClass: (classItem: ClassType) => void;
};

const ClassRow: React.FC<ClassRowProps> = ({ classItem, handleDeleteClass }) => {
    const { updateClass } = useMainContext();
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
