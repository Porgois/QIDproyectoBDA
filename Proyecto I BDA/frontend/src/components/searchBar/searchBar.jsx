import React, { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { searchApi } from '../../api/searchbarAPI'
import "../../index.css"

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault()
    setHasSearched(true);
    
    if (searchTerm.trim() === '') {
      setSearchResults([])
      return
    }

    setLoading(true)
    setError(null)

    const result = await searchApi.search(searchTerm)

    if (result.success && result.data.success) {
      setSearchResults(result.data.results || [])
    } else {
      setError(result.error || 'Error en la búsqueda')
      setSearchResults([])
    }

    setLoading(false)
  }

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setHasSearched(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-white py-64">
      <h1 className="title">Distributed Database Query</h1>
      
      <form onSubmit={handleSearch} className="mb-8 w-full max-w-2xl">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            className="w-full border border-gray-200 bg-white px-5 py-3 pr-20 text-base shadow-md transition-shadow duration-200 hover:shadow-lg focus:border-gray-300 focus:outline-none"
            placeholder="Search"
            disabled={loading}
          />
          <div className="absolute right-0 top-0 mr-4 mt-3 flex items-center">
            <button 
              type="submit" 
              className="text-blue-500 hover:text-blue-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Search size={20} />
              )}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mb-4 w-full max-w-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="search">
        {searchResults.length > 0 && (
          <>
            <h2 className="mb-4 text-xl font-bold text-left w-full">
              Search Results ({searchResults.length})
            </h2>
            <div className="search-result-box">
              <ul>
                {searchResults.map((result) => (
                  <li key={result.id} className="mb-4 pb-4 border-b last:border-b-0">
                    <h1 className="font-bold text-lg">{result.title}</h1>
                    
                      href={result.url}
                      className="text-blue-600 hover:underline text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    <a>
                      {result.url}
                    </a>
                    {result.description && (
                      <p className="text-gray-600 text-sm mt-1">{result.description}</p>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      Score: {result.score?.toFixed(2) || '0.00'} | Sources: {result.sources?.join(', ') || 'N/A'}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {!loading && hasSearched && searchTerm && searchResults.length === 0 && !error && (
          <div className="text-center text-gray-500 py-8">
            No se encontraron resultados para "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchBar