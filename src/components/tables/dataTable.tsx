"use client";

import { ReactNode, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";

/**
 * Configuracao de uma coluna da tabela reutilizavel.
 * Use `renderizar` quando o valor precisar de formatacao visual customizada.
 */
export type ColunaTabelaDados<T> = {
    chave: keyof T | string;
    titulo: string;
    alinhamento?: "start" | "center" | "end";
    renderizar?: (item: T) => ReactNode;
};

/**
 * Props da tabela generica de dados.
 * Use `placeholderFiltro` para customizar o texto do campo de busca.
 */
interface TabelaDadosProps<T> {
    colunas: ColunaTabelaDados<T>[];
    dados: T[];
    carregando: boolean;
    mensagemSemDados: string;
    placeholderFiltro: string;
}

/**
 * Tabela reutilizavel para listagens de cadastros.
 * Use em telas internas sempre que precisar listar registros com colunas configuraveis.
 */
export function TabelaDados<T extends Record<string, unknown>>({
    colunas,
    dados,
    carregando,
    mensagemSemDados,
    placeholderFiltro,
}: TabelaDadosProps<T>) {
    const [textoFiltro, setTextoFiltro] = useState("");

    /**
     * Filtra os registros em memoria usando os valores brutos das colunas configuradas.
     * Use para buscas simples sem nova chamada ao back.
     */
    const dadosFiltrados = useMemo(() => {
        const filtroNormalizado = textoFiltro.trim().toLowerCase();

        if (!filtroNormalizado) {
            return dados;
        }

        return dados.filter((item) => colunas.some((coluna) => {
            const valor = item[coluna.chave as keyof T];

            return String(valor ?? "").toLowerCase().includes(filtroNormalizado);
        }));
    }, [colunas, dados, textoFiltro]);

    /**
     * Retorna o conteudo que sera exibido na celula.
     * Prioriza renderizacao customizada quando a coluna fornece `renderizar`.
     */
    function obterValorCelula(item: T, coluna: ColunaTabelaDados<T>): ReactNode {
        if (coluna.renderizar) {
            return coluna.renderizar(item);
        }

        const valor = item[coluna.chave as keyof T];
        return valor as ReactNode;
    }

    return (
        <div className="data-table-card">
            <div className="data-table-toolbar">
                <div className="input-group data-table-filter">
                    <span className="input-group-text">
                        <FaSearch />
                    </span>
                    <input
                        type="search"
                        className="form-control"
                        placeholder={placeholderFiltro}
                        value={textoFiltro}
                        onChange={(event) => setTextoFiltro(event.target.value)}
                        disabled={carregando || dados.length === 0}
                    />
                </div>
            </div>

            <div className="table-responsive">
                <table className="table data-table align-middle mb-0">
                    <thead>
                        <tr>
                            {colunas.map((coluna) => (
                                <th
                                    key={String(coluna.chave)}
                                    className={`text-${coluna.alinhamento || "start"}`}
                                >
                                    {coluna.titulo}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {carregando && (
                            <tr>
                                <td colSpan={colunas.length} className="text-center py-5">
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Carregando registros...
                                </td>
                            </tr>
                        )}

                        {!carregando && dados.length === 0 && (
                            <tr>
                                <td colSpan={colunas.length} className="text-center text-muted py-5">
                                    {mensagemSemDados}
                                </td>
                            </tr>
                        )}

                        {!carregando && dados.length > 0 && dadosFiltrados.length === 0 && (
                            <tr>
                                <td colSpan={colunas.length} className="text-center text-muted py-5">
                                    Nenhum registro encontrado para o filtro informado.
                                </td>
                            </tr>
                        )}

                        {!carregando && dadosFiltrados.map((item, indice) => (
                            <tr key={String(item.id || indice)}>
                                {colunas.map((coluna) => (
                                    <td
                                        key={`${String(item.id || indice)}-${String(coluna.chave)}`}
                                        className={`text-${coluna.alinhamento || "start"}`}
                                    >
                                        {obterValorCelula(item, coluna)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
