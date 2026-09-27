#!/usr/bin/env python3
"""Turn a free photo from Wikimedia Commons into one of the app's painted illustrations.

    pip install numpy opencv-python-headless
    python3 tools/dipingi.py "File:Colosseo 2020.jpg" colosseo --nome "Colosseo"
    python3 tools/dipingi.py "File:....jpg" tramonto --cielo          # header panorama

It writes img/luoghi/<id>.webp (1200x750) and <id>-s.webp (480x300), or img/cielo/<id>.webp (1800 wide),
and adds or updates the entry in img/credits.json (author and licence are shown in
Settings -> Image credits: they are required by CC BY / CC BY-SA). Only use photos with a
free licence (CC0, public domain, CC BY, CC BY-SA). The look is a LIGHT watercolour: a small
generalised Kuwahara filter (soft strokes that keep the edges) with the fine detail of the photo
added back, then sharpened. Keep it light: the user found the heavier painting too blurry.
"""
import argparse, html, json, os, re, urllib.parse, urllib.request
import cv2, numpy as np

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = {'User-Agent': 'ItalianoApp/1.0 (https://github.com/andrisis2/App-Italiano-; educational PWA)'}

def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return r.read()

def commons(title, width):
    q = dict(action='query', format='json', titles=title, prop='imageinfo', iiprop='url|extmetadata', iiurlwidth=width)
    pg = list(json.loads(get('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(q)))['query']['pages'].values())[0]
    ii = pg['imageinfo'][0]; em = ii.get('extmetadata', {})
    clean = lambda k: html.unescape(re.sub(r'<[^>]+>', '', (em.get(k) or {}).get('value', ''))).strip()
    img = cv2.imdecode(np.frombuffer(get(ii['thumburl']), np.uint8), cv2.IMREAD_COLOR)
    return img, dict(titolo=pg['title'].replace('File:', ''), autore=' '.join(clean('Artist').split()) or 'unknown',
                     licenza=clean('LicenseShortName'), licurl=clean('LicenseUrl'), fonte=ii['descriptionurl'])

def grana(h, w, seed=11):
    rng = np.random.default_rng(seed); t = np.zeros((h, w), np.float32)
    for s, a in ((1, .5), (3, .3), (9, .2)):
        n = rng.standard_normal((h // s + 2, w // s + 2)).astype(np.float32)
        t += a * cv2.resize(n, (w, h), interpolation=cv2.INTER_CUBIC)
    return t

def livelli(img, lo=.5, hi=99.6):
    L = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY); a, b = np.percentile(L, lo), np.percentile(L, hi)
    return np.clip((img.astype(np.float32) - a) * 255.0 / max(b - a, 1), 0, 255).astype(np.uint8)

def kuwahara(img, r, q=8):
    f = img.astype(np.float32); L = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    yy, xx = np.mgrid[-r:r + 1, -r:r + 1].astype(np.float32)
    ang, rad = np.arctan2(yy, xx), np.hypot(xx, yy)
    g = np.exp(-rad ** 2 / (2 * (r / 2.0) ** 2)) * (rad <= r)
    num = np.zeros_like(f); den = np.zeros(L.shape, np.float32)
    for k in range(8):                                    # 8 circular sectors
        d = np.angle(np.exp(1j * (ang - (-np.pi + k * np.pi / 4 + np.pi / 8))))
        w = g * np.exp(-d ** 2 / (2 * (np.pi / 8) ** 2)); w[r, r] = g[r, r]; w = (w / w.sum()).astype(np.float32)
        m = cv2.filter2D(f, -1, w, borderType=cv2.BORDER_REFLECT)
        mL = cv2.filter2D(L, -1, w, borderType=cv2.BORDER_REFLECT)
        var = np.maximum(cv2.filter2D(L * L, -1, w, borderType=cv2.BORDER_REFLECT) - mL * mL, 0) + 1.0
        wt = 1.0 / var ** (q / 8.0); num += m * wt[..., None]; den += wt
    return np.clip(num / den[..., None], 0, 255).astype(np.uint8)

def dipingi(img, out_w, r=6, detail=.3, lift=.08, sat=1.12, warm=.03, sharpen=.5):
    h, w = img.shape[:2]; work = min(1920, w)
    img = livelli(cv2.resize(img, (work, int(h * work / w)), interpolation=cv2.INTER_AREA), .3, 99.7)
    f = kuwahara(cv2.bilateralFilter(img, 5, 25, 5), r).astype(np.float32)
    o = img.astype(np.float32); f += detail * (o - cv2.GaussianBlur(o, (0, 0), 1.6))   # the photo's fine detail
    lab = cv2.cvtColor(np.clip(f, 0, 255).astype(np.uint8), cv2.COLOR_BGR2LAB).astype(np.float32); L = lab[..., 0] / 255
    lab[..., 0] = np.clip(L + lift * (1 - L) ** 2, 0, 1) * 255
    hsv = cv2.cvtColor(cv2.cvtColor(lab.astype(np.uint8), cv2.COLOR_LAB2BGR), cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv[..., 1] = np.clip(hsv[..., 1] * sat, 0, 255)
    f = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32)
    f[..., 2] *= 1 + warm; f[..., 0] *= 1 - warm * .6
    f = cv2.resize(np.clip(f, 0, 255).astype(np.uint8), (out_w, int(f.shape[0] * out_w / f.shape[1])), interpolation=cv2.INTER_AREA).astype(np.float32)
    f += sharpen * (f - cv2.GaussianBlur(f, (0, 0), 1.0))
    return np.clip(f + grana(*f.shape[:2])[..., None] * 2.0, 0, 255).astype(np.uint8)

def ritaglia(img, aspect, fx=.5, fy=.5):
    h, w = img.shape[:2]
    if w / h > aspect: nw = int(h * aspect); x = int((w - nw) * fx); return img[:, x:x + nw]
    nh = int(w / aspect); y = int((h - nh) * fy); return img[y:y + nh]

if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('file', help='Commons file title, e.g. "File:Colosseo 2020.jpg"')
    ap.add_argument('id', help='illustration id (luoghi[].ill in knowledge.json) or panorama name')
    ap.add_argument('--nome', default='', help='what it shows, for the credits page')
    ap.add_argument('--focus', nargs=2, type=float, default=[.5, .5], metavar=('X', 'Y'), help='crop position, 0..1')
    ap.add_argument('--cielo', action='store_true', help='a header panorama (alba, giorno, tramonto, notte)')
    a = ap.parse_args()
    title = a.file if a.file.startswith('File:') else 'File:' + a.file
    img, cr = commons(title, 1920)
    if a.cielo:
        out = f'img/cielo/{a.id}.webp'
        cv2.imwrite(os.path.join(REPO, out), dipingi(ritaglia(img, 2.25, *a.focus), 1800), [cv2.IMWRITE_WEBP_QUALITY, 78])
    else:
        out = f'img/luoghi/{a.id}.webp'
        art = cv2.resize(dipingi(ritaglia(img, 1.6, *a.focus), 1200), (1200, 750), interpolation=cv2.INTER_AREA)
        cv2.imwrite(os.path.join(REPO, out), art, [cv2.IMWRITE_WEBP_QUALITY, 80])
        cv2.imwrite(os.path.join(REPO, f'img/luoghi/{a.id}-s.webp'), cv2.resize(art, (480, 300), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_WEBP_QUALITY, 80])
    fn = os.path.join(REPO, 'img', 'credits.json')
    cred = {x['file']: x for x in json.load(open(fn, encoding='utf-8'))}
    cred[out] = dict(file=out, cosa=a.nome or (cred.get(out) or {}).get('cosa') or a.id, **cr)
    json.dump(sorted(cred.values(), key=lambda x: x['file']), open(fn, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('written', out, '·', cr['autore'], '·', cr['licenza'])
