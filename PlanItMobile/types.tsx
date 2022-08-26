/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { List } from '@ui-kitten/components';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  Home: undefined;
  CreatePlan: undefined;
  NotFound: undefined;
  SignInScreen: undefined;
  SignUpScreen: undefined;
  SplashScreen: undefined;
  ScheduleScreen: { schedule: Schedule };
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

export type RootTabParamList = {
  Main: undefined;
  Profile: undefined;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;

export type Schedule = {
  title: string,
  isPrimary: string,
  id: string
}

export type Plan = {
  title: string,
  id: string,
  start: string,
  end: string,
  description: string
}

export type Friend = {
  name: string
}
