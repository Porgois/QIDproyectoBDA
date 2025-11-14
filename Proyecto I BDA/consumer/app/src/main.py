from consumer import Consumer
import sys

if __name__ == "__main__":
    if len(sys.argv) > 1:
        config_file = sys.argv[1]
        consumer = Consumer(config_file=config_file)
        consumer.consume_indefinitely()
    else:
        print("Nope")