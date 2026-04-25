import type { Metadata } from "next";
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from "@/components/layout/sideBar";

export const metadata: Metadata = {
  title: "Template",
  description: "Template para criação de novas aplicações.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" data-scroll-behavior="smooth">
      <body>
        <div className="d-flex">

          {/* Conteúdo dinâmico (tipo Outlet) */}
          <main className="flex-grow-1 p-4">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}
