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
    FaSignOutAlt,
    FaTimes,
    FaUserCircle,
    FaUserShield,
    FaUsers,
} from "react-icons/fa";

type MenuItem = {
    label: string;
    href?: string;
    icon: ReactNode;
    children?: MenuItem[];
};

type RecursoPermissao = "usuario" | "configuracao" | "perfil";
type AcaoPermissao = "visualizar" | "criar" | "atualizar" | "deletar";
type PermissoesPerfil = Record<RecursoPermissao, Record<AcaoPermissao, boolean>>;

type DadosVerificacaoSideBar = {
    acessoPermitido: boolean;
    fantasiaEmpresa: string;
    permissoes: PermissoesPerfil | null;
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
    const [carregandoLogout, setCarregandoLogout] = useState(false);
    const [fantasiaEmpresa, setFantasiaEmpresa] = useState("Template");
    const [permissoesPerfil, setPermissoesPerfil] = useState<PermissoesPerfil | null>(null);

    const versaoApp = "1.0.0";
    const iniciaisEmpresa = fantasiaEmpresa.trim().slice(0, 2).toUpperCase() || "TP";
    const podeVisualizarUsuario = Boolean(permissoesPerfil?.usuario.visualizar);
    const podeVisualizarPerfil = Boolean(permissoesPerfil?.perfil.visualizar);
    const podeVisualizarConfiguracao = Boolean(permissoesPerfil?.configuracao.visualizar);

    const menusUsuario: MenuItem[] = [
        ...(podeVisualizarUsuario
            ? [{ label: "Lista de Usuários", href: "/usuarios", icon: <FaList /> }]
            : []),
        ...(podeVisualizarPerfil
            ? [{ label: "Perfis", href: "/usuarios/perfil", icon: <FaUserShield /> }]
            : []),
    ];

    const menus: MenuItem[] = [
        { label: "Dashboard", href: "/menuPrincipal", icon: <FaHome /> },
        ...(menusUsuario.length > 0
            ? [{
                label: "Usuários",
                icon: <FaUsers />,
                children: menusUsuario,
            }]
            : []),
        ...(podeVisualizarConfiguracao
            ? [{ label: "Configurações", href: "/configuracoes", icon: <FaCog /> }]
            : []),
    ];

    function abrirBarraLateral() {
        setAberta(true);
    }

    function fecharBarraLateral() {
        setAberta(false);
    }

    /**
     * Encerra a sessão no servidor e redireciona o usuário para a tela inicial.
     */
    async function realizarLogoffUsuario() {
        setCarregandoLogout(true);

        try {
            await requisitarAPI("/api/auth/logout", {
                method: "POST",
            });
        } finally {
            window.location.assign("/");
        }
    }

    /**
     * Confirma se o usuário logado ainda pode acessar a área interna e carrega permissões do perfil.
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
                return;
            }

            if (dados.fantasiaEmpresa) {
                setFantasiaEmpresa(dados.fantasiaEmpresa);
            }

            setPermissoesPerfil(dados.permissoes);
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

                <span className="sidebar-topbar-brand">{fantasiaEmpresa}</span>
            </nav>

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

            <aside className={`sidebar-shell ${aberta ? "open" : ""}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <span className="sidebar-brand-mark">{iniciaisEmpresa}</span>
                        <div>
                            <strong>{fantasiaEmpresa}</strong>
                            <small className="text-center">Desenvolvido por Grande, Soluções Digitais.</small>
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
                    <Botao
                        size="sm"
                        label="Minha conta"
                        icon={<span className="sidebar-link-icon"><FaUserCircle /></span>}
                        type="button"
                        variant="link"
                        className="sidebar-link sidebar-link-button"
                        onClick={() => {
                            fecharBarraLateral();
                            window.location.assign("/minhaConta");
                        }}
                        disabled={carregandoLogout}
                        loading={false}
                    />

                    <Botao
                        size="sm"
                        label="Sair"
                        icon={<span className="sidebar-link-icon"><FaSignOutAlt /></span>}
                        type="button"
                        variant="link"
                        className="sidebar-link sidebar-link-button"
                        onClick={realizarLogoffUsuario}
                        disabled={carregandoLogout}
                        loading={false}
                    />

                    <div className="sidebar-footer-version">
                        <span>Versão</span>
                        <strong>v{versaoApp}</strong>
                    </div>
                </div>
            </aside>

            <ModalCarregamento
                show={carregandoVerificacao || carregandoLogout}
                text={carregandoLogout ? "Encerrando sessão..." : "Verificando acesso..."}
            />
        </>
    );
}
