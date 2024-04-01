export interface MatchMakingRoom {
  room: {
    id: string;
    connection: string;
  };
}

export interface MatchMakingError {
  error: string;
  error_description?: string;
}
