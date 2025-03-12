import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import { Lora } from '@next/font/google';

const lora = Lora({ subsets: ['latin-ext'] })

const formatTimestamp = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}m${seconds}s`;
};

const createTimestampLink = (start, code) => {
  return (
    <button 
      onClick={() => {
        const iframe = document.querySelector(`iframe[src*='${code}']`);
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
  const [data, setMessage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const webdomain = "https://ai-report-podcast-transcripts.vercel.app";
  useEffect(() => {
    // Adjust the domain/port to match your Flask server configuration

    fetch(`${webdomain}/api/transcript/episode_name`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        console.log('Fetched data:', data); // Debugging log
        setMessage(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const handleSearch = () => {
    if (!searchQuery) return;

    fetch(`${webdomain}/api/search?query=${encodeURIComponent(searchQuery)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        console.log('Search results:', data); // Log the search results
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
                    {console.log('YouTube Code:', result.youtubeCode)} {/* Debugging log */}
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
              {data.map((item, i) => (
                <li key={i} className="my-2">
                  {/* Use encodeURIComponent to safely embed the filename in the URL */}
                  <Link href={`/episode/${encodeURIComponent(item.filename.replace(/\.[^/.]+$/, ''))}`}>
                    <div className="transition-transform duration-200 flex items-center">
                      <div className="hover:underline">{item.name}</div>
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
