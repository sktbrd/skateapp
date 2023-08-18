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

      <link rel="shortcut icon" href="https://images.hive.blog/u/hive-173115/avatar" />
      <link rel="manifest" href="/manifest.json" />
    </Helmet>
  );
};

export default Meta;
