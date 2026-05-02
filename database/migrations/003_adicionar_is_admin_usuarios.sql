alter table usuarios
    add column if not exists "isAdmin" boolean not null default false;
