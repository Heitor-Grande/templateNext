"use client";

import { ModalCarregamento } from "@/components/modals/loading";
import ModalResposta from "@/components/modals/responseModal";
import { requisitarAPI } from "@/utils/api";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaArrowRight,
  FaChartLine,
  FaCheckCircle,
  FaLock,
  FaRocket,
  FaShieldAlt,
  FaUser,
} from "react-icons/fa";

/**
 * Pagina inicial do template com landing page e login.
 * Use como ponto de partida para apresentar a aplicacao e autenticar o usuario.
 */
export default function PaginaInicial() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");

  /**
   * Envia as credenciais para a API de login e exibe a resposta sem manipular tokens no front.
   */
  async function enviarFormularioLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setLoginMessage("");

    try {
      await requisitarAPI("/api/auth/login", {
        method: "POST",
        body: {
          email,
          password,
        },
      });

      setPassword("");
      router.push("/menuPrincipal");
    } catch (erro) {
      const mensagemErro = erro instanceof Error
        ? erro.message
        : "Nao foi possivel conectar ao servidor.";

      setLoginMessage(mensagemErro);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-landing">
      <section className="login-hero">
        <div className="container">
          <nav className="login-nav">
            <div className="login-brand">
              <span className="login-brand-icon">
                <FaRocket />
              </span>
              <span>Template App</span>
            </div>

            <a href="#login" className="btn btn-outline-light btn-sm">
              Acessar
            </a>
          </nav>

          <div className="row align-items-center g-5 login-hero-content">
            <div className="col-lg-7">
              <span className="badge text-bg-light mb-3">
                Base pronta para novos projetos
              </span>

              <h1 className="display-5 fw-bold text-white mb-3">
                Comece sua proxima aplicacao com uma estrutura pronta para evoluir.
              </h1>

              <p className="lead text-white-50 mb-4">
                Um template com componentes, modais, hooks e padroes essenciais para acelerar o desenvolvimento de sistemas web.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <a href="#login" className="btn btn-primary btn-lg">
                  Entrar agora <FaArrowRight className="ms-2" />
                </a>
                <a href="#recursos" className="btn btn-outline-light btn-lg">
                  Ver recursos
                </a>
              </div>
            </div>

            <div className="col-lg-5" id="login">
              <div className="login-card">
                <div className="mb-4">
                  <p className="text-muted small text-uppercase fw-semibold mb-1">
                    Area segura
                  </p>
                  <h2 className="h3 fw-bold mb-1">Acesse sua conta</h2>
                  <p className="text-muted mb-0">
                    Entre para continuar usando a plataforma.
                  </p>
                </div>

                <form onSubmit={enviarFormularioLogin}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      E-mail
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaUser />
                      </span>
                      <input
                        id="email"
                        type="email"
                        className="form-control"
                        placeholder="voce@empresa.com"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          setLoginMessage("");
                        }}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label htmlFor="password" className="form-label">
                      Senha
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaLock />
                      </span>
                      <input
                        id="password"
                        type="password"
                        className="form-control"
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          setLoginMessage("");
                        }}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 btn-lg"
                    disabled={loading}
                  >
                    Entrar
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="login-section" id="recursos">
        <div className="container">
          <div className="row g-4 align-items-stretch">
            <div className="col-md-4">
              <div className="feature-card h-100">
                <FaCheckCircle className="feature-icon text-primary" />
                <h3 className="h5 fw-bold mt-3">Componentes reutilizaveis</h3>
                <p className="text-muted mb-0">
                  Inputs, botoes e modais prontos para padronizar novas telas.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-card h-100">
                <FaShieldAlt className="feature-icon text-success" />
                <h3 className="h5 fw-bold mt-3">Base consistente</h3>
                <p className="text-muted mb-0">
                  Organizacao pensada para services, hooks e utils compartilhados.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-card h-100">
                <FaChartLine className="feature-icon text-danger" />
                <h3 className="h5 fw-bold mt-3">Pronto para crescer</h3>
                <p className="text-muted mb-0">
                  Estrutura simples para evoluir de prototipo para produto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ModalResposta
        isOpen={Boolean(loginMessage)}
        message={loginMessage}
        onClose={() => setLoginMessage("")}
      />

      <ModalCarregamento
        show={loading}
        text="Validando suas credenciais..."
      />
    </div>
  );
}
