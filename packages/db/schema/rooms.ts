import { varchar, mysqlTable } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { servers } from "./servers";

export const rooms = mysqlTable("rooms", {
  roomId: varchar("id", { length: 128 }).primaryKey(),
  serverId: varchar("server_id", { length: 32 })
    .notNull()
    .references(() => servers.serverId),
});

export const roomsRelations = relations(rooms, ({ one }) => ({
  server: one(servers, {
    fields: [rooms.serverId],
    references: [servers.serverId],
  }),
}));
