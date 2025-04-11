import '../polyfills.js'; // Use local polyfill instead

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp; 