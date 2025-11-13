from time import sleep
from crawler import Crawler
import sys

if __name__ == '__main__':
    if len(sys.argv) > 1:
        config_file = sys.argv[1]
        crawler = Crawler(config_file=config_file)
        crawler.run()