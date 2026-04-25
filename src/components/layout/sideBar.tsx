"use client";

import { Nav } from "react-bootstrap";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

type MenuItem = {
    label: string;
    href?: string;
    children?: MenuItem[];
};

function MenuItemComponent({ item }: { item: MenuItem }) {
    const [open, setOpen] = useState(false);
    const [hover, setHover] = useState(false);
    const pathname = usePathname();

    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.href && pathname === item.href;

    const background = isActive || hover ? "#495057" : "transparent";

    if (!hasChildren) {
        return (
            <Nav.Item>
                <Link
                    href={item.href || "#"}
                    className="nav-link text-white"
                    style={{
                        backgroundColor: background,
                        borderRadius: "6px",
                        transition: "all 0.2s ease",
                    }}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                >
                    {item.label}
                </Link>
            </Nav.Item>
        );
    }

    return (
        <div>
            <div
                className="nav-link text-white d-flex justify-content-between align-items-center"
                style={{
                    cursor: "pointer",
                    backgroundColor: background,
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                }}
                onClick={() => setOpen(!open)}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                {item.label}
                <span>{open ? "▲" : "▼"}</span>
            </div>

            {open && (
                <Nav className="flex-column ms-3">
                    {item.children!.map((child, index) => (
                        <MenuItemComponent key={index} item={child} />
                    ))}
                </Nav>
            )}
        </div>
    );
}

export default function Sidebar() {
    const [open, setOpen] = useState(false);

    const versaoApp = "1.0.0";

    const menus: MenuItem[] = [
        { label: "Dashboard", href: "/" },
        {
            label: "Usuários",
            children: [
                { label: "Listar", href: "/usuarios" },
                { label: "Cadastrar", href: "/usuarios/novo" },
            ],
        },
        { label: "Configurações", href: "/configuracoes" },
    ];

    return (
        <>
            {/* NAVBAR */}
            <nav className="navbar navbar-dark bg-dark fixed-top px-3">
                <button
                    className="btn btn-dark"
                    onClick={() => setOpen(true)}
                >
                    ☰
                </button>
            </nav>

            {/* OVERLAY */}
            {open && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
                    style={{ opacity: 0.5, zIndex: 1040 }}
                    onClick={() => setOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <div
                className="d-flex flex-column bg-dark text-white p-3 vh-100 position-fixed"
                style={{
                    width: "250px",
                    zIndex: 1050,
                    top: 0,
                    transform: open ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.3s ease",
                }}
            >
                {/* Espaço pra navbar */}
                <div style={{ height: "56px" }} />

                <h5 className="mb-4 text-center">Template</h5>

                <Nav className="flex-column gap-1">
                    {menus.map((item, index) => (
                        <MenuItemComponent key={index} item={item} />
                    ))}
                </Nav>

                <div className="mt-auto pt-3 border-top border-secondary">
                    <small>v{versaoApp}</small>
                </div>
            </div>
        </>
    );
}