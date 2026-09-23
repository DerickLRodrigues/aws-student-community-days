#!/usr/bin/env python3
"""Check real HTTP routing, security headers and the custom 404 after deployment."""
import argparse
from pathlib import Path
import urllib.error
import urllib.request
from urllib.parse import urlsplit


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('url')
    parser.add_argument('--check-www', action='store_true')
    args = parser.parse_args()
    base = args.url.rstrip('/')
    expected_404 = (Path(__file__).resolve().parents[1] / '404.html').read_bytes()
    opener = urllib.request.build_opener(NoRedirect())
    cases = {'/': 200, '/belo-horizonte/': 200, '/belo-horizonte?ano=2026': 301,
             '/styles.css': 200, '/dados.js': 200, '/sitemap.xml': 200,
             '/robots.txt': 200, '/nao-existe-mesmo': 301, '/nao-existe-mesmo/': 404,
             '/infra/deploy-config.json': 404, '/.git/config': 404}
    for path, expected in cases.items():
        try:
            response = opener.open(base + path, timeout=30)
        except urllib.error.HTTPError as exc:
            response = exc
        with response:
            body = response.read()
            assert response.code == expected, f'{path}: expected {expected}, got {response.code}'
            if expected == 301:
                assert response.headers['Location'].endswith(path.split('?')[0] + '/' + ('?ano=2026' if '?' in path else ''))
            else:
                for header in ('Strict-Transport-Security', 'Content-Security-Policy', 'X-Content-Type-Options', 'X-Frame-Options'):
                    assert response.headers.get(header), f'{path}: missing {header}'
                if expected == 404:
                    assert body == expected_404, f'{path}: did not return the custom 404 page'
                else:
                    assert len(body) > 0
                if path == '/styles.css':
                    assert 'text/css' in response.headers.get('Content-Type', '')
                if path == '/dados.js':
                    assert 'javascript' in response.headers.get('Content-Type', '')
            print(f'PASS {expected} {path}')

    if args.check_www:
        hostname = urlsplit(base).hostname
        assert hostname and not hostname.endswith('.cloudfront.net'), '--check-www needs the canonical domain URL'
        request = urllib.request.Request(f'https://www.{hostname}/belo-horizonte?ano=2026')
        try:
            response = opener.open(request, timeout=30)
        except urllib.error.HTTPError as exc:
            response = exc
        with response:
            assert response.code == 301, f'www: expected 301, got {response.code}'
            assert response.headers['Location'] == f'https://{hostname}/belo-horizonte/?ano=2026'
        print(f'PASS 301 https://www.{hostname}/ -> https://{hostname}/')


if __name__ == '__main__':
    main()
