"use client";

import { Botao } from "@/components/inputs/button";
import ModalResposta from "@/components/modals/responseModal";
import { ColunaTabelaDados, TabelaDados } from "@/components/tables/dataTable";
import { requisitarAPI } from "@/utils/api";
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
 * Página de listagem de usuários.
 * Use como referência para telas de cadastro que precisam consumir API e renderizar a TabelaDados.
 */
export default function PaginaUsuarios() {
    const [usuarios, setUsuarios] = useState<UsuarioTabela[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [mensagemResposta, setMensagemResposta] = useState("");
    const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
    const [idUsuarioSelecionado, setIdUsuarioSelecionado] = useState<number | null>(null);

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
     * Carrega os usuários cadastrados na API.
     * Use ao abrir a tela e sempre que a listagem precisar ser atualizada.
     */
    const carregarUsuariosCadastrados = useCallback(async () => {
        setCarregando(true);
        setMensagemResposta("");

        try {
            const resposta = await requisitarAPI("/api/usuarios", {
                method: "GET",
            });

            setUsuarios(Array.isArray(resposta.dados) ? resposta.dados : []);
            setMensagemResposta("");
        } catch (erro) {
            const mensagemErro = erro instanceof Error
                ? erro.message
                : "Não foi possível carregar os usuários.";

            setMensagemResposta(mensagemErro);
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

    /**
     * Abre o modal com os dados do usuário selecionado na tabela.
     */
    function abrirCadastroUsuarioSelecionado(idUsuario: string | number | null) {
        const idNormalizado = Number(idUsuario);

        if (!Number.isInteger(idNormalizado) || idNormalizado <= 0) {
            setMensagemResposta("Não foi possível identificar o usuário selecionado.");
            return;
        }

        setIdUsuarioSelecionado(idNormalizado);
        setModalCadastroAberto(true);
    }

    return (
        <div className="container-fluid">
            <div className="page-header">
                <div className="card w-100">
                    <div className="card-header">
                        <h4 className="mb-1">Usuários</h4>
                    </div>
                    <div className="card-body">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-10 col-md-3 col-sm">
                                    <p className="text-muted mb-0">
                                        Consulte os usuários cadastrados na aplicação.
                                    </p>
                                </div>
                                <div className="col-lg-2 col-md-3 col-sm">
                                    <Botao
                                        size="sm"
                                        label="Novo usuário"
                                        icon={<FaPlus size={14} />}
                                        onClick={() => {
                                            setIdUsuarioSelecionado(null);
                                            setModalCadastroAberto(true);
                                        }}
                                        disabled={carregando}
                                        loading={carregando}
                                        variant="outline-primary"
                                        type="button"
                                        className="w-100"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <TabelaDados
                colunas={colunas}
                dados={usuarios}
                carregando={carregando}
                mensagemSemDados="Nenhum usuário cadastrado."
                placeholderFiltro="Procurar por usuário"
                usaClickLinha={true}
                aoClicarLinha={abrirCadastroUsuarioSelecionado}
            />

            <ModalCadastroUsuario
                aberto={modalCadastroAberto}
                idUsuario={idUsuarioSelecionado}
                aoFechar={() => {
                    setModalCadastroAberto(false);
                    setIdUsuarioSelecionado(null);
                    carregarUsuariosCadastrados();
                }}
            />

            <ModalResposta
                isOpen={Boolean(mensagemResposta)}
                message={mensagemResposta}
                onClose={() => setMensagemResposta("")}
            />
        </div>
    );
}
