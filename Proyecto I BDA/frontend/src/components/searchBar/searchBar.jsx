import React, { useState, useCallback, useEffect } from 'react'
import { Search} from 'lucide-react'
import "../../index.css";

const SearchBar = ({sampleData}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
 
  const debounce = (func, delay) => {
    let timeoutId
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }
 
  const handleSearch = useCallback(() =>
    debounce((term) => {
      if (term.trim() === '') {
        setSearchResults([])
      } else {
        const results = sampleData.filter((item) =>
          item.title.toLowerCase().includes(term.toLowerCase()),
        )
        setSearchResults(results)
      }
    }, 300),
    [sampleData],
  )
 
  useEffect(() => {
    handleSearch(searchTerm)
  }, [searchTerm, handleSearch])
 
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value)
  }
 
  return (
    <div className="flex min-h-screen flex-col items-center bg-white py-64">
      <h1 className="title">Distributed Database Query</h1>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="mb-8 w-full max-w-2xl"
      >
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            className="w-full border border-gray-200 bg-white px-5 py-3 pr-20 text-base shadow-md transition-shadow duration-200 hover:shadow-lg focus:border-gray-300 focus:outline-none"
            placeholder="Search"
          />
          <div className="absolute right-0 top-0 mr-4 mt-3 flex items-center">
            <button type="submit" className="text-blue-500 hover:text-blue-600">
              <Search size={20} />
            </button>
          </div>
        </div>
      </form>
        <div className="search">
            {searchResults.length > 0 && (
                <>
                <h2 className="mb-4 text-xl font-bold text-left w-full">Search Results</h2>
                <div className="search-result-box">
                    <ul>
                    {searchResults.map((result) => (
                        <li key={result.id} className="mb-2">
                        <h1>{result.title}</h1>
                        <a
                            href={result.url}
                            className="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {result.url}
                        </a>
                        </li>
                    ))}
                    </ul>
                </div>
                </>
            )}
        </div>
            
     
    </div>
  )
}
 
export default SearchBar

// The previous code was heavily based on the one found in: 
// https://tomdekan.com/articles/react-search-bar?ref=ty
