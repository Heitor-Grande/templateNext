"use client";

import { Nav } from "react-bootstrap";
import Link from "next/link";
import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import {
    FaBars,
    FaChevronDown,
    FaChevronRight,
    FaCog,
    FaHome,
    FaList,
    FaTimes,
    FaUsers,
} from "react-icons/fa";

type MenuItem = {
    label: string;
    href?: string;
    icon: ReactNode;
    children?: MenuItem[];
};

/**
 * Item recursivo do menu lateral.
 * Use internamente na BarraLateral para renderizar links simples e grupos com filhos.
 */
function ItemMenuLateral({
    item,
    aoNavegar,
}: {
    item: MenuItem;
    aoNavegar: () => void;
}) {
    const [aberto, setAberto] = useState(false);
    const pathname = usePathname();

    const possuiFilhos = item.children && item.children.length > 0;
    const estaAtivo = item.href && pathname === item.href;

    if (!possuiFilhos) {
        return (
            <Nav.Item>
                <Link
                    href={item.href || "#"}
                    className={`sidebar-link ${estaAtivo ? "active" : ""}`}
                    onClick={aoNavegar}
                >
                    <span className="sidebar-link-icon">{item.icon}</span>
                    <span>{item.label}</span>
                </Link>
            </Nav.Item>
        );
    }

    return (
        <div className="sidebar-group">
            <button
                type="button"
                className={`sidebar-link sidebar-link-button ${aberto ? "active" : ""}`}
                onClick={() => setAberto(!aberto)}
            >
                <span className="sidebar-link-icon">{item.icon}</span>
                <span className="flex-grow-1 text-start">{item.label}</span>
                {aberto ? <FaChevronDown /> : <FaChevronRight />}
            </button>

            {aberto && (
                <Nav className="sidebar-submenu">
                    {item.children!.map((child) => (
                        <ItemMenuLateral
                            key={`${item.label}-${child.label}`}
                            item={child}
                            aoNavegar={aoNavegar}
                        />
                    ))}
                </Nav>
            )}
        </div>
    );
}

/**
 * Barra lateral responsiva do template.
 * Use como base de navegacao lateral em aplicacoes internas com menus simples ou agrupados.
 */
export default function BarraLateral() {
    const [aberta, setAberta] = useState(false);

    const versaoApp = "1.0.0";

    const menus: MenuItem[] = [
        { label: "Dashboard", href: "/menuPrincipal", icon: <FaHome /> },
        {
            label: "Usuarios",
            icon: <FaUsers />,
            children: [
                { label: "Listar", href: "/usuarios", icon: <FaList /> },
            ],
        },
        { label: "Configuracoes", href: "/configuracoes", icon: <FaCog /> },
    ];

    function abrirBarraLateral() {
        setAberta(true);
    }

    function fecharBarraLateral() {
        setAberta(false);
    }

    return (
        <>
            {/* Barra superior mobile para abrir a navegacao lateral. */}
            <nav className="sidebar-topbar">
                <button
                    type="button"
                    className="sidebar-icon-button"
                    onClick={abrirBarraLateral}
                    aria-label="Abrir menu"
                >
                    <FaBars />
                </button>

                <span className="sidebar-topbar-brand">Template</span>
            </nav>

            {/* Camada de fundo para fechar o menu ao clicar fora no mobile. */}
            {aberta && (
                <button
                    type="button"
                    className="sidebar-overlay"
                    onClick={fecharBarraLateral}
                    aria-label="Fechar menu"
                />
            )}

            {/* Navegacao lateral fixa no desktop e drawer no mobile. */}
            <aside className={`sidebar-shell ${aberta ? "open" : ""}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <span className="sidebar-brand-mark">T</span>
                        <div>
                            <strong>Template</strong>
                            <small>Base App</small>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="sidebar-icon-button sidebar-close-button"
                        onClick={fecharBarraLateral}
                        aria-label="Fechar menu"
                    >
                        <FaTimes />
                    </button>
                </div>

                <Nav className="sidebar-nav">
                    {menus.map((item) => (
                        <ItemMenuLateral
                            key={item.label}
                            item={item}
                            aoNavegar={fecharBarraLateral}
                        />
                    ))}
                </Nav>

                <div className="sidebar-footer">
                    <span>Versao</span>
                    <strong>v{versaoApp}</strong>
                </div>
            </aside>
        </>
    );
}
