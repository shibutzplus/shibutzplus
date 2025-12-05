import {
    BorderRadiusInput,
    BorderSecondary,
    BoxShadowPrimary,
    DarkBorderColor,
    ErrorColor,
    FontSize,
    InputBackgroundColor,
    InputColor,
    InputColorHover,
    InputHeight,
    PlaceholderColor,
    SelectBackgroundColor,
    SelectBackgroundColorHover,
} from "./root";

export const customStyles = (
    error: any,
    hasBorder: boolean,
    hasArrow: boolean = true,
    backgroundColor: string,
    color: string = InputColor,
    placeholderColor: string = PlaceholderColor,
    colorHover: string = InputColorHover,
) => {
    return {
        control: (provided: any) => ({
            ...provided,
            width: "100%",
            minHeight: InputHeight,
            borderWidth: hasBorder ? "1px" : "0px",
            borderColor: DarkBorderColor,
            boxShadow: "none",
            fontSize: FontSize,
            backgroundColor: backgroundColor,
            color: color,
            transition: "all 0.2s ease",
            fontWeight: "normal",
            cursor: "pointer",
            "&:hover": {
                borderColor: error ? ErrorColor : DarkBorderColor,
            },
        }),
        menuPlacement: "auto",
        menuPosition: "absolute",
        menu: (provided: any) => ({
            ...provided,
            zIndex: 9999,
            borderRadius: BorderRadiusInput,
            boxShadow: BoxShadowPrimary,
            border: BorderSecondary,
        }),
        menuPortal: (provided: any) => ({
            ...provided,
            zIndex: 9999,
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? SelectBackgroundColor
                : state.isFocused
                  ? SelectBackgroundColorHover
                  : InputBackgroundColor,
            color: state.isSelected ? InputBackgroundColor : InputColor,
            padding: "10px 12px",
            fontSize: FontSize,
            cursor: "pointer",
            "&:hover": {
                backgroundColor: state.isSelected
                    ? SelectBackgroundColor
                    : SelectBackgroundColorHover,
            },
        }),
        placeholder: (provided: any) => ({
            ...provided,
            color: placeholderColor,
            fontSize: FontSize,
        }),
        singleValue: (provided: any) => ({
            ...provided,
            color: color,
            fontSize: FontSize,
        }),
        input: (provided: any) => ({
            ...provided,
            fontSize: FontSize,
            color: color,
        }),
        valueContainer: (provided: any) => ({
            ...provided,
            padding: "2px 8px", /// "0px 0px"
        }),
        indicatorSeparator: (provided: any) => ({
            ...provided,
            display: "none",
        }),
        dropdownIndicator: (provided: any) => ({
            ...provided,
            color: color,
            padding: "8px", /// "0 4px"
            "&:hover": {
                color: colorHover,
            },
            display: hasArrow ? "block" : "none",
        }),
        clearIndicator: (provided: any) => ({
            ...provided,
            color: color,
            padding: "8px",
            "&:hover": {
                color: colorHover,
            },
        }),
        noOptionsMessage: (provided: any) => ({
            ...provided,
            color: PlaceholderColor,
            fontSize: FontSize,
        }),
    };
};
