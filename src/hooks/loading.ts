"use client";

import { useState } from "react";

/**
 * Hook simples para controle de loading.
 * Use em componentes que precisam expor iniciarCarregamento/pararCarregamento sem repetir estado local.
 */
export function useCarregamento() {

    const [loading, setLoading] = useState<boolean>(false);

    /**
     * Ativa o estado de carregamento.
     */
    function iniciarCarregamento(): void {
        setLoading(true);
    }

    /**
     * Desativa o estado de carregamento.
     */
    function pararCarregamento(): void {
        setLoading(false);
    }

    return {
        loading,
        iniciarCarregamento,
        pararCarregamento
    }
}
