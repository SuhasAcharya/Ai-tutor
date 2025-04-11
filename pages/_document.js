import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Inject the regenerator-runtime script before any other JavaScript */}
        <script src="/inject-regenerator.js" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 