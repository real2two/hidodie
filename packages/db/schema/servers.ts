import { varchar, int, mysqlTable } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { rooms } from "./rooms";

export const servers = mysqlTable("servers", {
  serverId: varchar("id", { length: 36 }).primaryKey(),
  connection: varchar("connection", { length: 2048 }).notNull(),
  discordUrlMapping: varchar("discord_url_mapping", { length: 2048 }).notNull(),
  maxRooms: int("max_rooms", { unsigned: true }).notNull(),
});

export const serversRelations = relations(servers, ({ many }) => ({
  rooms: many(rooms),
}));
