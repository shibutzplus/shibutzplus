import React from "react";
import style from "./TableHeader.module.css";
import { CellType } from "@/models/types/table";

type TableHeaderProps = {
    type: CellType;
};

const TableHeader: React.FC<TableHeaderProps> = ({ type }) => {
    switch (type) {
        case "text":
            return <div style={{ textAlign: "center" }}>מידע</div>;
        case "select":
            return (
                <select>
                    <option>אפשרות A</option>
                    <option>אפשרות B</option>
                </select>
            );
        case "split":
            return <div style={{ textAlign: "center" }}>מידע</div>;
        default:
            return null;
    }
};

export default TableHeader;
