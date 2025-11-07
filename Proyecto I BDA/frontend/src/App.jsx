import SearchBar from "./components/searchBar/searchBar.jsx"

function App() {

  const exampleData = [
  {
    id: 1,
    title: 'React Official Documentation',
    url: 'https://reactjs.org/',
  },
  {
    id: 2,
    title: 'Mozilla Developer Network (MDN)',
    url: 'https://developer.mozilla.org/',
  },
  {
    id: 3,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
  },
  {
    id: 4,
    title: 'GitHub',
    url: 'https://github.com/',
  },
  {
    id: 5,
    title: 'npm',
    url: 'https://www.npmjs.com/',
  },
   {
    id: 6,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
  },
   {
    id: 7,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
  },
   {
    id: 8,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
  },
   {
    id: 9,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
  },
   {
    id: 10,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
  },
  {
    id: 11,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
  },
   {
    id: 12,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
  },
   {
    id: 13,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
  },
   {
    id: 14,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
  },
   {
    id: 15,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
  },
   {
    id: 16,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
  }, {
    id: 17,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
  },
   {
    id: 18,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
  },
   {
    id: 19,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
  },
   {
    id: 20,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
  },
   {
    id: 21,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
  },
   {
    id: 22,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
  }
]

  return(
    <div className="App">
      <SearchBar sampleData={exampleData}/>
    </div>
  );
}

export default App
