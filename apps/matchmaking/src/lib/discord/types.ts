export type ActivityInstances = ActivityInstance[];

export interface ActivityInstance {
  application_id: string;
  channel_id: string;
  users: string[];
  instance_id: string;
  guild_id: string;
}
