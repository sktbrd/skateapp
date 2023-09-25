import { Helmet } from "react-helmet";

const APP_NAME = "SkateHive App";

const Meta = () => {
  return (
    <Helmet>
      <title>{APP_NAME}</title>
      <meta name="description" content="Skateboarders App" />

      <meta name="application-name" content={APP_NAME} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={APP_NAME} />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content="#228B22" />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={APP_NAME} />
      <meta property="og:description" content="Skateboarders App" />
      <meta property="og:image" content="https://i.ibb.co/3R7cvdZ/image.png" />
      <meta property="og:url" content="https://skatehive.app" />    
      <meta property="og:type" content="website" />
      <meta property="twitter:image" content="https://i.ibb.co/3R7cvdZ/image.png"/>
      <meta property="twitter:description" content="The Portal to web3 skateboarding"></meta>

      <link rel="shortcut icon" href="https://images.hive.blog/u/hive-173115/avatar" />
<<<<<<< HEAD
      <link rel="manifest" href="/manifest.json" />
=======
      <link rel="manifest" href="./manifest.json" />
>>>>>>> development
    </Helmet>
  );
};

export default Meta;
