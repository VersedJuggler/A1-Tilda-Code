from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import json

URL = "https://2gis.ru/kazan/firm/70000001080325722/tab/reviews?m=49.136618%2C55.816529%2F14.88"

def init_driver():
    opts = Options()
    # opts.add_argument("--headless")  # Можно включить для headless режима
    opts.add_argument("--window-size=1920,1080")
    return webdriver.Chrome(options=opts)

def parse_reviews_page(url, driver):
    driver.get(url)

    # Закрываем баннер куки, если есть
    try:
        btn = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Согласиться') or contains(., 'Принять')]"))
        )
        btn.click()
    except Exception:
        pass

    # Ждём появления блока отзывов (делаем селектор более универсальным)
    try:
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-id='reviews']"))
        )
    except Exception:
        # Фоллбек: ищем по старому селектору
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div._1niy2u31"))
        )
    time.sleep(3)

    soup = BeautifulSoup(driver.page_source, "lxml")

    # Количество отзывов
    total_elem = soup.select_one("span._1xhlznaa")
    total = total_elem.get_text(strip=True) if total_elem else None

    # Список отзывов
    reviews = []
    for block in soup.select("div._1niy2u31"):
        user = block.select_one("a._1ukrwz6w")
        text_block = block.select_one("div._1s6vpvlc")
        # Количество звёзд
        stars_elem = block.select_one("span._1cuk6xcg._dibvphoo")
        stars = 0
        if stars_elem and stars_elem.has_attr('aria-label'):
            import re
            m = re.search(r'(\d+)', stars_elem['aria-label'])
            if m:
                stars = int(m.group(1))
        else:
            stars = len(block.select("span._1cuk6xcg._dibvphoo"))
        reviews.append({
            "name": user.get_text(strip=True) if user else None,
            "text": text_block.get_text(strip=True) if text_block else None,
            "stars": stars
        })

    return {
        "total_reviews": total,
        "reviews": reviews
    }

if __name__ == "__main__":
    driver = init_driver()
    data = parse_reviews_page(URL, driver)
    driver.quit()
    print(json.dumps(data, ensure_ascii=False, indent=2))
