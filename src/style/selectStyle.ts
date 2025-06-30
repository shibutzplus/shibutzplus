export const customStyles = (
    error: any,
    hasBorder: boolean,
    hasArrow: boolean = true,
    backgroundColor: string = "white",
    noOptionsMsgColor: string = "#aaa",
) => {
    return {
        control: (provided: any, state: any) => ({
            ...provided,
            width: "100%",
            minHeight: "38px",
            borderWidth: hasBorder ? "1px" : "0px",
            borderColor: "#e0e0e0",
            boxShadow: "none",
            fontSize: "16px",
            backgroundColor: backgroundColor,
            color: "#aaa",
            transition: "all 0.2s ease",
            fontWeight: "normal",
            "&:hover": {
                borderColor: error ? "#e53935" : "#ccc",
            },
        }),
        menuPlacement: "auto",
        menuPosition: "absolute",
        menu: (provided: any) => ({
            ...provided,
            zIndex: 9999,
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            border: "1px solid #ccc",
        }),
        menuPortal: (provided: any) => ({
            ...provided,
            zIndex: 9999,
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? "#4a90e2"
                : state.isFocused
                  ? "rgba(74, 144, 226, 0.1)"
                  : "white",
            color: state.isSelected ? "white" : "#333",
            padding: "10px 12px",
            fontSize: "16px",
            "&:hover": {
                backgroundColor: state.isSelected ? "#4a90e2" : "rgba(74, 144, 226, 0.1)",
            },
        }),
        placeholder: (provided: any) => ({
            ...provided,
            color: "#aaa",
            fontSize: "16px",
        }),
        singleValue: (provided: any) => ({
            ...provided,
            color: "#333",
            fontSize: "16px",
        }),
        input: (provided: any) => ({
            ...provided,
            fontSize: "16px",
            color: "#333",
        }),
        valueContainer: (provided: any) => ({
            ...provided,
            padding: "2px 8px",
        }),
        indicatorSeparator: (provided: any) => ({
            ...provided,
            display: "none",
        }),
        dropdownIndicator: (provided: any) => ({
            ...provided,
            color: "#999",
            padding: "8px",
            "&:hover": {
                color: "#333",
            },
            display: hasArrow ? "block" : "none",
        }),
        clearIndicator: (provided: any) => ({
            ...provided,
            color: "#999",
            padding: "8px",
            "&:hover": {
                color: "#333",
            },
        }),
        noOptionsMessage: (provided: any) => ({
            ...provided,
            color: noOptionsMsgColor,
            fontSize: "16px",
        }),
    };
};
