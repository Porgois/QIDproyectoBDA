import requests
from bs4 import BeautifulSoup

class WebCrawler:
    def __init__(self):
        pass

    def process_page(self, url: str):
        try:
            html = self._fetch_page_(url)
            metadata = self._extract_metadata_(url, html)
            content = self._extract_content_(html)
            return metadata, content
        except requests.RequestException as e:
            print(f"Error fetching page {url}: {e}")
        except Exception as e:
            print(f"Other Exception on page {url}: {e}")


    def _fetch_page_(self, url: str) -> str:
        response = requests.get(url)
        if response.status_code >= 200 and response.status_code < 300:
            return response.text
        else:
            raise Exception(f"Return code: {response.status_code}")
    
    def _extract_metadata_(self, url: str, html: str) -> dict:
        page_metadata = { 'url': url  }

        soup = BeautifulSoup(html, 'lxml')
        page_metadata['title'] = soup.find('title').text
        page_metadata['first-headers'] = [ h.text for h in soup.find_all('h1') ]
        page_metadata['datetimes'] = [ dt.text for dt in soup.find_all('time') ]

        return page_metadata
    
    def _extract_content_(self, html: str) -> dict:
        page_content = {}
        
        soup = BeautifulSoup(html, 'lxml')
        paragraphs = soup.find_all('p') or []
        list_items = soup.find_all('li') or []
        images = soup.find_all('img') or []

        page_content['paragraphs'] = [ p.text for p in paragraphs]
        page_content['list-items'] = [ p.text for p in list_items]
        page_content['image'] = [ p.get('src') for p in images]

        return page_content

