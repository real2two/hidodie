import { varchar, foreignKey, mysqlTable } from "drizzle-orm/mysql-core";

import { servers } from "./servers";

export const rooms = mysqlTable(
  "rooms",
  {
    roomId: varchar("id", { length: 128 }).primaryKey(),
    serverId: varchar("server_id", { length: 32 }),
  },
  (table) => ({
    referenceRequirementLists: foreignKey({
      columns: [table.serverId],
      foreignColumns: [servers.serverId],
    }),
  }),
);
