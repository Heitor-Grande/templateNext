"use client";

import { Button as BotaoBootstrap } from "react-bootstrap";
import { ReactNode } from "react";

type ButtonProps = {
    size: "sm" | "lg"
    label?: string;
    icon?: ReactNode;
    iconRight?: ReactNode;
    onClick: () => void;
    disabled: boolean;
    loading: boolean;
    variant: string;
    type: "button" | "submit" | "reset";
    className: string;
    ariaLabel?: string;
};

/**
 * Botao base do template.
 * Use para manter botões Bootstrap com suporte padrão a ícone, loading e estado desabilitado.
 */
export function Botao({
    size,
    label,
    icon,
    iconRight,
    onClick,
    disabled,
    loading,
    variant,
    type,
    className,
    ariaLabel,
}: ButtonProps) {
    return (
        <BotaoBootstrap
            size={size}
            variant={variant}
            onClick={onClick}
            disabled={disabled || loading}
            type={type}
            className={className}
            aria-label={ariaLabel}
        >
            <span className="d-inline-flex align-items-center justify-content-center gap-2 w-100">
                {icon && <span className="d-inline-flex align-items-center">{icon}</span>}
                {label && <span>{label}</span>}
                {iconRight && <span className="d-inline-flex align-items-center ms-auto">{iconRight}</span>}
            </span>
        </BotaoBootstrap>
    );
}
