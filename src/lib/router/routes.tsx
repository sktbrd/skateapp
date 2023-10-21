import Page404 from "lib/pages/404";
import GnarsDao from "lib/pages/home/dao/components/hiveGnars/gnars";
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
const QFS = React.lazy(() => import("lib/pages/qfs")); // Update the path accordingly
const Test = React.lazy(() => import("lib/pages/home/dao/components/ethereum/testContract")); // Update the path accordingly
const GnarsStats = React.lazy(() => import("lib/pages/home/dao/components/hiveGnars/gnars")); // Update the path accordingly
const ThatsGnarly = React.lazy(() => import("lib/pages/home/Feed/thatsgnarly")); // Update the path accordingly
const Account = React.lazy(() => import("lib/pages/account")); // Update the path accordingly
const NewUpload = React.lazy(() => import("lib/pages/upload/newUpload")); // Update the path accordingly


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
  path: "/qfs",
  element: <QFS />,
},

{
  path: "/gnars",
  element: <GnarsStats />,
},
{ 
  path: "/thatsgnarly",
  element: <ThatsGnarly />,
},
{
  path: "/account",
  element: <Account />,
},
{
  path: "/newupload",
  element:  <NewUpload />,
},
{
  path: "/test",
  element: <Test />,
}

];

export const privateRoutes: Array<PathRouteProps> = [];


