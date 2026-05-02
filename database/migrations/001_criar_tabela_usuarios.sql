create table if not exists usuarios (
    id bigserial primary key,
    nome varchar(120) not null,
    email varchar(180) not null,
    senha_hash text not null,
    salt text not null,
    telefone varchar(20),
    documento varchar(20),
    ativo boolean not null default true,
    "isAdmin" boolean not null default false,
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now()
);

create unique index if not exists usuarios_email_unico_idx
    on usuarios (lower(email));
