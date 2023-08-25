import { Helmet } from "react-helmet";

const APP_NAME = "Soma Skate Arte";

const Meta = () => {
  return (
    <Helmet>
      <title>{APP_NAME}</title>
      <meta name="description" content="Soma ou Suma" />

      <meta name="application-name" content={APP_NAME} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={APP_NAME} />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content="#228B22" />

      <link rel="shortcut icon" href="https://somaskatearte.com/cdn/shop/files/logo_a_mao-01_b8080f89-8956-428e-b081-c48f16cffae5_x100.png?v=6648617485788368536" />
      <link rel="manifest" href="/manifest.json" />
    </Helmet>
  );
};

export default Meta;
