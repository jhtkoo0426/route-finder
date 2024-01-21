import React from "react";
import Select from "react-select";



// React-select component styling
const CUSTOM_STYLES = {
    control: (provided, state) => ({
        ...provided,
        border: "1px solid #ccc",
        borderRadius: "4px",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(0, 123, 255, 0.6)" : null,
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? "#007bff" : null,
        color: state.isSelected ? "white" : "black",
    }),
};



// Custom select dropdown component using the React-select library:
// https://github.com/jedwatson/react-select
class SearchableDropdown extends React.Component {
    render() {
        const { options, onChange, placeholder } = this.props;

        return (
            <Select
                options={options.map((optionValue) => ({
                    value: optionValue,
                    label: optionValue,
                }))}
                onChange={onChange}
                placeholder={placeholder}
                isSearchable
                styles={CUSTOM_STYLES}
            />
        );
    }
}

export default SearchableDropdown;
