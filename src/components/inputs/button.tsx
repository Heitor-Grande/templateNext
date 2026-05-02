"use client";

import { Button as BotaoBootstrap } from "react-bootstrap";
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

/**
 * Botao base do template.
 * Use para manter botoes Bootstrap com suporte padrao a icone, loading e estado desabilitado.
 */
export function Botao({
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
        <BotaoBootstrap
            size={size}
            variant={variant}
            onClick={onClick}
            disabled={disabled || loading}
            type={type}
            className={`d-flex align-items-center justify-content-center gap-2 ${className}`}
        >
            {icon && <span>{icon}</span>}
            {label && <span>{label}</span>}
        </BotaoBootstrap>
    );
}
