import requests
from bs4 import BeautifulSoup
from http import HTTPStatus

class WebCrawler:
    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
    }

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
            return {}, {}
        except Exception as e:
            print(f"Other Exception on page {url}: {e}")
            return {}, {}


    def _fetch_page_(self, url: str) -> str:
        response = requests.get(url, headers=WebCrawler.HEADERS, allow_redirects=True)
        if response.status_code >= HTTPStatus.OK and response.status_code < HTTPStatus.UNAUTHORIZED:
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

        if page_content['paragraphs'] == [] and page_content['list-items'] == [] and page_content['image'] == []:
            page_content = {}

        return page_content

