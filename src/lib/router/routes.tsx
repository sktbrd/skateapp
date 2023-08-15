import Page404 from "lib/pages/404";
import UploadPage from "lib/pages/upload";
import React from "react";
import type { PathRouteProps } from "react-router-dom";

const Home = React.lazy(() => import("lib/pages/home"));
const Wallet = React.lazy(() => import("lib/pages/wallet"));
const Profile = React.lazy(() => import("lib/pages/profile"));


export const routes: Array<PathRouteProps> = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/404",
    element: <Page404 />,
  },  
  {
    path: "/wallet",
    element: <Wallet />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/upload",
    element: <UploadPage title="" content="" author="" user="" permlink="" weight={0} />,
  },
];

export const privateRoutes: Array<PathRouteProps> = [];
