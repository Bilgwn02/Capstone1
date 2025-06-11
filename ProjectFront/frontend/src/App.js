// PROJECTFRONT/frontend/src/App.js
import React, { useState, useEffect } from 'react';
import './App.css'; // Assuming you have an App.css for basic styling

function App() {
  const [lookupTypes, setLookupTypes] = useState([]); // State to store distinct lookup types for the dropdown
  const [selectedType, setSelectedType] = useState(''); // State to store the currently selected lookup type
  const [lookupInfo, setLookupInfo] = useState([]);     // State to store the detailed information for the selected type
  const [loading, setLoading] = useState(false);        // State for loading indicator
  const [error, setError] = useState(null);             // State for error messages

  // Determine the backend URL.
  // In a Docker Compose setup, this would be 'http://backend:3000' (if 'backend' is your service name).
  // For local development outside Docker, it's typically 'http://localhost:3000'.
  // We use process.env.REACT_APP_BACKEND_URL which should be set in your .env file in React
  // or via Docker environment variables.
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

  // --- Effect to Fetch Lookup Types on Component Mount ---
  useEffect(() => {
    const fetchTypes = async () => {
      setLoading(true); // Set loading to true while fetching
      setError(null);   // Clear any previous errors
      try {
        const response = await fetch(`${BACKEND_URL}/lookup/lookupTypes`); // Call your backend endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setLookupTypes(data); // Update state with fetched types
        if (data.length > 0) {
          setSelectedType(data[0]); // Automatically select the first type in the dropdown
        }
      } catch (err) {
        console.error("Error fetching lookup types:", err);
        setError("Failed to fetch lookup types. Please ensure the backend is running and accessible.");
      } finally {
        setLoading(false); // Set loading to false when done
      }
    };

    fetchTypes();
  }, []); // The empty dependency array ensures this effect runs only once on component mount

  // --- Effect to Fetch Relevant Information when Selected Type Changes ---
  useEffect(() => {
    const fetchInfoByType = async () => {
      if (!selectedType) {
        setLookupInfo([]); // Clear info if no type is selected
        return;
      }

      setLoading(true); // Set loading to true
      setError(null);   // Clear errors
      try {
        // Call your /byType endpoint, encoding the selected type for URL safety
        const response = await fetch(`${BACKEND_URL}/lookup/byType?type=${encodeURIComponent(selectedType)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setLookupInfo(data); // Update state with filtered info
      } catch (err) {
        console.error(`Error fetching info for type "${selectedType}":`, err);
        setError(`Failed to fetch information for "${selectedType}".`);
      } finally {
        setLoading(false); // Set loading to false
      }
    };

    fetchInfoByType();
    // Re-run this effect whenever 'selectedType' changes, or if BACKEND_URL changes
  }, [selectedType, BACKEND_URL]);

  // --- Event Handler for Dropdown Selection ---
  const handleTypeChange = (event) => {
    setSelectedType(event.target.value); // Update selected type state based on dropdown change
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>SQL Lookup Data Viewer</h1>
      </header>
      <main>
        {loading && <p>Loading data...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}

        <div className="dropdown-container">
          <label htmlFor="lookupTypeSelect">Select Lookup Type:</label>
          <select
            id="lookupTypeSelect"
            value={selectedType}
            onChange={handleTypeChange}
            disabled={loading || lookupTypes.length === 0} // Disable dropdown while loading or if no types
          >
            {lookupTypes.length === 0 && !loading && (
              <option value="">No types available</option>
            )}
            {lookupTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="lookup-info-container">
          <h2>Relevant Information for "{selectedType}"</h2>
          {lookupInfo.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Lookup ID</th>
                  <th>Source</th>
                  <th>Type</th>
                  <th>Code</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {lookupInfo.map((item) => (
                  <tr key={item.LookupID}>
                    <td>{item.LookupID}</td>
                    <td>{item.LookupSrc}</td>
                    <td>{item.LookupType}</td>
                    <td>{item.LookupCode}</td>
                    <td>{item.Description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            !loading && selectedType && <p>No information available for the selected type.</p>
          )}
           {/* Only show 'No info' if not loading and a type is selected */}
        </div>
      </main>
    </div>
  );
}

export default App;