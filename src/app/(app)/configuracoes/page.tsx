"use client";

import { Botao } from "@/components/inputs/button";
import { CampoTexto } from "@/components/inputs/input";
import { Seletor } from "@/components/inputs/select";
import { ModalCarregamento } from "@/components/modals/loading";
import ModalResposta from "@/components/modals/responseModal";
import { requisitarAPI } from "@/utils/api";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { FaSave } from "react-icons/fa";

type OpcaoDisponibilidade = {
    label: string;
    value: string;
};

type DadosConfiguracaoAplicacao = {
    fantasiaEmpresa: string;
    cnpjEmpresa: string;
    emailSuporteContato: string;
    contato: string;
    disponibilidade: OpcaoDisponibilidade | null;
};

type ConfiguracaoAplicacaoApi = {
    fantasia: string;
    cnpj: string;
    email_suporte_contato: string;
    contato: string;
    disponibilidade: string;
};

const opcoesDisponibilidade: OpcaoDisponibilidade[] = [
    { label: "Disponível", value: "disponivel" },
    { label: "Bloqueado para manutenção", value: "bloqueado_manutencao" },
    { label: "Bloqueado por falta de pagamento", value: "bloqueado_pagamento" },
];

const estadoInicialConfiguracao: DadosConfiguracaoAplicacao = {
    fantasiaEmpresa: "",
    cnpjEmpresa: "",
    emailSuporteContato: "",
    contato: "",
    disponibilidade: opcoesDisponibilidade[0],
};

function obterOpcaoDisponibilidade(valor: string): OpcaoDisponibilidade {
    return opcoesDisponibilidade.find((opcao) => opcao.value === valor) ?? opcoesDisponibilidade[0];
}

function mapearConfiguracaoParaFormulario(configuracao: ConfiguracaoAplicacaoApi): DadosConfiguracaoAplicacao {
    return {
        fantasiaEmpresa: configuracao.fantasia,
        cnpjEmpresa: configuracao.cnpj,
        emailSuporteContato: configuracao.email_suporte_contato,
        contato: configuracao.contato,
        disponibilidade: obterOpcaoDisponibilidade(configuracao.disponibilidade),
    };
}

/**
 * Página de configuração da aplicação.
 * Use como base para controlar dados da empresa e disponibilidade do sistema antes da integração com o back-end.
 */
export default function PaginaConfiguracoes() {
    const [formulario, setFormulario] = useState<DadosConfiguracaoAplicacao>(estadoInicialConfiguracao);
    const [mensagemResposta, setMensagemResposta] = useState("");
    const [carregando, setCarregando] = useState(false);

    function atualizarCampoFormulario(campo: keyof DadosConfiguracaoAplicacao, valor: string | OpcaoDisponibilidade | null) {
        setFormulario((estadoAtual) => ({
            ...estadoAtual,
            [campo]: valor,
        }));
    }

    /**
     * Carrega o registro único de configuração e preenche o formulário.
     */
    const carregarConfiguracoesAplicacao = useCallback(async () => {
        setCarregando(true);
        setMensagemResposta("");

        try {
            const resposta = await requisitarAPI("/api/configuracoes", {
                method: "GET",
            });

            const configuracao = resposta.dados as ConfiguracaoAplicacaoApi | null;

            if (configuracao) {
                setFormulario(mapearConfiguracaoParaFormulario(configuracao));
            }
        } catch (erro) {
            const mensagemErro = erro instanceof Error
                ? erro.message
                : "Não foi possível carregar as configurações.";

            setMensagemResposta(mensagemErro);
        } finally {
            setCarregando(false);
        }
    }, []);

    /**
     * Atualiza o registro único de configuração da aplicação.
     */
    async function salvarConfiguracoesAplicacao(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setCarregando(true);
        setMensagemResposta("");

        try {
            const resposta = await requisitarAPI("/api/configuracoes", {
                method: "PUT",
                body: {
                    fantasia: formulario.fantasiaEmpresa,
                    cnpj: formulario.cnpjEmpresa,
                    emailSuporteContato: formulario.emailSuporteContato,
                    contato: formulario.contato,
                    disponibilidade: formulario.disponibilidade?.value,
                },
            });

            const configuracao = resposta.dados as ConfiguracaoAplicacaoApi | null;

            if (configuracao) {
                setFormulario(mapearConfiguracaoParaFormulario(configuracao));
            }

            setMensagemResposta(resposta.msg);
        } catch (erro) {
            const mensagemErro = erro instanceof Error
                ? erro.message
                : "Não foi possível atualizar as configurações.";

            setMensagemResposta(mensagemErro);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        const carregamentoInicial = window.setTimeout(() => {
            void carregarConfiguracoesAplicacao();
        }, 0);

        return () => window.clearTimeout(carregamentoInicial);
    }, [carregarConfiguracoesAplicacao]);

    return (
        <div className="container-fluid">
            <div className="page-header">
                <div className="card w-100">
                    <div className="card-header">
                        <h4 className="mb-1">Configurações</h4>
                    </div>
                    <div className="card-body">
                        <p className="text-muted mb-0">
                            Controle os dados principais da empresa e a disponibilidade da aplicação.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={salvarConfiguracoesAplicacao}>
                <div className="card">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <CampoTexto
                                    id="configuracao-fantasia-empresa"
                                    label="Fantasia da empresa"
                                    type="text"
                                    value={formulario.fantasiaEmpresa}
                                    placeholder="Nome fantasia"
                                    onChange={(event) => atualizarCampoFormulario("fantasiaEmpresa", event.target.value)}
                                    disabled={carregando}
                                    required
                                    className="mb-0"
                                />
                            </div>

                            <div className="col-md-6">
                                <CampoTexto
                                    id="configuracao-cnpj-empresa"
                                    label="CNPJ da empresa"
                                    type="text"
                                    value={formulario.cnpjEmpresa}
                                    placeholder="00.000.000/0000-00"
                                    onChange={(event) => atualizarCampoFormulario("cnpjEmpresa", event.target.value)}
                                    disabled={carregando}
                                    required
                                    className="mb-0"
                                />
                            </div>

                            <div className="col-md-6">
                                <CampoTexto
                                    id="configuracao-email-suporte-contato"
                                    label="E-mail suporte/contato"
                                    type="email"
                                    value={formulario.emailSuporteContato}
                                    placeholder="suporte@empresa.com"
                                    onChange={(event) => atualizarCampoFormulario("emailSuporteContato", event.target.value)}
                                    disabled={carregando}
                                    required
                                    className="mb-0"
                                />
                            </div>

                            <div className="col-md-6">
                                <CampoTexto
                                    id="configuracao-contato"
                                    label="Contato"
                                    type="text"
                                    value={formulario.contato}
                                    placeholder="Nome ou telefone de contato"
                                    onChange={(event) => atualizarCampoFormulario("contato", event.target.value)}
                                    disabled={carregando}
                                    required
                                    className="mb-0"
                                />
                            </div>

                            <div className="col-md-6">
                                <Seletor
                                    id="configuracao-disponibilidade"
                                    label="Disponibilidade"
                                    options={opcoesDisponibilidade}
                                    value={formulario.disponibilidade}
                                    onChange={(opcao) => atualizarCampoFormulario("disponibilidade", opcao)}
                                    placeholder="Selecione a disponibilidade"
                                    isDisabled={carregando}
                                    isClearable={false}
                                    className="mb-0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card-footer d-flex justify-content-end">
                        <Botao
                            size="sm"
                            label="Salvar configurações"
                            icon={<FaSave />}
                            onClick={() => undefined}
                            disabled={carregando}
                            loading={false}
                            variant="outline-primary"
                            type="submit"
                            className=""
                        />
                    </div>
                </div>
            </form>

            <ModalResposta
                isOpen={Boolean(mensagemResposta)}
                message={mensagemResposta}
                onClose={() => setMensagemResposta("")}
            />

            <ModalCarregamento
                show={carregando}
                text="Processando configurações..."
            />
        </div>
    );
}
