# Hidodie

A multiplayer hide and seek game.

## How to start

Run `pnpm start` for production or `pnpm dev` for development.

## Scripts

Each monorepo in the folder `app` has:

```bash
pnpm build
pnpm start
pnpm dev
```

Other useful commands:

```bash
pnpm lint # eslint
pnpm format # prettier

pnpm schema/push # Pushes the schema (no generation required. do not use this in production.)
pnpm schema/generate # Generates the schema
pnpm schema/migrate # Migrate the schema (use this to update the database in production)

pnpm cloudflared # For testing
```
