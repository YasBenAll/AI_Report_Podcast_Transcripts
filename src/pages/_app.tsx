import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Lora } from '@next/font/google'
import { Analytics } from '@vercel/analytics/react';
 
const Lora_ = Lora({ subsets: ['latin'] })


export default function App({ Component, pageProps }: AppProps) {
  return (
  <>
    <Head>
      <link rel="shortcut icon" href="/images/ai.png" />
      <title>AI Report Transcripts</title>
    </Head>
    <div style={Lora_.style}>
    <Component {...pageProps} />
    <Analytics />
    </div>
  </>
  );
}
