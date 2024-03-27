import Page404 from "lib/pages/404";
import SubscriberList from "lib/pages/home/dao/components/steemskate/subscribers";
import UploadPage from "lib/pages/upload";
import React from "react";
import type { PathRouteProps } from "react-router-dom";

import SkatehiveProposals from "lib/pages/home/dao/snapshot";
import Plaza from "lib/pages/home/plaza";
import HiveBlog from "lib/pages/home/Feed/Feed";
import CheckDelegation from "lib/pages/home/dao/components/ethereum/delegationChecker";
import WalletVotesInfo from "lib/pages/home/dao/components/ethereum/delegationChecker";
const Home = React.lazy(() => import("lib/pages/home"));
const Wallet = React.lazy(() => import("lib/pages/wallet"));
const Profile = React.lazy(() => import("lib/pages/profile"));
const AuthorProfilePage = React.lazy(() => import("lib/pages/profile/authorProfile"));
const BeCool = React.lazy(() => import("lib/pages/profile/beCool"));
const TutorialPage = React.lazy(() => import("lib/pages/home/tutorialPage"));
const PostPage = React.lazy(() => import("lib/pages/postpage"));
const QFS = React.lazy(() => import("lib/pages/qfs"));
const GnarsStats = React.lazy(() => import("lib/pages/home/dao/components/hiveGnars/gnars"));
const PepeCaptcha = React.lazy(() => import("lib/pages/secret-spot"));
const NewUpload = React.lazy(() => import("lib/pages/upload/newUpload"));
const Shelf = React.lazy(() => import("lib/pages/home/videos/lbry"));
const Maps = React.lazy(() => import("lib/pages/home/dao/map"));
const Members = React.lazy(() => import("lib/pages/home/dao/components/steemskate/subscribers"));
const GnarsDelegation = React.lazy(() => import("lib/pages/home/dao/components/ethereum/gnarsDelegation"));
const GnarsHolders = React.lazy(() => import("lib/pages/home/dao/components/ethereum/gnarsDelegation2"));
const AccountCreation = React.lazy(() => import("lib/pages/secret-spot/AccountCreation"));
const delegationChecker = React.lazy(() => import("lib/pages/home/dao/components/ethereum/delegationChecker"));
const SwapComponent = React.lazy(() => import("lib/pages/swap"));
const ProposalPage = React.lazy(() => import("lib/pages/home/dao/newProposalPage"));

export const routes: Array<PathRouteProps> = [
  {
    path: "/",
    element: <Home />,
    children: ([] as React.ReactNode[]), // Explicitly type as ReactNode[]
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
    path: "/plaza",
    element: <Plaza URLPermlink="the-weekly-stoken-54" URLAuthor="skatehive" compWidth="60%" />
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/upload",
    element: <UploadPage />,
  },
  {
    path: "/becool",
    element: <BeCool />

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
    path: "/secret",
    element: <PepeCaptcha />,
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
  },
  {
    path: "/delegation2",
    element: <GnarsHolders />,
  },
  {
    path: "/invite",
    element: <AccountCreation />,
  },
  {
    path: "/dao",
    element: <SkatehiveProposals />,
  },
  {
    path: "/blog",
    element: <HiveBlog />,
  },
  {
    path: "/checker",
    element: <WalletVotesInfo />,
  },
  {
    path: "*",
    element: <Page404 />,
  },
  {
    path: "/swap",
    element: <SwapComponent />,
  },
  {
    path: "/newProposal",
    element: <ProposalPage />,
  }
];

export const privateRoutes: Array<PathRouteProps> = [];


