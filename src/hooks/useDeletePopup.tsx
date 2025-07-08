import { PopupType, usePopup } from "@/context/PopupContext";
import DeletePopup from "@/components/popups/DeletePopup/DeletePopup";

const useDeletePopup = () => {
    const { openPopup, closePopup } = usePopup();

    const handleOpenPopup = (
        type: PopupType,
        text: string,
        onDeleteAction: () => Promise<void>,
    ) => {
        openPopup(
            type,
            "S",
            <DeletePopup text={text} onDelete={onDeleteAction} onCancel={closePopup} />,
        );
    };

    return {
        handleOpenPopup,
    };
};

export default useDeletePopup;
