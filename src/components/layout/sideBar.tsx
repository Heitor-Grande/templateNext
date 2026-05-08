"use client";

import { Botao } from "@/components/inputs/button";
import { ModalCarregamento } from "@/components/modals/loading";
import { requisitarAPI } from "@/utils/api";
import { Nav } from "react-bootstrap";
import Link from "next/link";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
    FaBars,
    FaChevronDown,
    FaChevronRight,
    FaCog,
    FaHome,
    FaList,
    FaTimes,
    FaUserCircle,
    FaUsers,
} from "react-icons/fa";

type MenuItem = {
    label: string;
    href?: string;
    icon: ReactNode;
    children?: MenuItem[];
};

type DadosVerificacaoSideBar = {
    acessoPermitido: boolean;
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
            <Botao
                size="sm"
                label={item.label}
                icon={<span className="sidebar-link-icon">{item.icon}</span>}
                iconRight={aberto ? <FaChevronDown /> : <FaChevronRight />}
                type="button"
                variant="link"
                className={`sidebar-link sidebar-link-button ${aberto ? "active" : ""}`}
                onClick={() => setAberto(!aberto)}
                disabled={false}
                loading={false}
            />

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
 * Use como base de navegação lateral em aplicações internas com menus simples ou agrupados.
 */
export default function BarraLateral() {
    const [aberta, setAberta] = useState(false);
    const [carregandoVerificacao, setCarregandoVerificacao] = useState(false);

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
        { label: "Configurações", href: "/configuracoes", icon: <FaCog /> },
    ];

    function abrirBarraLateral() {
        setAberta(true);
    }

    function fecharBarraLateral() {
        setAberta(false);
    }

    /**
     * Confirma se o usuário logado ainda pode acessar a área interna.
     * Use ao carregar a sidebar para refletir mudanças de status do usuário ou da aplicação.
     */
    const verificarAcessoAreaInterna = useCallback(async () => {
        setCarregandoVerificacao(true);

        try {
            const resposta = await requisitarAPI("/api/sideBar", {
                method: "GET",
            });

            const dados = resposta.dados as DadosVerificacaoSideBar | null;

            if (!dados?.acessoPermitido) {
                window.location.assign("/");
            }
        } catch {
            window.location.assign("/");
        } finally {
            setCarregandoVerificacao(false);
        }
    }, []);

    useEffect(() => {
        const verificacaoInicial = window.setTimeout(() => {
            void verificarAcessoAreaInterna();
        }, 0);

        return () => window.clearTimeout(verificacaoInicial);
    }, [verificarAcessoAreaInterna]);

    return (
        <>
            {/* Barra superior mobile para abrir a navegacao lateral. */}
            <nav className="sidebar-topbar">
                <Botao
                    size="sm"
                    icon={<FaBars />}
                    type="button"
                    variant="link"
                    className="sidebar-icon-button"
                    onClick={abrirBarraLateral}
                    disabled={false}
                    loading={false}
                    ariaLabel="Abrir menu"
                />

                <span className="sidebar-topbar-brand">Template</span>
            </nav>

            {/* Camada de fundo para fechar o menu ao clicar fora no mobile. */}
            {aberta && (
                <Botao
                    size="sm"
                    type="button"
                    variant="link"
                    className="sidebar-overlay"
                    onClick={fecharBarraLateral}
                    disabled={false}
                    loading={false}
                    ariaLabel="Fechar menu"
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

                    <Botao
                        size="sm"
                        icon={<FaTimes />}
                        type="button"
                        variant="link"
                        className="sidebar-icon-button sidebar-close-button"
                        onClick={fecharBarraLateral}
                        disabled={false}
                        loading={false}
                        ariaLabel="Fechar menu"
                    />
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
                    <ItemMenuLateral
                        item={{ label: "Minha conta", href: "/minhaConta", icon: <FaUserCircle /> }}
                        aoNavegar={fecharBarraLateral}
                    />

                    <div className="sidebar-footer-version">
                        <span>Versão</span>
                        <strong>v{versaoApp}</strong>
                    </div>
                </div>
            </aside>

            <ModalCarregamento
                show={carregandoVerificacao}
                text="Verificando acesso..."
            />
        </>
    );
}
