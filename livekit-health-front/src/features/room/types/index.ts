export interface JoinRoomResponse {
  room_name: string;
  livekit_url: string;
  patient_token: string;
  doctor_token: string;
}

export interface RoomState {
  micEnabled: boolean;
  camEnabled: boolean;
  isRecording: boolean;
  seconds: number;
  participantCount: number;
}
