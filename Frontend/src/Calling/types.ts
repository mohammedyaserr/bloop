export type CallState = 'idle' | 'incoming' | 'outgoing' | 'connecting' | 'connected' | 'ended';

export interface CallUser {
  id: string;
  name: string;
  avatarUrl?: string;
  phoneNumber?: string;
}

export interface CallHandlers {
  onAcceptCall: () => void;
  onRejectCall: () => void;
  onEndCall: () => void;
  onMuteToggle: (isMuted: boolean) => void;
  onSpeakerToggle: (isSpeakerOn: boolean) => void;
  onBluetoothToggle: (isBluetoothConnected: boolean) => void;
}
