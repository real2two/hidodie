export interface ServerApiRoom {
  room: {
    id: string;
    server: {
      main: string;
      discord: string;
    };
  };
}

export interface ServerApiError {
  error: string;
  error_description?: string;
}
