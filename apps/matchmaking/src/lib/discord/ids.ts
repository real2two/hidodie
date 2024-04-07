export const isSnowflake = (id: string) => /^\d{17,21}$/g.test(id);
export const isUUID = (uuid: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuid,
  );
