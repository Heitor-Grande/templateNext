"use client";

import { ChangeEvent } from "react";

interface InputProps {
    id: string;
    label: string;
    type: string;
    value: string;
    placeholder: string;
    onChange: (value: ChangeEvent<HTMLInputElement, HTMLInputElement>) => void;
    disabled: boolean;
    required: boolean;
    className: string;
    helpText?: string;
    classNameHelpText?: "form-text text-muted" | "form-text text-danger"
};

export function Input({
    id,
    label,
    type,
    value,
    placeholder,
    onChange,
    disabled,
    required,
    className,
    helpText,
    classNameHelpText
}: InputProps) {
    return (
        <div className={`form-group ${className}`}>

            <label htmlFor={id}>
                {label}
            </label>

            <input
                type={type}
                className="form-control"
                id={id}
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                required={required}
                onChange={(e) => onChange(e)}
            />

            {
                helpText && (
                    <small className={classNameHelpText}>
                        {helpText}
                    </small>
                )
            }
        </div>
    );
}