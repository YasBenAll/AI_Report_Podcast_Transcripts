import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
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

  const formatTimestamp = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}m${seconds}s`;
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
        const youtubeTimestamp = formatTimestamp(parseFloat(start));
        return (
          <div key={index} className="mb-4">
            <a 
              href={`https://www.youtube.com/watch?v=${youtubeCode}&t=${youtubeTimestamp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 hover:bg-blue-200 transition-colors duration-200"
            >
              {start} → {end}
            </a>
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
    fetch(`http://localhost:5328/api/transcripts/${filename}.txt`)
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
  }, [filename]);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Head>
        <title>{videoTitle || 'Transcript'}</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center text-gray-600">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-2"></div>
            <p>Loading transcript...</p>
          </div>
        ) : (
          <div className="prose max-w-none">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{videoTitle}</h1>
              {youtubeCode && (
                <a 
                  href={`https://www.youtube.com/watch?v=${youtubeCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Watch on YouTube
                </a>
              )}
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
