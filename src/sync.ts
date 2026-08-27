import type { GameState } from './types';

type Status = 'off' | 'connecting' | 'connected' | 'error';

export class RoomSync {
  private socket: WebSocket | null = null;
  private channel: BroadcastChannel | null = null;
  private clientId = crypto.randomUUID();
  room = '';
  status: Status = 'off';
  onStatus: (status: Status, message?: string) => void = () => undefined;
  onState: (state: GameState) => void = () => undefined;

  connect(room: string, current: GameState): void {
    this.disconnect();
    this.room = room.toUpperCase();
    this.status = 'connecting';
    this.onStatus(this.status);

    this.channel = new BroadcastChannel(`tableclock-${this.room}`);
    this.channel.onmessage = (event: MessageEvent<GameState>) => this.accept(event.data);

    const configured = import.meta.env.VITE_SYNC_URL as string | undefined;
    const endpoint = configured || `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/sync`;
    try {
      this.socket = new WebSocket(endpoint);
      this.socket.onopen = () => {
        this.status = 'connected';
        this.onStatus('connected');
        this.socket?.send(JSON.stringify({ type: 'join', room: this.room, clientId: this.clientId, state: current }));
      };
      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(String(event.data)) as { type?: string; state?: GameState };
          if (message.type === 'state' && message.state) this.accept(message.state);
        } catch { /* Ignore malformed room traffic. */ }
      };
      this.socket.onerror = () => this.fail('This host does not have room sync enabled. This clock still works offline.');
      this.socket.onclose = () => {
        if (this.status === 'connected') this.fail('Room connection was lost. Your local clock is still running.');
      };
    } catch {
      this.fail('Room sync could not start on this browser.');
    }
  }

  broadcast(state: GameState): void {
    if (!this.room) return;
    this.channel?.postMessage(state);
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'state', room: this.room, clientId: this.clientId, state }));
    }
  }

  disconnect(): void {
    this.socket?.close();
    this.channel?.close();
    this.socket = null;
    this.channel = null;
    this.room = '';
    this.status = 'off';
  }

  private accept(state: GameState): void {
    if (state.version === 1 && state.updatedAt > 0) this.onState(state);
  }

  private fail(message: string): void {
    this.status = 'error';
    this.onStatus('error', message);
  }
}
