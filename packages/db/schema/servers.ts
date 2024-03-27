import { varchar, mysqlTable } from "drizzle-orm/mysql-core";

export const servers = mysqlTable("servers", {
  serverId: varchar("id", { length: 32 }).primaryKey(),
  fqdn: varchar("fqdn", { length: 255 }),
  discordUrlMapping: varchar("discord_url_mapping", { length: 2048 }),
});
