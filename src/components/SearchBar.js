import React, { useState } from 'react';
import Link from 'next/link'
import { Lora } from '@next/font/google';

const lora = Lora({ subsets: ['latin-ext'] })


  const createYouTubeTimestampLink = (time, link) => {
    const youtubeLink = link
    console.log(youtubeLink);
    if (!youtubeLink) {
      return `#`;
    }
  
    // Parse the time into hours, minutes, and seconds
    // Use a regular expression to capture the first timestamp
    const match = time.match(/\[(\d{1,2}:\d{2}:\d{2}\.\d{3})/);
    time = match[1]; // Extracted timestamp

    const timeParts = time.split(':').map(Number); // Split time by colon and convert to numbers
    console.log(time)
    console.log(timeParts)
    let hours = 0, minutes = 0, seconds = 0;
  
    if (timeParts.length === 3) {
      [hours, minutes, seconds] = timeParts;
    } else if (timeParts.length === 2) {
      [minutes, seconds] = timeParts;
    } else if (timeParts.length === 1) {
      [seconds] = timeParts;
    }
  
    // Calculate total seconds for the timestamp
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  
    // Return the properly formatted YouTube link
    return `${youtubeLink}&t=${totalSeconds}s`;
};

  function CollapsibleSnippet({ index, timestamp, query, snippet, youtube }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleSnippet = () => setIsExpanded(!isExpanded);

    const preview = snippet.substring(0, 100); // Preview is the first 100 characters

    const highlightText = (text, keyword) => {
        const regex = new RegExp(`(${keyword})`, "gi"); // Case-insensitive match
        console.log(text)
        return text.replace(regex, `<span class="bg-yellow-200 text-black font-bold">$1</span>`);
    };

    return (
        <li className="space-y-2">
            {/* Timestamp as a clickable link */}
            <strong>
                <a
                    href={createYouTubeTimestampLink(timestamp, youtube)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                >
                    Fragment {index + 1}: {timestamp}
                </a>
            </strong>

            {/* Snippet text: preview or full */}
            <p
                className="text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{
                    __html: isExpanded
                        ? highlightText(snippet, query)
                        : highlightText(preview + "...", query),
                }}
            ></p>

            {/* Toggle button */}
            <button
                onClick={toggleSnippet}
                className="text-sm text-blue-400 hover:underline focus:outline-none"
            >
                {isExpanded ? "Show Less" : "Show More"}
            </button>
        </li>
    );
}


function SearchBar() {
    const [query, setQuery] = useState(''); // To store the search input
    const [results, setResults] = useState([]); // To store search results
    const [isLoading, setIsLoading] = useState(false); // To manage loading state
    const [error, setError] = useState(null); // To handle errors

    const handleSearch = async () => {
        if (!query) {
            alert('Please enter a search term');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/search?keyword=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch results');
            }

            const data = await response.json();
            setResults(data);


            results.map((result, index) => (
                // console.log(result.matches)));
                result.matches.map((match, index) => (
                    console.log(match.timestamp)))))
                // console.log(result.timestamp)

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <div className="text-xl">
                <h1 style={lora.style}>Locate Keywords in Episodes.</h1>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', color:'black'}}>
                <input
                    type="text"
                    placeholder="Enter a keyword..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{
                        flex: '1',
                        padding: '10px',
                        fontSize: '16px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                    }}
                />
                <button
                    onClick={handleSearch}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        background: '#572143',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Search
                </button>
            </div>

            {isLoading && <p>Loading...</p>}

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="mb-6">

            {/* Scrollable results container */}
            <div className="h-96 overflow-y-auto p-4 text-white rounded-lg shadow-lg" style= {{backgroundColor: '#572143'}}>
                {results.length > 0 ? (
                    results.map((result, index) => (
                        <div key={index} className="mb-6 border-b border-gray-700 pb-4 last:border-none">
                            <h3 className="text-lg font-semibold text-blue-400 mb-2">{result.file}</h3>
                            <ul className="space-y-4">
                                {result.matches.map((match, idx) => (
                                    <CollapsibleSnippet
                                        key={idx}
                                        index={idx}
                                        timestamp={match.timestamp}
                                        query={query}
                                        snippet={match.snippet}
                                        youtube={result.youtube}
                                    />
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400">No results found</p>
                )}
            </div>
        </div>
        </div>
    );
}

export default SearchBar;
