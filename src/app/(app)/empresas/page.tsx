"use client";

import { Botao } from "@/components/inputs/button";
import ModalResposta from "@/components/modals/responseModal";
import { ColunaTabelaDados, TabelaDados } from "@/components/tables/dataTable";
import { requisitarAPI } from "@/utils/api";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { FaList, FaPlus, FaSitemap } from "react-icons/fa";
import ModalCadastroEmpresa from "./components/modalCadastroEmpresa";

type EmpresaTabela = {
    [key: string]: unknown;
    id: number;
    fantasia: string;
    cnpj: string;
    email: string | null;
    telefone: string | null;
    superior_fantasia: string | null;
    ativo: boolean;
    criado_em: string;
    atualizado_em: string;
};

type EmpresaArvoreNo = {
    id: number;
    fantasia: string;
    superior_id: number | null;
    children: EmpresaArvoreNo[];
};

type AbaEmpresas = "lista" | "arvore";

/**
 * Renderiza os nós da árvore de empresas com indentação por nível.
 * Use na aba de árvore para suportar hierarquias com qualquer profundidade.
 */
function renderizarNosArvore(empresas: EmpresaArvoreNo[], nivel = 0): ReactNode {
    return empresas.map((empresa) => (
        <div key={empresa.id}>
            <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                style={{ marginLeft: nivel > 0 ? nivel * 24 : 0 }}
            >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FaSitemap size={14} />
                </span>
                <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-800">{empresa.fantasia}</span>
                    <span className="block text-xs text-slate-500">
                        {empresa.superior_id ? "Empresa vinculada" : "Empresa superior"}
                    </span>
                </span>
            </button>

            {empresa.children.length > 0 && (
                <div className="mt-2 space-y-2 border-l border-slate-200 pl-3">
                    {renderizarNosArvore(empresa.children, nivel + 1)}
                </div>
            )}
        </div>
    ));
}

function formatarCnpj(valor: string): string {
    const digitos = valor.replace(/\D/g, "").slice(0, 14);

    return digitos
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
}

/**
 * Página de listagem de empresas.
 * Use como referência para telas de cadastro que precisam consumir API e renderizar a TabelaDados.
 */
export default function PaginaEmpresas() {
    const [empresas, setEmpresas] = useState<EmpresaTabela[]>([]);
    const [arvoreEmpresas, setArvoreEmpresas] = useState<EmpresaArvoreNo[]>([]);
    const [abaAtiva, setAbaAtiva] = useState<AbaEmpresas>("lista");
    const [carregando, setCarregando] = useState(true);
    const [carregandoArvore, setCarregandoArvore] = useState(false);
    const [mensagemResposta, setMensagemResposta] = useState("");
    const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
    const [idEmpresaSelecionada, setIdEmpresaSelecionada] = useState<number | null>(null);

    const colunas: ColunaTabelaDados<EmpresaTabela>[] = [
        { chave: "fantasia", titulo: "Nome" },
        {
            chave: "cnpj",
            titulo: "CNPJ",
            renderizar: (empresa) => formatarCnpj(empresa.cnpj),
        },
        {
            chave: "email",
            titulo: "E-mail",
            renderizar: (empresa) => empresa.email || "-",
        },
        {
            chave: "telefone",
            titulo: "Telefone",
            renderizar: (empresa) => empresa.telefone || "-",
        },
        {
            chave: "superior_fantasia",
            titulo: "Superior",
            renderizar: (empresa) => empresa.superior_fantasia || "-",
        },
        {
            chave: "ativo",
            titulo: "Status",
            renderizar: (empresa) => (
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${empresa.ativo ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
                    {empresa.ativo ? "Ativa" : "Inativa"}
                </span>
            ),
        },
    ];

    /**
     * Carrega as empresas cadastradas na API.
     * Use ao abrir a tela e sempre que a listagem precisar ser atualizada.
     */
    const carregarEmpresasCadastradas = useCallback(async () => {
        setCarregando(true);
        setMensagemResposta("");

        try {
            const resposta = await requisitarAPI("/api/empresas", {
                method: "GET",
            });

            setEmpresas(Array.isArray(resposta.dados) ? resposta.dados as EmpresaTabela[] : []);
            setMensagemResposta("");
        } catch (erro) {
            const mensagemErro = erro instanceof Error
                ? erro.message
                : "Não foi possível carregar as empresas.";

            setMensagemResposta(mensagemErro);
        } finally {
            setCarregando(false);
        }
    }, []);

    /**
     * Carrega a estrutura hierárquica de empresas vinculadas ao usuário autenticado.
     * Use para alimentar a aba Árvore sem alterar a listagem principal.
     */
    const carregarArvoreEmpresas = useCallback(async () => {
        setCarregandoArvore(true);
        setMensagemResposta("");

        try {
            const resposta = await requisitarAPI("/api/empresas?arvore=true", {
                method: "GET",
            });

            setArvoreEmpresas(Array.isArray(resposta.dados) ? resposta.dados as EmpresaArvoreNo[] : []);
        } catch (erro) {
            const mensagemErro = erro instanceof Error
                ? erro.message
                : "Não foi possível carregar a árvore de empresas.";

            setMensagemResposta(mensagemErro);
        } finally {
            setCarregandoArvore(false);
        }
    }, []);

    useEffect(() => {
        const carregamentoInicial = window.setTimeout(() => {
            void carregarEmpresasCadastradas();
        }, 0);

        return () => window.clearTimeout(carregamentoInicial);
    }, [carregarEmpresasCadastradas]);

    useEffect(() => {
        if (abaAtiva !== "arvore") {
            return;
        }

        const carregamentoArvore = window.setTimeout(() => {
            void carregarArvoreEmpresas();
        }, 0);

        return () => window.clearTimeout(carregamentoArvore);
    }, [abaAtiva, carregarArvoreEmpresas]);

    /**
     * Abre o modal com os dados da empresa selecionada na tabela.
     */
    function abrirCadastroEmpresaSelecionada(idEmpresa: string | number | null) {
        const idNormalizado = Number(idEmpresa);

        if (!Number.isInteger(idNormalizado) || idNormalizado <= 0) {
            setMensagemResposta("Não foi possível identificar a empresa selecionada.");
            return;
        }

        setIdEmpresaSelecionada(idNormalizado);
        setModalCadastroAberto(true);
    }

    return (
        <div className="w-full">
            <div className="mb-6">
                <div className="w-full rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
                    <div className="p-6">
                        <h5 className="text-lg font-bold text-slate-900">Empresas</h5>
                        <hr className="my-4 border-slate-200" />

                        <div className="w-full">
                            <div className="grid gap-4 md:grid-cols-12 md:items-center">
                                <div className="md:col-span-8 lg:col-span-10">
                                    <p className="mb-0 text-slate-500">
                                        Consulte as empresas cadastradas na aplicação.
                                    </p>
                                </div>
                                <div className="md:col-span-4 lg:col-span-2">
                                    <Botao
                                        size="sm"
                                        label="Nova empresa"
                                        icon={<FaPlus size={14} />}
                                        onClick={() => {
                                            setIdEmpresaSelecionada(null);
                                            setModalCadastroAberto(true);
                                        }}
                                        disabled={carregando}
                                        loading={carregando}
                                        variant="outline-primary"
                                        type="button"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
                <button
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${abaAtiva === "lista" ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50"}`}
                    onClick={() => setAbaAtiva("lista")}
                >
                    <FaList size={14} />
                    Lista
                </button>

                <button
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${abaAtiva === "arvore" ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50"}`}
                    onClick={() => setAbaAtiva("arvore")}
                >
                    <FaSitemap size={14} />
                    Árvore
                </button>
            </div>

            {abaAtiva === "lista" && (
                <TabelaDados
                    colunas={colunas}
                    dados={empresas}
                    carregando={carregando}
                    mensagemSemDados="Nenhuma empresa cadastrada."
                    placeholderFiltro="Procurar por empresa"
                    usaExcel={true}
                    usaClickLinha={true}
                    aoClicarLinha={abrirCadastroEmpresaSelecionada}
                    nomeArquivoExcel="empresas"
                />
            )}

            {abaAtiva === "arvore" && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60">
                    {carregandoArvore && (
                        <p className="mb-0 text-sm text-slate-500">Carregando árvore de empresas...</p>
                    )}

                    {!carregandoArvore && arvoreEmpresas.length === 0 && (
                        <p className="mb-0 text-sm text-slate-500">Nenhuma empresa encontrada para montar a árvore.</p>
                    )}

                    {!carregandoArvore && arvoreEmpresas.length > 0 && (
                        <div className="space-y-2">
                            {renderizarNosArvore(arvoreEmpresas)}
                        </div>
                    )}
                </div>
            )}

            {modalCadastroAberto && (
                <ModalCadastroEmpresa
                    aberto={modalCadastroAberto}
                    idEmpresa={idEmpresaSelecionada}
                    aoFechar={() => {
                        setModalCadastroAberto(false);
                        setIdEmpresaSelecionada(null);
                        void carregarEmpresasCadastradas();
                        void carregarArvoreEmpresas();
                    }}
                />
            )}

            <ModalResposta
                isOpen={Boolean(mensagemResposta)}
                message={mensagemResposta}
                onClose={() => setMensagemResposta("")}
            />
        </div>
    );
}
