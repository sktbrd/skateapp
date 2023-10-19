require('dotenv').config();
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
import cors from 'cors'; // Import the 'cors' package

// import inject from '@rollup/plugin-inject'
// import wasm from 'vite-plugin-wasm'

// @ts-ignore
export default defineConfig(({}) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // const env = loadEnv(mode, process.cwd(), '')

  const allowedOrigins = [
    'https://www.skatehive.app',
    'https://hub.snapshot.org/graphql',
    // Add more domains as needed
  ];

  return {
    // vite config
    server: {
      middleware: [
        cors({
          origin: allowedOrigins, // Allow requests from your domain
        }),
      ],
    },
    define: {
      'process.env.OPENAI_API_KEY': JSON.stringify(process.env.OPENAI_API_KEY),
      'process.env.COINGECKO_API_KEY': JSON.stringify(process.env.COINGECKO_API_KEY),
      'process.env.VITE_RECAPTCHA_SITE_KEY': JSON.stringify(process.env.VITE_RECAPTCHA_SITE_KEY),
      'process.env.PINATA_API_KEY': JSON.stringify(process.env.PINATA_API_KEY),
      'process.env.PINATA_SECRET_API_KEY': JSON.stringify(process.env.PINATA_SECRET_API_KEY),
      'process.env.VITE_ETHERSCAN_API': JSON.stringify(process.env.VITE_ETHERSCAN_API_KEY),
      'process.env.PINATA_GATEWAY_TOKEN': JSON.stringify(process.env.PINATA_GATEWAY_TOKEN),
    },
    
    plugins: [react()],
    resolve: {
      alias: {
        lib: resolve(__dirname, "src/lib"),
        routes: resolve(__dirname, "src/routes"),
        util: 'rollup-plugin-node-polyfills/polyfills/util',
        sys: 'util',
        events: 'rollup-plugin-node-polyfills/polyfills/events',
        //stream: 'rollup-plugin-node-polyfills/polyfills/stream',
        stream: 'stream-browserify',
        path: 'rollup-plugin-node-polyfills/polyfills/path',
        querystring: 'rollup-plugin-node-polyfills/polyfills/qs',
        punycode: 'rollup-plugin-node-polyfills/polyfills/punycode',
        url: 'rollup-plugin-node-polyfills/polyfills/url',
        http: 'rollup-plugin-node-polyfills/polyfills/http',
        https: 'rollup-plugin-node-polyfills/polyfills/http',
        os: 'rollup-plugin-node-polyfills/polyfills/os',
        assert: 'rollup-plugin-node-polyfills/polyfills/assert',
        constants: 'rollup-plugin-node-polyfills/polyfills/constants',
        _stream_duplex:
            'rollup-plugin-node-polyfills/polyfills/readable-stream/duplex',
        _stream_passthrough:
            'rollup-plugin-node-polyfills/polyfills/readable-stream/passthrough',
        _stream_readable:
            'rollup-plugin-node-polyfills/polyfills/readable-stream/readable',
        _stream_writable:
            'rollup-plugin-node-polyfills/polyfills/readable-stream/writable',
        _stream_transform:
            'rollup-plugin-node-polyfills/polyfills/readable-stream/transform',
        timers: 'rollup-plugin-node-polyfills/polyfills/timers',
        console: 'rollup-plugin-node-polyfills/polyfills/console',
        vm: 'rollup-plugin-node-polyfills/polyfills/vm',
        zlib: 'rollup-plugin-node-polyfills/polyfills/zlib',
        tty: 'rollup-plugin-node-polyfills/polyfills/tty',
        domain: 'rollup-plugin-node-polyfills/polyfills/domain',
        buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6', // add buffer
        process: 'rollup-plugin-node-polyfills/polyfills/process-es6', // add process
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis'
        },
        // Enable esbuild polyfill plugins
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true
          }),
          // NodeModulesPolyfillPlugin()
        ],
      }
    },
    build: {
      minify: true,
      sourcemap: false,
      rollupOptions: {
        external: [
          /^node:.*/,
          ""
        ],
        plugins: [
          // inject({ Buffer: ['Buffer','Buffer'], process: ['process'] }),
          NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true
          }),
          //NodeModulesPolyfillPlugin()
          rollupNodePolyFill()
        ],
      }
    },
  }
})
