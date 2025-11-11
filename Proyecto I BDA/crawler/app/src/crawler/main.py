import pika

class Crawler:
    def __init__(self):
        self.credentials = pika.PlainCredentials(username='aDmIn-rabit_mq', password="hwr9W@658%ExJw2ENmptt6sYj@1Ygh^m")
        pass

    def run(self):
        self._connect_()

    def _connect_(self):
        connection = pika.BlockingConnection(pika.ConnectionParameters('localhost', credentials=self.credentials))
        channel = connection.channel()

        channel.queue_declare(queue='hello')

        channel.basic_publish(exchange='',
                      routing_key='hello',
                      body='Hello World!')
        print(" [x] Sent 'Hello World!'")

        channel.close()
        connection.close()
        pass