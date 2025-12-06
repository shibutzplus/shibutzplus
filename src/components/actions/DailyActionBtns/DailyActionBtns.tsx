import React from "react";
import ActionBtn from "@/components/ui/buttons/ActionBtn/ActionBtn";
import { ColumnTypeValues } from "@/models/types/dailySchedule";
import Icons from "@/style/icons";
import { EventColor, ExistingTeacherColor, MissingTeacherColor } from "@/style/root";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { PositionSide } from "@/models/types/ui";

type DailyActionBtnsProps = {
    position: PositionSide;
};

const DailyActionBtns: React.FC<DailyActionBtnsProps> = ({ position }) => {
    const { addNewEmptyColumn, isLoading } = useDailyTableContext();

    const setStyleSide = (typeColor: string) => {
        switch (position) {
            case "left":
                return { borderLeft: `10px solid ${typeColor}` };
            case "right":
                return { borderRight: `10px solid ${typeColor}` };
            case "top":
                return { borderTop: `10px solid ${typeColor}` };
            case "bottom":
                return { borderBottom: `10px solid ${typeColor}` };
            default:
                return {};
        }
    };

    return (
        <>
            <ActionBtn
                type={ColumnTypeValues.missingTeacher}
                Icon={<Icons.addTeacher size={16} />}
                label="שיבוץ למורה חסר"
                isDisabled={isLoading}
                style={setStyleSide(MissingTeacherColor)}
                func={() => addNewEmptyColumn(ColumnTypeValues.missingTeacher)}
            />
            <ActionBtn
                type={ColumnTypeValues.existingTeacher}
                Icon={<Icons.addTeacher size={16} />}
                label="שיבוץ למורה נוכח"
                isDisabled={isLoading}
                style={setStyleSide(ExistingTeacherColor)}
                func={() => addNewEmptyColumn(ColumnTypeValues.existingTeacher)}
            />
            <ActionBtn
                type={ColumnTypeValues.event}
                Icon={<Icons.event size={16} />}
                label="שיבוץ ארוע"
                isDisabled={isLoading}
                style={setStyleSide(EventColor)}
                func={() => addNewEmptyColumn(ColumnTypeValues.event)}
            />
        </>
    );
};

export default DailyActionBtns;
