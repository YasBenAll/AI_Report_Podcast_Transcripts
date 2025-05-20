import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import { Lora } from '@next/font/google';

const lora = Lora({ subsets: ['latin-ext'] })

// Helper function to format timestamp (unchanged, seems correct)
const formatTimestamp = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}m${seconds}`;
};

// Helper function to create timestamp link (unchanged, seems correct)
const createTimestampLink = (start, youtubeCode) => {
  return (
    <button
      onClick={() => {
        // Ensure the iframe src matches the one used in search results
        const iframe = document.querySelector(`iframe[src*='${youtubeCode}']`);
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            JSON.stringify({
              event: 'command',
              func: 'seekTo',
              args: [parseFloat(start), true]
            }),
            '*'
          );
        }
      }}
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 hover:bg-blue-200 transition-colors duration-200"
    >
      {formatTimestamp(start)}
    </button>
  );
};

export default function Home() {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const webdomain = process.env.NEXT_PUBLIC_WEBDOMAIN;

  useEffect(() => {
    setLoading(true);
    fetch(`${webdomain}/api/transcript/episode_name`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((fetchedRawData) => {
        const sortedEpisodes = [...fetchedRawData].sort((a, b) => {
          // Robustly parse the date string "YYYY-MM-DD HH"
          // We convert it to a more reliable ISO-like format "YYYY-MM-DDTHH:00:00"
          // Adding ':00:00' for minutes/seconds and 'T' separator
          // Note: If your backend provides timezone, use it, otherwise this assumes local time context
          const dateAString = a.lastModifiedTime.replace(' ', 'T') + ':00:00';
          const dateBString = b.lastModifiedTime.replace(' ', 'T') + ':00:00';

          const dateA = new Date(dateAString);
          const dateB = new Date(dateBString);

          // IMPORTANT: Check for Invalid Dates during debugging if sorting still fails
          if (isNaN(dateA.getTime())) {
            console.warn(`Invalid Date A: ${a.lastModifiedTime}`);
          }
          if (isNaN(dateB.getTime())) {
            console.warn(`Invalid Date B: ${b.lastModifiedTime}`);
          }

          return dateB.getTime() - dateA.getTime(); // Sort by timestamp, newest first
        });

        console.log('Fetched and sorted data by lastModifiedTime:', sortedEpisodes);
        setEpisodes(sortedEpisodes);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching and sorting episodes:', error);
        setLoading(false);
      });
  }, [webdomain]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
    }

    fetch(`${webdomain}/api/search?query=${encodeURIComponent(searchQuery)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Search results:', data);
        setSearchResults(data);
      })
      .catch((error) => {
        console.error('Error fetching search results:', error);
      });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Head>
        <title>AI report Transcripts</title>
        <meta property="og:title" content="AI Report Transcripts" key="title" />
      </Head>
      <div className="absolute right-0 p-4">
          <a href="https://github.com/YasBenAll/AI_Report_Podcast_Transcripts" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-md">
            <svg className="w-8 h-8 fill-current text-black hover:text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.263.82-.583 0-.288-.01-1.05-.015-2.06-3.338.725-4.042-1.61-4.042-1.61-.546-1.385-1.333-1.755-1.333-1.755-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.238 1.84 1.238 1.07 1.835 2.805 1.305 3.49.998.108-.775.42-1.305.76-1.605-2.665-.305-5.466-1.335-5.466-5.93 0-1.31.47-2.38 1.235-3.22-.125-.305-.535-1.53.115-3.18 0 0 1.005-.322 3.3 1.23.955-.265 1.98-.398 3-.403 1.02.005 2.045.138 3 .403 2.28-1.552 3.285-1.23 3.285-1.23.655 1.65.245 2.875.12 3.18.77.84 1.235 1.91 1.235 3.22 0 4.61-2.805 5.625-5.475 5.92.43.37.815 1.102.815 2.222 0 1.605-.015 2.895-.015 3.285 0 .32.215.705.825.585C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
      </div>
      <div className="flex justify-center">
        <div className="bg-opacity-10 p-30 px-6 py-6 rounded-md mx-auto max-w-3/4 w-2/3 mt-8">
          <div className="flex justify-center">
            <Image src="/images/ai_report.jpeg" alt="AI report" width={200} height={241} />
            <Image src="/images/poki.jpeg" alt="POKI" width={200} height={241} />
          </div>
          <div className="text-center text-5xl flex flex-col items-center py-6">
            <div style={lora.style}>
              AI Report (POKI) Transcripts
            </div>
          </div>
          <div style={lora.style} className='text-center'>
            Deze pagina maakt het mogelijk om de transcripts van de podcast AI Report (POKI) met Alexander Klöpping en Wietse Hage te doorzoeken en te bekijken.
          </div>
          <div className="flex justify-center my-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Voer zoekterm in..."
              className="border rounded-md px-4 py-2 w-full max-w-md"
            />
            <button
              onClick={handleSearch}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Zoek
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-6">
              <h2 className="text-2xl mb-4">Search Results:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((result, index) => (
                  <div key={index} className="border p-4 rounded-md shadow-md">
                    {/* PLEASE CONFIRM THIS YOUTUBE EMBED URL IS CORRECT FOR YOUR USE CASE */}
                    <iframe
                      src={`https://www.youtube.com/embed/${result.youtubeCode ? result.youtubeCode.trim() : ''}?enablejsapi=1`}
                      title={result.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-48 mb-4"
                    ></iframe>
                    <h3 className="text-xl font-bold mb-2">{result.name}</h3>
                    <div className="text-sm text-gray-600">
                      {result.snippets.map((snippet, i) => {
                        const timestampMatch = snippet.match(/\[(\d+\.\d+)\s*-->/);
                        const timestamp = timestampMatch ? timestampMatch[1] : null;
                        const content = snippet.replace(/\[\d+\.\d+\s*-->\s*\d+\.\d+\]/, '').trim();
                        return (
                          <div key={i} className="mb-4">
                            {timestamp && createTimestampLink(timestamp, result.youtubeCode)}
                            {content.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, index) =>
                              part.toLowerCase() === searchQuery.toLowerCase() ? (
                                <span key={index} className="bg-yellow-200">{part}</span>
                              ) : (
                                <span key={index}>{part}</span>
                              )
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={lora.style} className="text-3xl mt-8">Episodes:</div>
          {!loading ? (
            <ul className="list-inside mt-4">
              {episodes.map((item, i) => (
                <li key={item.filename} className="my-2">
                  <Link href={`/episode/${encodeURIComponent(item.filename.replace(/\.[^/.]+$/, ''))}`}>
                    <div className="transition-transform duration-200 flex items-center">
                      <div className="hover:underline">{i + 1}. {item.name}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex justify-center">
              <button type="button" disabled>
                <div className="flex justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}