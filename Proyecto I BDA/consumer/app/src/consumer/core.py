import pika, json, os
from pika.adapters.blocking_connection import BlockingChannel
from pika.spec import Basic, BasicProperties
from configparser import ConfigParser

from consumer.metadata_handler import MetadataHandler

class Consumer:
    def __init__(self, config_file: str):
        try:
            configparser = ConfigParser()
            configparser.read(config_file)

            self.mh = MetadataHandler(configparser)

            self.credentials = pika.PlainCredentials(
                username=configparser.get('rabbitmq', 'username', fallback='guest'),
                password=configparser.get('rabbitmq', 'password', fallback='guest')
            )
            self.host = configparser.get('rabbitmq', 'host', fallback='localhost')
            self.port = configparser.getint('rabbitmq', 'port', fallback=5672)

            self._create_queues_()
        except Exception as e:
            print(f"Error reading configuration: {e}")
            raise

    def _open_connection_(self):
        conn_param = pika.ConnectionParameters(host=self.host, port=self.port
                                      , credentials=self.credentials
                                      , heartbeat=600
                                      , blocked_connection_timeout=300
                                      , connection_attempts=3
                                      , retry_delay=2
                                      , socket_timeout=5)
        self.connection = pika.BlockingConnection(conn_param)

    def _create_queues_(self):
        self._open_connection_()
        channel = self.connection.channel()

        channel.queue_declare(queue='page-metadata')
        channel.queue_declare(queue='page-content')
        channel.queue_declare(queue='page-index')

        self.connection.close()   

    def consume_indefinitely(self):
        self._open_connection_()

        self._unified_consume_()
        pass

    def _unified_consume_(self):
        channel = self.connection.channel()

        self._receive_content_(channel)
        self._receive_metadata_(channel)
        
        print(' [*] Waiting for messages. To exit press CTRL+C')
        channel.start_consuming()

    def _receive_metadata_(self, channel: BlockingChannel):
        def callback(ch: BlockingChannel, method: Basic.Deliver
                     , properties: BasicProperties, body: bytes):
            self.mh.handle(ch, method, properties, body)

        channel.basic_consume(queue='page-metadata'
                              , on_message_callback=callback
                              , auto_ack=True)

    def _receive_content_(self, channel):
        def callback(ch: BlockingChannel, method: Basic.Deliver
                     , properties: BasicProperties, body: bytes):
            print(f" [x] Received {body}")
            
        channel.basic_consume(queue='page-content'
                              , on_message_callback=callback
                              , auto_ack=True)