import requests
from bs4 import BeautifulSoup
import math

class Explorer:
    URL_LIST_FILE = "config/url_list.txt"
    URL_COLLECTION = "https://news.ycombinator.com/"

    def __init__(self):
        self.urls = []

    def get_url_list(self):
        if not self._read_urls_():
            self._obtain_from_internet_()
        return self.urls.copy()
    
    def _obtain_from_internet_(self):
        url_num = 500
        urls_per_page = 30

        for page in range(0, math.ceil(url_num / urls_per_page)):
            self._parse_collection_page_(page)
        self._save_urls_()
    
    def _parse_collection_page_(self, page: int):
        if page > 1:
            content = requests.get(f"{Explorer.URL_COLLECTION}?p={page}")
        else:
            content = requests.get(Explorer.URL_COLLECTION)

        soup = BeautifulSoup(content.text, "lxml")
        submissions = soup.find_all('span', class_='titleline')
        for submission in submissions:
            self.urls.append(submission.find('a').get('href'))

    def _save_urls_(self):
        with open(Explorer.URL_LIST_FILE, "w+") as file:
            for url in self.urls:
                file.write(f"{url}\n")

    def _read_urls_(self):
        try:
            with open(Explorer.URL_LIST_FILE, "r") as file:
                for line in file:
                    self.urls.append(line)
            return True
        except FileNotFoundError as fnf:
            print("No url list found, attempting collecting from internet")
            return False