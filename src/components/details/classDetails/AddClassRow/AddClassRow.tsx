import React from "react";
import { useMainContext } from "@/context/MainContext";
import messages from "@/resources/messages";
import { classSchema } from "@/models/validation/class";
import AddListRow from "@/components/ui/list/AddListRow/AddListRow";

type AddClassRowProps = {
    onSearch?: (value: string) => void;
};

const AddClassRow: React.FC<AddClassRowProps> = ({ onSearch }) => {
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
                placeholder: "לדוגמה: יא 2",
            }}
            initialValues={{ name: "" }}
            errorMessages={{ name: messages.classes.createError }}
            buttonLabel="הוספה"
            onInputChange={onSearch}
        />
    );
};

export default AddClassRow;
