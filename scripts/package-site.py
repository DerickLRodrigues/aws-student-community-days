#!/usr/bin/env python3
"""Package only public site files; never publish the repository itself."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / '.build' / 'site'
PUBLIC_SUFFIXES = {'.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.avif',
                   '.svg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.pdf', '.mp4', '.webm'}


def package():
    files = []
    for path in ROOT.rglob('*'):
        rel = path.relative_to(ROOT)
        if any(part.startswith('.') for part in rel.parts) or rel.parts[0] in {'infra', 'scripts', 'tests', 'node_modules'}:
            continue
        if path.is_file() and (path.suffix.lower() in PUBLIC_SUFFIXES or rel.as_posix() in {'robots.txt', 'sitemap.xml'}):
            if path.is_symlink():
                raise ValueError(f'Symlink not allowed: {rel}')
            files.append(path)
    for required in ('index.html', '404.html', 'belo-horizonte/index.html', 'styles.css', 'dados.js'):
        if ROOT / required not in files:
            raise ValueError(f'Missing required site file: {required}')
    # Fixed generated directory, always inside this repository.
    if DEST.resolve() != ROOT / '.build' / 'site':
        raise ValueError('Build directory must not redirect outside the repository')
    if DEST.exists():
        shutil.rmtree(DEST)
    for source in sorted(files):
        target = DEST / source.relative_to(ROOT)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
    print(f'Packaged {len(files)} public files ({sum(p.stat().st_size for p in files):,} bytes) into {DEST}')


if __name__ == '__main__':
    package()
