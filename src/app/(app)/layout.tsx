import BarraLateral from "@/components/layout/sideBar";

/**
 * Layout da area autenticada.
 * Use para manter a barra lateral fixa em todas as telas internas sem repetir o componente nas paginas.
 */
export default function LayoutAreaAutenticada({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="app-with-sidebar">
            <BarraLateral />

            <main className="app-main-content">
                {children}
            </main>
        </div>
    );
}
