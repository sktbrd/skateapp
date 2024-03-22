import { Helmet } from "react-helmet";

const APP_NAME = "SkateHive App";

const Meta = () => {
  return (
    <Helmet>
      <title>{APP_NAME}</title>
      <meta name="description" content="Bless Community" />

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
      <meta property="og:image" content="https://images.ecency.com/webp/u/blessskateshop/avatar/small" />
      <meta property="og:url" content="https://bless.skatehive.app" />
      <meta property="og:type" content="website" />
      <meta property="twitter:image" content="https://images.ecency.com/webp/u/blessskateshop/avatar/small" />
      <meta property="twitter:description" content="Bless SkateShop on Chain"></meta>

      <link rel="shortcut icon" href="https://images.ecency.com/webp/u/blessskateshop/avatar/small" />
      <link rel="manifest" href="./manifest.json" />
    </Helmet>
  );
};

export default Meta;
