from configparser import ConfigParser
import pika
import json
import os

from crawler.webcrawler import WebCrawler
from crawler.explorer import Explorer

class Crawler:
    def __init__(self, config_file: str = None):
        try:
            configparser = ConfigParser()
            configparser.read(config_file)

            if not os.path.exists(config_file):
                raise Exception("Config File not found")

            username = configparser.get('rabbitmq', 'username', fallback='guest')
            password = configparser.get('rabbitmq', 'password', fallback='guest')
            self.host = configparser.get('rabbitmq', 'host', fallback='localhost')
            self.port = configparser.getint('rabbitmq', 'port', fallback=5672)

            self.credentials = pika.PlainCredentials(username=username
                                                    , password=password)
            
            self._create_queues_()
        except Exception as e:
            print(f"Error reading configuration: {e}")
            raise

    def _open_connection_(self):
        # print(f"Host : {self.host}, Port: {self.port}")
        conn_param = pika.ConnectionParameters(host=self.host, port=self.port
                                      , credentials=self.credentials)
        self.connection = pika.BlockingConnection(conn_param)

    def _create_queues_(self):
        self._open_connection_()
        channel = self.connection.channel()

        channel.queue_declare(queue='page-metadata')
        channel.queue_declare(queue='page-content')
        channel.queue_declare(queue='page-index')

        channel.basic_publish(exchange='', routing_key='page-metadata', body='SELECT name FROM sys.databases;')

        self.connection.close()     

    def run(self):
        explorer = Explorer()
        urls = explorer.get_url_list()

        crawler = WebCrawler()
        for url in urls:
            metadata, content = crawler.process_page(url)
            if len(metadata) > 0 and len(content) > 0:
                self._save_metadata_(metadata)
                self._save_content_(content)

    def _save_metadata_(self, metadata: dict):
        self._open_connection_()
        channel = self.connection.channel()

        page_metadata = json.dumps(metadata)
        channel.basic_publish(exchange='', routing_key='page-metadata', body=page_metadata)

        self.connection.close()

    def _save_content_(self, content: dict):
        self._open_connection_()
        channel = self.connection.channel()

        page_content = json.dumps(content)
        channel.basic_publish(exchange='', routing_key='page-content', body=page_content)

        self.connection.close()