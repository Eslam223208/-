import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Explore: { presetType?: string; presetPurpose?: string } | undefined;
  Analysis: undefined;
  Favorites: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  PropertyDetails: { id: string };
  Quiz: undefined;
};
