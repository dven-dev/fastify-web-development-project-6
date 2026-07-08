// @ts-check
export const up = (knex) => (
  knex.schema.alterTable('users', (table) => {
    table.string('first_name');
    table.string('last_name');
  })
);
export const down = (knex) => (
  knex.schema.alterTable('users', (table) => {
    table.dropColumn('first_name');
    table.dropColumn('last_name');
  })
);
