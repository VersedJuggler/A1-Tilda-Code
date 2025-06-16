# parser_static.py

from bs4 import BeautifulSoup
import json

# 1) читаем сохранённый файл
with open("reviews_source.html", encoding="utf-8") as f:
    html = f.read()

soup = BeautifulSoup(html, "lxml")

# 2) ищем количество отзывов (селектор может отличаться, ищем по span с числом)
total_reviews = "0"
for span in soup.find_all("span"):
    if span.text.strip().isdigit():
        total_reviews = span.text.strip()
        break

# 3) ищем все блоки отзывов (ищем по наличию текста и звёзд)
blocks = []
for div in soup.find_all("div"):
    # ищем блоки, где есть хотя бы 1 звезда и текст
    stars = div.find_all("svg", attrs={"aria-label": True})
    text_tag = div.find("span")
    if stars and text_tag and text_tag.text.strip():
        blocks.append(div)

reviews = []
for b in blocks:
    # Имя пользователя (ищем первый <span> с текстом, который не похож на оценку)
    name_tag = b.find("span")
    name = name_tag.text.strip() if name_tag else ""
    # Текст комментария (ищем второй <span> или <div> с текстом)
    text = ""
    spans = b.find_all("span")
    if len(spans) > 1:
        text = spans[1].text.strip()
    # Количество звёзд (ищем все svg с aria-label, например '1 звезда', '5 звёзд')
    stars = 0
    for svg in b.find_all("svg", attrs={"aria-label": True}):
        if "зв" in svg["aria-label"]:
            try:
                stars = int(svg["aria-label"].split()[0])
            except Exception:
                pass
    reviews.append({
        "name": name,
        "text": text,
        "stars": stars
    })

# 4) сохраняем в JS-файл, чтобы подключить как <script src="reviewsData.js">
with open("reviewsData.js", "w", encoding="utf-8") as f:
    f.write("const reviewsData = ")
    json.dump(reviews, f, ensure_ascii=False, indent=2)
    f.write(";")

print(f"Сохранено {len(reviews)} отзывов в reviewsData.js (total: {total_reviews})")
