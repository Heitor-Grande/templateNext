"use client";

import { ColunaTabelaDados, TabelaDados } from "@/components/tables/dataTable";
import { useCallback, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import ModalCadastroUsuario from "./components/modalCadastroUsuario";

type UsuarioTabela = {
    id: number;
    nome: string;
    email: string;
    telefone: string | null;
    documento: string | null;
    ativo: boolean;
    criado_em: string;
};

/**
 * Pagina de listagem de usuarios.
 * Use como referencia para telas de cadastro que precisam consumir API e renderizar a TabelaDados.
 */
export default function PaginaUsuarios() {
    const [usuarios, setUsuarios] = useState<UsuarioTabela[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [mensagemErro, setMensagemErro] = useState("");
    const [modalCadastroAberto, setModalCadastroAberto] = useState(false);

    const colunas: ColunaTabelaDados<UsuarioTabela>[] = [
        { chave: "nome", titulo: "Nome" },
        { chave: "email", titulo: "E-mail" },
        {
            chave: "telefone",
            titulo: "Telefone",
            renderizar: (usuario) => usuario.telefone || "-",
        },
        {
            chave: "documento",
            titulo: "Documento",
            renderizar: (usuario) => usuario.documento || "-",
        },
        {
            chave: "ativo",
            titulo: "Status",
            renderizar: (usuario) => (
                <span className={`badge ${usuario.ativo ? "text-bg-success" : "text-bg-secondary"}`}>
                    {usuario.ativo ? "Ativo" : "Inativo"}
                </span>
            ),
        },
    ];

    /**
     * Carrega os usuarios cadastrados na API.
     * Use ao abrir a tela e sempre que a listagem precisar ser atualizada.
     */
    const carregarUsuariosCadastrados = useCallback(async () => {
        setCarregando(true);
        setMensagemErro("");

        try {
            const resposta = await fetch("/api/usuarios", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.message || "Erro ao buscar usuarios.");
            }

            setUsuarios(Array.isArray(dados.usuarios) ? dados.usuarios : []);
            setMensagemErro("");
        } catch {
            setMensagemErro("Nao foi possivel carregar os usuarios.");
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        const carregamentoInicial = window.setTimeout(() => {
            void carregarUsuariosCadastrados();
        }, 0);

        return () => window.clearTimeout(carregamentoInicial);
    }, [carregarUsuariosCadastrados]);

    return (
        <div className="container-fluid">
            <div className="page-header">
                <div>
                    <h1 className="h3 fw-bold mb-1">Usuarios</h1>
                    <p className="text-muted mb-0">
                        Consulte os usuarios cadastrados na aplicacao.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setModalCadastroAberto(true)}
                >
                    <FaPlus className="me-2" />
                    Novo usuario
                </button>
            </div>

            {mensagemErro && (
                <div className="alert alert-danger" role="alert">
                    {mensagemErro}
                </div>
            )}

            <TabelaDados
                colunas={colunas}
                dados={usuarios}
                carregando={carregando}
                mensagemSemDados="Nenhum usuario cadastrado."
            />

            <ModalCadastroUsuario
                aberto={modalCadastroAberto}
                aoFechar={() => {
                    setModalCadastroAberto(false);
                    carregarUsuariosCadastrados();
                }}
            />
        </div>
    );
}
