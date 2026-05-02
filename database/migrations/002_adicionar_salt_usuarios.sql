alter table usuarios
    add column if not exists salt text;

update usuarios
set salt = ''
where salt is null;

alter table usuarios
    alter column salt set not null;
