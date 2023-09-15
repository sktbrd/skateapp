import Page404 from "lib/pages/404";
import UploadPage from "lib/pages/upload";
import React from "react";
import type { PathRouteProps } from "react-router-dom";


const Home = React.lazy(() => import("lib/pages/home"));
const Wallet = React.lazy(() => import("lib/pages/wallet"));
const Profile = React.lazy(() => import("lib/pages/profile"));
const AuthorProfilePage = React.lazy(() => import("lib/pages/profile/authorProfile")); // Update the path accordingly
const BeCool = React.lazy(() => import("lib/pages/profile/beCool")); // Update the path accordingly
const TutorialPage = React.lazy(() => import("lib/pages/home/tutorialPage")); // Update the path accordingly
const PostPage = React.lazy(() => import("lib/pages/postpage")); // Update the path accordingly
const MediaUpload = React.lazy(() => import("lib/pages/upload/easyUpload2")); // Update the path accordingly
const QFS = React.lazy(() => import("lib/pages/qfs")); // Update the path accordingly
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
    element: <UploadPage/>,
  },
  {
    path: "/becool",
    element: <BeCool  />

  },
  {
    path: "/tutorial",
    element: <TutorialPage />,
    
  },
{
    path: "/post/:postUrl/*",
    element: <PostPage />,
},

{
    path: "/profile/:username",
    element: <AuthorProfilePage />,
},
{
  path: "/easy-upload",
  element: <SimpleUploadPage />,
},
{
  path: "/easy-upload2",
  element: <MediaUpload />,
},
{
  path: "/qfs",
  element: <QFS />,
},

];

export const privateRoutes: Array<PathRouteProps> = [];


