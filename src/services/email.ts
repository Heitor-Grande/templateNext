import nodemailer from "nodemailer";

type DadosEmail = {
    to: string;
    subject: string;
    html: string;
};

/**
 * Envia e-mails transacionais do template usando SMTP.
 * Use em rotas de API para centralizar host, porta, autenticação e remetente.
 */
export async function enviarEmail({
    to,
    subject,
    html,
}: DadosEmail): Promise<void> {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM;

    if (!host || !Number.isFinite(port) || !user || !pass || !from) {
        throw new Error("Configuração SMTP incompleta.");
    }

    const transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: port === 465,
        auth: {
            user: user,
            pass: pass,
        },
    });

    await transporter.sendMail({
        from: from,
        to: to,
        subject: subject,
        html: html,
    });
}
