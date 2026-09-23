#!/usr/bin/env python3
"""Upload a packaged site using AWS CLI, then wait for CDN invalidation."""
import argparse
import json
import mimetypes
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
CACHE = 'public, max-age=0, must-revalidate, s-maxage=86400'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--profile')
    parser.add_argument('--aws-cli', default=shutil.which('aws') or 'aws')
    args = parser.parse_args()
    config = json.loads((ROOT / 'infra/deploy-config.json').read_text(encoding='utf-8'))
    for key in ('bucket', 'distribution_id', 'region'):
        if not config.get(key) or config[key].startswith('PENDING'):
            parser.error(f'Configure {key} in infra/deploy-config.json first')
    cli = [args.aws_cli, '--region', config['region'], '--no-cli-pager']
    if args.profile:
        cli += ['--profile', args.profile]

    def aws(*command, capture=False):
        return subprocess.run(cli + list(command), check=True, text=True,
                              stdout=subprocess.PIPE if capture else None).stdout

    site = ROOT / '.build/site'
    if not (site / 'index.html').is_file():
        parser.error('Run python scripts/package-site.py first')
    # Assets first, HTML last: never advertise a new page before its assets exist.
    # No --delete: old assets remain available to tabs opened before deployment.
    files = sorted(site.rglob('*'), key=lambda p: (p.suffix == '.html', p.as_posix()))
    for path in files:
        if not path.is_file():
            continue
        key = path.relative_to(site).as_posix()
        content_type = {'.js': 'application/javascript', '.css': 'text/css',
                        '.html': 'text/html', '.svg': 'image/svg+xml'}.get(path.suffix)
        content_type = content_type or mimetypes.guess_type(key)[0] or 'application/octet-stream'
        if content_type.startswith('text/') or content_type in {'application/javascript', 'application/xml'}:
            content_type += '; charset=utf-8'
        aws('s3', 'cp', str(path), f"s3://{config['bucket']}/{key}",
            '--content-type', content_type, '--cache-control', CACHE, '--only-show-errors')
    result = json.loads(aws('cloudfront', 'create-invalidation', '--distribution-id',
                           config['distribution_id'], '--paths', '/*', '--output', 'json', capture=True))
    invalidation_id = result['Invalidation']['Id']
    print(f'Waiting for invalidation {invalidation_id}...', flush=True)
    aws('cloudfront', 'wait', 'invalidation-completed', '--distribution-id',
        config['distribution_id'], '--id', invalidation_id)
    print(f"Published: https://{config['cloudfront_domain']}")


if __name__ == '__main__':
    main()
