from configparser import ConfigParser
import pika

from crawler.webcrawler import WebCrawler
from crawler.explorer import Explorer

class Crawler:
    def __init__(self, config_file: str = None):
        try:
            configparser = ConfigParser()
            configparser.read(config_file)

            username = configparser.get('rabbitmq', 'username', fallback='guest')
            password = configparser.get('rabbitmq', 'password', fallback='guest')
            self.host = configparser.get('rabbitmq', 'host', fallback='localhost')
            self.port = configparser.getint('rabbitmq', 'port', fallback=5672)

            self.credentials = pika.PlainCredentials(username=username
                                                    , password=password)
        except Exception as e:
            print(f"Error reading configuration: {e}")
            raise                                

    def run(self):
        # self._connect_()

        explorer = Explorer()
        urls = explorer.get_url_list()

        crawler = WebCrawler()
        for url in urls:
            crawler.process_page(url)

    def _connect_(self):
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(self.host, self.port
                                      , credentials=self.credentials))
        channel = connection.channel()

        channel.queue_declare(queue='hello')
        channel.basic_publish(exchange='', routing_key='hello', body='Hello World!')
        print(" [x] Sent 'Hello World!'")

        channel.close()
        connection.close()