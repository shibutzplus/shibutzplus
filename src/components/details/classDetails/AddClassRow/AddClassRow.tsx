import React from "react";
import { useMainContext } from "@/context/MainContext";
import messages from "@/resources/messages";
import { classSchema } from "@/models/validation/class";
import AddListRow from "@/components/ui/list/AddListRow/AddListRow";

type AddClassRowProps = {
    onSearch?: (value: string) => void;
    isGroup?: boolean;
};

const AddClassRow: React.FC<AddClassRowProps> = ({ onSearch, isGroup }) => {
    const { school, addNewClass } = useMainContext();

    return (
        <AddListRow
            schema={classSchema}
            addFunction={(values) =>
                addNewClass({
                    ...values,
                    activity: isGroup,
                    schoolId: school?.id || "",
                })
            }
            field={{
                key: "name",
                placeholder: isGroup ? "לדוגמה: פרטני או שהייה" : "לדוגמה: כיתה א1",
                maxLength: 20,
            }}
            initialValues={{ name: "" }}
            errorMessages={{ name: messages.classes.createError }}
            buttonLabel="הוספה"
            onInputChange={onSearch}
        />
    );
};

export default AddClassRow;
