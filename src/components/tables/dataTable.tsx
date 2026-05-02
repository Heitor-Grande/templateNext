"use client";

import { ReactNode } from "react";

export type ColunaTabelaDados<T> = {
    chave: keyof T | string;
    titulo: string;
    alinhamento?: "start" | "center" | "end";
    renderizar?: (item: T) => ReactNode;
};

interface TabelaDadosProps<T> {
    colunas: ColunaTabelaDados<T>[];
    dados: T[];
    carregando: boolean;
    mensagemSemDados: string;
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
}: TabelaDadosProps<T>) {
    function obterValorCelula(item: T, coluna: ColunaTabelaDados<T>): ReactNode {
        if (coluna.renderizar) {
            return coluna.renderizar(item);
        }

        const valor = item[coluna.chave as keyof T];
        return valor as ReactNode;
    }

    return (
        <div className="data-table-card">
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

                        {!carregando && dados.map((item, indice) => (
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
