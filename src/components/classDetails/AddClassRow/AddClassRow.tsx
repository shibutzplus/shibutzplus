import React from "react";
import { useMainContext } from "@/context/MainContext";
import messages from "@/resources/messages";
import { classSchema } from "@/models/validation/class";
import AddListRow from "@/components/ui/list/AddListRow/AddListRow";

const AddClassRow: React.FC = () => {
    const { school, addNewClass } = useMainContext();
    return (
        <AddListRow
            schema={classSchema}
            addFunction={(values) =>
                addNewClass({
                    ...values,
                    schoolId: school?.id || "",
                })
            }
            field={{
                key: "name",
                placeholder: "לדוגמה: כיתה א1",
            }}
            initialValues={{ name: "" }}
            errorMessages={{ name: messages.classes.createError }}
            buttonLabel="הוספה"
        />
    );
};

export default AddClassRow;
