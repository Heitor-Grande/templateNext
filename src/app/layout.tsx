import type { Metadata } from "next";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./cssGlobal.css";

export const metadata: Metadata = {
  title: "Template",
  description: "Template para criação de novas aplicações.",
};

/**
 * Layout raiz da aplicação.
 * Use para imports globais, metadados e estrutura comum compartilhada por todas as rotas.
 */
export default function LayoutRaiz({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" data-scroll-behavior="smooth">
      <body>
        <div className="d-flex">

          {/* Conteudo dinamico da rota atual. */}
          <main className="flex-grow-1 p-0">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}
