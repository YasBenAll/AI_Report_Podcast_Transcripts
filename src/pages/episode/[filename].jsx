import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Footer from '../../components/Footer';

export default function Episode() {
  const router = useRouter();
  const { filename } = router.query;
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(true);
  const [videoTitle, setVideoTitle] = useState('');
  const [youtubeCode, setYoutubeCode] = useState('');
  const [parsedContent, setParsedContent] = useState([]);
  const playerRef = useRef(null);

  const formatTimestamp = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}m${seconds}s`;
  };

  const seekToTimestamp = (time) => {
    if (playerRef.current?.contentWindow) {
      // Convert time to seconds if it's not already
      const seconds = parseFloat(time);
      playerRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [seconds, true]
        }),
        '*'
      );
    }
  };

  const createTimestampLink = (start, end, code) => {
    return (
      <button 
        onClick={() => seekToTimestamp(start)}
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 hover:bg-blue-200 transition-colors duration-200"
      >
        {start} → {end}
      </button>
    );
  };

  const parseTranscript = (text) => {
    const lines = text.split('\n');
    const contentLines = lines.filter(line => {
      if (line.startsWith('Video title:')) {
        setVideoTitle(line.replace('Video title:', '').trim());
        return false;
      }
      if (line.startsWith('Youtube video code:')) {
        setYoutubeCode(line.replace('Youtube video code:', '').trim());
        return false;
      }
      if (line.startsWith('Last modified time:')) {
        return false;
      }
      if (line.trim() === '------------------') {
        return false;
      }
      return true;
    });

    return contentLines.map((line, index) => {
      const timestampMatch = line.match(/\[(\d+\.\d+)\s*-->\s*(\d+\.\d+)\]/);
      if (timestampMatch) {
        const [fullMatch, start, end] = timestampMatch;
        const content = line.replace(fullMatch, '').trim();
        return (
          <div key={index} className="mb-4">
            {createTimestampLink(start, end, youtubeCode)}
            <span className="text-gray-700">{content}</span>
          </div>
        );
      }
      return <div key={index} className="text-gray-700">{line}</div>;
    });
  };

  useEffect(() => {
    if (!filename) return;
    // Append .txt extension when making the API call
    fetch(`https://ai-report-podcast-transcripts.vercel.app:5328/api/transcripts/${filename}.txt`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        setTranscript(data.content);
        setParsedContent(parseTranscript(data.content));
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching transcript:', error);
        setLoading(false);
      });
  }, [filename, youtubeCode]); // Add youtubeCode as a dependency

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Head>
        <title>{videoTitle || 'Transcript'}</title>
        <script src="https://www.youtube.com/iframe_api" />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Terug
          </button>
        </div>
        {loading ? (
          <div className="text-center text-gray-600">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-2"></div>
            <p>Loading transcript...</p>
          </div>
        ) : (
          <div className="prose max-w-none">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{videoTitle}</h1>
              <div className="mb-6">
                {youtubeCode && (
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <iframe
                      ref={playerRef}
                      src={`https://www.youtube.com/embed/${youtubeCode}?enablejsapi=1`}
                      title={videoTitle}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg"
                    ></iframe>
                  </div>
                )}
                {/* {youtubeCode && (
                  <a 
                    href={`https://www.youtube.com/watch?v=${youtubeCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Watch on YouTube
                  </a>
                )} */}
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
              {parsedContent}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
