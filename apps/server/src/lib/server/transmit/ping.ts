import {
  ServerWebSocketTransmitTypes,
  type ServerWebSocketTransmitPing,
} from '@/utils';

export default (_view: DataView): ServerWebSocketTransmitPing => {
  // [ type ]

  return {
    type: ServerWebSocketTransmitTypes.Ping,
  };
};
