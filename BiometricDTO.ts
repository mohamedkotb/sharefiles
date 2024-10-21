export interface Biometric {
  identifier: string;
  FCMToken: string;
  model: string;
  platform: string;
  osVersion: string;
  mobileToken?: string;
}
