import {
  ServerWebSocketReceiveTypes,
  type ServerWebSocketReceivePing,
} from '@/utils';

export default (_view: DataView): ServerWebSocketReceivePing => {
  // [ type ]

  return {
    type: ServerWebSocketReceiveTypes.Ping,
  };
};
