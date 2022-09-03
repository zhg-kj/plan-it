import { NativeStackScreenProps } from '@react-navigation/native-stack';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: undefined;
  Home: undefined;
  CreatePlan: undefined;
  NotFound: undefined;
  SignInScreen: undefined;
  SignUpScreen: undefined;
  SplashScreen: undefined;
  ScheduleScreen: { schedule: Schedule, friends: Friend[] };
  AddFriendsScreen: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

export type Schedule = {
  title: string,
  isActive: number,
  id: string,
  color: string
}

export type Plan = {
  title: string,
  id: string,
  start: string,
  end: string,
  description: string,
  schedule: { title: string }
}

export type Friend = {
  name: string
  id: string
  avatar: string
}
