import { AuthStackParamList } from './AuthStack';
import { MainStackParamList } from './MainStack';

export type RootStackParamList = AuthStackParamList & MainStackParamList;

export type { AuthStackParamList } from './AuthStack';
export type { MainStackParamList } from './MainStack';
