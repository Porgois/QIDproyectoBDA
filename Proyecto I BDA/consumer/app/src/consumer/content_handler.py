import pymongo
from configparser import ConfigParser
from pika.adapters.blocking_connection import BlockingChannel
from pika.spec import Basic, BasicProperties

class ContentHandler:
    DATABASE_TYPE = 'mongo'
    def __init__(self, config: ConfigParser):
        self.host = config.get(ContentHandler.DATABASE_TYPE, 'host', fallback='localhost')
        self.port = config.getint(ContentHandler.DATABASE_TYPE, 'port', fallback=3306)
        self.user_file = config.get(ContentHandler.DATABASE_TYPE, 'username_file'
                                    , fallback='/run/secrets/MYSQL_USER')
        self.pass_file = config.get(ContentHandler.DATABASE_TYPE, 'password_file'
                                    , fallback='/run/secrets/MYSQL_PASSWORD')
        self.database = config.get(ContentHandler.DATABASE_TYPE, 'database'
                                   , fallback='metadata_db')
        self.table = config.get(ContentHandler.DATABASE_TYPE, 'table'
                                , fallback='page_metadata')

    def handle(self, ch: BlockingChannel, method: Basic.Deliver
                     , properties: BasicProperties, body: bytes):
        pass

    def _send_to_database_(self, content):
        pass

    def _send_to_indexer_(self, content):
        pass