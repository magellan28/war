import sys, glob
from PIL import Image, ImageDraw
files = sys.argv[2:]
out = sys.argv[1]
ims = [Image.open(f) for f in files]
w, h = ims[0].size
cols = 3
rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (w * cols, h * rows), 'black')
d = ImageDraw.Draw(S)
for i, (f, im) in enumerate(zip(files, ims)):
    x, y = (i % cols) * w, (i // cols) * h
    S.paste(im, (x, y))
    d.text((x + 8, y + 8), f.split('/')[-1], fill=(255, 255, 0))
S.save(out, quality=82)
