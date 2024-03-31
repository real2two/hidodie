export interface ServerApiRoom {
  room: {
    id: string;
    connection: string;
  };
}

export interface ServerApiError {
  error: string;
  error_description?: string;
}
