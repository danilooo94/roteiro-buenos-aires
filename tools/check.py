"""Confere o roteiro antes de publicar.

1. Horários de cada dia em ordem (antes das 05:00 conta como madrugada do dia).
2. Abre o site num navegador sem janela (Edge ou Chrome), um dia por vez, e confere
   se as paradas, a aba Comer e a aba Antes de ir aparecem sem erro de JavaScript.

Uso: python tools/check.py
"""
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
problems = []

# ---------- 1. horários ----------
data = (ROOT / "js" / "data.js").read_text(encoding="utf-8")
days = re.findall(r'\{ id: "(dia-\d+)"(.*?)(?=\{ id: "dia-|\n  places:)', data, re.S)
if not days:
    problems.append("não achei os dias em js/data.js")
for day_id, body in days:
    prev = -1
    for hhmm in re.findall(r'\bt: "(\d\d):(\d\d)"', body):
        mins = int(hhmm[0]) * 60 + int(hhmm[1])
        if mins < 300:
            mins += 1440
        if mins < prev:
            problems.append(f"{day_id}: horário {hhmm[0]}:{hhmm[1]} fora de ordem")
        prev = mins

# ---------- 2. navegador ----------
CANDIDATES = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    shutil.which("msedge") or "", shutil.which("google-chrome") or "", shutil.which("chromium") or "",
]
browser = next((c for c in CANDIDATES if c and os.path.exists(c)), None)
if not browser:
    print("Aviso: nenhum Edge ou Chrome encontrado; pulei o teste no navegador.")
else:
    page = (ROOT / "index.html").as_uri()
    for day_id, _ in days:
        r = subprocess.run(
            [browser, "--headless=new", "--disable-gpu", "--enable-logging=stderr", "--v=0",
             "--virtual-time-budget=4000", "--dump-dom", page + "#" + day_id],
            capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=90)
        dom, log = r.stdout, r.stderr
        errors = [l for l in log.splitlines() if "CONSOLE" in l and ("Uncaught" in l or "Error" in l)]
        for e in errors:
            problems.append(f"{day_id}: erro de JavaScript: {e.strip()[:200]}")
        if f'class="wrap d' not in dom or 'class="stop' not in dom:
            problems.append(f"{day_id}: as paradas não apareceram")
        if 'id="comer-body"></div>' in dom:
            problems.append(f"{day_id}: a aba Comer ficou vazia")
        if 'id="antes-body"></div>' in dom:
            problems.append(f"{day_id}: a aba Antes de ir ficou vazia")

if problems:
    print("Problemas encontrados:")
    for p in problems:
        print(" -", p)
    sys.exit(1)
print(f"Tudo certo: {len(days)} dias conferidos" + (" no navegador." if browser else "."))
