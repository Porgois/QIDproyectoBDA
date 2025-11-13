import SearchBar from "./components/searchBar/searchBar.jsx"

function App() {

  const exampleData = [
  {
    id: 1,
    title: 'React Official Documentation',
    url: 'https://reactjs.org/',
    description: 'A site with all the documentation you could need.'
  },
  {
    id: 2,
    title: 'Mozilla Developer Network (MDN)',
    url: 'https://developer.mozilla.org/',
    description: 'A network for Mozilla developers.'
  },
  {
    id: 3,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
    description: 'Ask anything you need.'
  },
  {
    id: 4,
    title: 'GitHub',
    url: 'https://github.com/',
    description: 'Connect with githubbies.'
  },
  {
    id: 5,
    title: 'npm',
    url: 'https://www.npmjs.com/',
    description: 'npm explained.'
  },
   {
    id: 6,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
    description: 'Ask anything you need.'
  },
   {
    id: 7,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
    description: 'Ask anything you need.'
  },
   {
    id: 8,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
    description: 'Ask anything you need.'
  },
   {
    id: 9,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
    description: 'Ask anything you need.'
  },
   {
    id: 10,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
    description: 'Ask anything you need.'
  },
  {
    id: 11,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
    description: 'Ask anything you need.'
  },
   {
    id: 12,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
    description: 'Ask anything you need.'
  },
   {
    id: 13,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
    description: 'Ask anything you need.'
  },
   {
    id: 14,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
    description: 'Ask anything you need.'
  },
   {
    id: 15,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
    description: 'Ask anything you need.'
  },
   {
    id: 16,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
    description: 'Ask anything you need.'
  }, {
    id: 17,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
    description: 'Ask anything you need.'
  },
   {
    id: 18,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
    description: 'Ask anything you need.'
  },
   {
    id: 19,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
    description: 'Ask anything you need.'
  },
   {
    id: 20,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
    description: 'Ask anything you need.'
  },
   {
    id: 21,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
    description: 'Ask anything you need.'
  },
   {
    id: 22,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com/',
    description: 'Ask anything you need.'
  }
]

  return(
    <div className="App">
      <SearchBar sampleData={exampleData}/>
    </div>
  );
}

export default App
