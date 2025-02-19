import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import SearchBar from '..//components/SearchBar';
import { Lora } from '@next/font/google';

const lora = Lora({ subsets: ['latin-ext'] })

export default function Home() {
  const [data, setMessage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkedNames, setCheckedNames] = useState([]);

  // In index.jsx, add this with other state declarations
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchingTranscripts, setIsSearchingTranscripts] = useState(false);

  const handleToggleCheckbox = (name) => {
    setCheckedNames((prevCheckedNames) => {
      if (prevCheckedNames.includes(name)) {
        return prevCheckedNames.filter((checkedName) => checkedName !== name);
      } else {
        return [...prevCheckedNames, name];
      }
    });
  };

  useEffect(() => {
    console.log(window.location.hostname)
    // const webdomain = "http://localhost:3000"
    const webdomain = "https://www.aireporttranscripts.com"


    fetch(`${webdomain}/api/episode_name`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        setMessage(data);
        setLoading(false);
      })
      .catch((error) => {
        // Handle the error here
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);
  

  const filteredEpisodes = data.filter((item) =>
    checkedNames.every((name) => item.members.includes(name))
  );

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Head>
        <title>AI report Transcripts</title>
        <meta property="og:title" content="AI Report Transcripts" key="title" />
      </Head>
      <div className="flex justify-center">
        <div className="bg-opacity-10 p-30 px-6 py-6 rounded-md mx-auto max-w-3/4 w-2/3 mt-8">
          <div className="flex justify-center">
            <Image src="/images/AI_report.png" alt="AI report" width={591} height={241} />
          </div>
          <div className="text-center text-5xl flex flex-col items-center py-6">
            <div style={lora.style}>
              AI Report Transcripts
            </div>
          </div>
          <div style={lora.style} className='text-center'>Lorum ipsum dolor sit amet, consectetur adipiscing elit</div>
          <SearchBar />   

          <div style={lora.style} className="text-3xl">Episodes:</div>
          {!loading ? (
  <>
    <ul className="list-inside mt-4 ">
      {filteredEpisodes.map((item, i) => (
        <li key={i} data-members={item.members} className="my-2">
          <Link href={`/episode/${item.slug}`}>
            <div className="transition-transform duration-200 flex items-center">
              <div className="text-blue-200 hover:underline ">{item.name}</div>
              {/* Add additional content inside the box if needed */}
              {/* For example: */}
              {/* <div className="text-gray-500">{item.description}</div> */}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  </>
      ) : (
    <div className="flex justify-center">
      <button type="button" className="" disabled>
          <div className="flex justify-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
