"use client";

import { Button as RBButton } from "react-bootstrap";
import { ReactNode } from "react";

type ButtonProps = {
    size: "sm" | "lg"
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    disabled: boolean;
    loading: boolean;
    variant: string;
    type: "button" | "submit" | "reset";
    className: string;
};

export function Button({
    size,
    label,
    icon,
    onClick,
    disabled,
    loading,
    variant,
    type,
    className,
}: ButtonProps) {
    return (
        <RBButton
            size={size}
            variant={variant}
            onClick={onClick}
            disabled={disabled || loading}
            type={type}
            className={`d-flex align-items-center justify-content-center gap-2 ${className}`}
        >
            {icon && <span>{icon}</span>}
            {label && <span>{label}</span>}
        </RBButton>
    );
}