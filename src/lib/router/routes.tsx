import Page404 from "lib/pages/404";
import SubscriberList from "lib/pages/home/dao/components/steemskate/subscribers";
import UploadPage from "lib/pages/upload";
import React from "react";
import type { PathRouteProps } from "react-router-dom";


const Home = React.lazy(() => import("lib/pages/home"));
const Wallet = React.lazy(() => import("lib/pages/wallet"));
const Profile = React.lazy(() => import("lib/pages/profile"));
const AuthorProfilePage = React.lazy(() => import("lib/pages/profile/authorProfile"));  
const BeCool = React.lazy(() => import("lib/pages/profile/beCool"));  
const TutorialPage = React.lazy(() => import("lib/pages/home/tutorialPage"));  
const PostPage = React.lazy(() => import("lib/pages/postpage"));  
const QFS = React.lazy(() => import("lib/pages/qfs"));  
const Test = React.lazy(() => import("lib/pages/home/dao/components/ethereum/gnarsDelegation"));  
const GnarsStats = React.lazy(() => import("lib/pages/home/dao/components/hiveGnars/gnars"));  
const ThatsGnarly = React.lazy(() => import("lib/pages/home/Feed/thatsgnarly"));  
const PepeCaptcha = React.lazy(() => import("lib/pages/secret-spot"));  
const NewUpload = React.lazy(() => import("lib/pages/upload/newUpload"));  
const Shelf = React.lazy(() => import("lib/pages/home/videos/lbry"));    
const Maps = React.lazy(() => import("lib/pages/home/dao/map"));
const Members = React.lazy(() => import("lib/pages/home/dao/components/steemskate/subscribers"));
const GnarsDelegation = React.lazy(() => import("lib/pages/home/dao/components/ethereum/gnarsDelegation"));

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
  path: "/secret",
  element: <PepeCaptcha />,
},
{
  path: "/newupload",
  element:  <NewUpload />,
},
{
  path: "/test",
  element: <Test />,
},
{
  path: "/secret",
  element: <Shelf />,
},
{
  path: "/map",
  element: <Maps />,
},
{
  path: "/members",
  element: <SubscriberList />,  
},
{
  path: "/delegation",
  element: <GnarsDelegation />,
}
];

export const privateRoutes: Array<PathRouteProps> = [];


