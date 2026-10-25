"""Start the website locally using only Python's standard library."""
import functools
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
import webbrowser

if __name__ == '__main__':
    root = Path(__file__).resolve().parent
    handler = functools.partial(SimpleHTTPRequestHandler, directory=str(root))
    try:
        server = ThreadingHTTPServer(('127.0.0.1', 8000), handler)
    except OSError as error:
        print('Cannot start on port 8000:', error)
        print('Stop the other server, or follow the README to choose a port.')
        raise SystemExit(1)
    url = 'http://localhost:8000'
    print('Am - Phong luyen phat am:', url, '\nPress Ctrl+C to stop.')
    threading.Timer(0.5, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')
    finally:
        server.server_close()
