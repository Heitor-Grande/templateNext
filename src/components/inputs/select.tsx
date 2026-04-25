"use client";

import ReactSelect from "react-select";

interface Option {
    label: string;
    value: string;
};

interface SelectProps {
    id: string;
    label: string;
    options: Option[];
    value: Option | null;
    onChange: (option: Option | null) => void;
    placeholder: string;
    isDisabled: boolean;
    isClearable: boolean;
    className: string;
};

export function Select({
    id,
    label,
    options,
    value,
    onChange,
    placeholder,
    isDisabled,
    isClearable,
    className
}: SelectProps) {
    return (
        <div className={`form-group ${className}`}>
            {label && <label htmlFor={id}>{label}</label>}

            <ReactSelect
                inputId={id}
                options={options}
                value={value}
                onChange={(selected) => onChange?.(selected as Option | null)}
                placeholder={placeholder}
                isDisabled={isDisabled}
                isClearable={isClearable}
            />
        </div>
    );
}