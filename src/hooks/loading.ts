"use client";

import { useState } from "react";

export function useLoading() {

    const [loading, setLoading] = useState<boolean>(false);

    function startLoading(): void {
        setLoading(true);
    }

    function stopLoading(): void {
        setLoading(false);
    }

    return {
        loading,
        startLoading,
        stopLoading
    }
}