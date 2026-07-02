import type { NavigatorScreenParams } from '@react-navigation/native';

export type DrawerParamList = {
  Dashboard: undefined;
  Routes: undefined;
  Trips: undefined;
  Map: undefined;
  Profile: undefined;
  DriverDashboard: undefined;
  AdminDashboard: undefined;
  AdminMap: undefined;
  AdminRoutes: undefined;
  AdminBuses: undefined;
  AdminStops: undefined;
  AdminDrivers: undefined;
  AdminTrips: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<DrawerParamList>;
  RouteDetail: { routeId: string; admin?: boolean };
  SeatSelection: { routeId: string; tripId: string };
  DriverTripDetail: { tripId: string };
};

export type AuthStackParamList = {
  Landing: undefined;
  SignIn: undefined;
  SignUp: undefined;
};
