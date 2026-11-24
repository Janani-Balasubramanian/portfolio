"""Dependency-free checks and a portable publish directory. Run from repo root."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import re
import shutil

root = Path(__file__).resolve().parent.parent
class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path, self.ids, self.refs = path, [], []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        for key in ('src', 'href'):
            if key in a: self.refs.append(a[key])

for name in ('index.html', '404.html'):
    page = Page(root / name)
    page.feed(page.path.read_text(encoding='utf-8'))
    assert len(page.ids) == len(set(page.ids)), f'Duplicate IDs in {name}'
    for ref in page.refs:
        url = urlsplit(ref)
        if url.scheme or url.netloc: continue
        if url.path:
            target = (page.path.parent / unquote(url.path)).resolve()
            assert target.is_relative_to(root) and target.is_file(), f'Missing asset: {ref}'
        elif url.fragment:
            assert url.fragment in page.ids, f'Missing section: {ref}'
for css in (root / 'style.css', root / 'assets/fonts/fonts.css'):
    for ref in re.findall(r'url\([\s\"\']*([^\)\"\'\s]+)', css.read_text(encoding='utf-8')):
        assert not ref.startswith(('https:', 'http:')), f'External runtime asset: {ref}'
        assert (css.parent / ref).is_file(), f'Missing font: {ref}'
assert (root / 'Janani_B_Resume.pdf').read_bytes().startswith(b'%PDF-'), 'Resume is not a PDF'
html = (root / 'index.html').read_text(encoding='utf-8')
assert 'fonts.googleapis.com' not in html, 'External font dependency returned'
out = root / 'dist'
out.mkdir(exist_ok=True)
for name in ('index.html', '404.html', 'style.css', 'app.js', 'Janani_B_Resume.pdf', '.nojekyll'):
    shutil.copy2(root / name, out / name)
shutil.copytree(root / 'assets', out / 'assets', dirs_exist_ok=True)
print('PASS: local assets, section links, font files and resume. Portable site prepared in dist/.')
