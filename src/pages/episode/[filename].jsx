import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Footer from '../../components/Footer';

export default function Episode() {
  const router = useRouter();
  const { filename } = router.query;
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(true);

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
        <title>Transcript: {filename}</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div>Loading transcript...</div>
        ) : (
          <div className="prose">
            <pre>{transcript}</pre>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
