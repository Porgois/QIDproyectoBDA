import mysql.connector, json
from configparser import ConfigParser
from pika.adapters.blocking_connection import BlockingChannel
from pika.spec import Basic, BasicProperties

# from consumer.index_handler import IndexHandler

class MetadataHandler:
    DATABASE_TYPE = 'mysql'
    def __init__(self, config: ConfigParser):
        self.host = config.get(MetadataHandler.DATABASE_TYPE, 'host', fallback='localhost')
        self.port = config.getint(MetadataHandler.DATABASE_TYPE, 'port', fallback=3306)
        self.user_file = config.get(MetadataHandler.DATABASE_TYPE, 'username_file'
                                    , fallback='/run/secrets/MYSQL_USER')
        self.pass_file = config.get(MetadataHandler.DATABASE_TYPE, 'password_file'
                                    , fallback='/run/secrets/MYSQL_PASSWORD')
        self.database = config.get(MetadataHandler.DATABASE_TYPE, 'database'
                                   , fallback='metadata_db')
        self.table = config.get(MetadataHandler.DATABASE_TYPE, 'table'
                                , fallback='page_metadata')

    def handle(self, ch: BlockingChannel, method: Basic.Deliver
                     , properties: BasicProperties, body: bytes):
        
        parsed_body = json.loads(body)
        sql_insert = "INSERT INTO metadata_table (url, title, description, crawled_at) VALUES (%s, %s, %s, %s)"
        values = (parsed_body['url'], parsed_body['title'], parsed_body['description'], parsed_body['description'])

    def _send_to_database_(self, sql_query: str, values: tuple):
        try:
            connection = mysql.connector.connect(
                host=self.host,
                port=self.port,
                user=self._read_secret_(self.user_file),
                password=self._read_secret_(self.pass_file),
                database=self.database
            )
            cursor = connection.cursor()
            cursor.execute(sql_query, values)
            connection.commit()
            print(f"{cursor.rowcount} rows affected.")
            cursor.close()
            connection.close()
        except mysql.connector.Error as e:
            print(f"Database error: {e}")

    def _send_to_indexer_(self, content):
        pass

    def _read_secret_(self, filepath: str) -> str:
        with open(filepath, "r") as file:
            secret = file.read()
        return secret