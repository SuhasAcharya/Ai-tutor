import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Direct script injection before ANY other code */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Inline regenerator-runtime to ensure it's available immediately
            try {
              if (typeof window !== 'undefined' && !window.regeneratorRuntime) {
                // Direct inline code, no external dependencies
                window.regeneratorRuntime = {
                  // Minimal implementation to prevent errors
                  wrap: function(fn) { return fn; },
                  mark: function(fn) { return fn; }
                };
                console.log('Injected minimal regeneratorRuntime polyfill');
              }
            } catch(e) {
              console.error('Failed to inject regeneratorRuntime:', e);
            }
          `
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 