# SEMrush Collection Playbook

Этот документ нужен для ручного сбора `SEMrush` данных по 24 продуктам так, чтобы потом их можно было без догадок вернуть в `research-v2` слой и пересчитать `Demand Pull`.

Он отвечает на 4 вопроса:

1. Что именно открыть в `SEMrush`
2. Какие метрики снять
3. Как понять, что запрос относится к нашему рынку
4. В каком виде вернуть данные назад

## Где лежат исходные seed-ключи

Используй только уже подготовленные seeds:

- общий CSV: [quadrant-scorecard.seed.csv](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/quadrant-scorecard.seed.csv)
- per-product buckets: `semrush_snapshot.keyword_buckets` в `commercial-validation.json` внутри каждой продуктовой папки

Примеры:

- [A5 commercial-validation.json](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/A5_mifid_ii_compliance_training/commercial-validation.json)
- [L1 commercial-validation.json](/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/L1_sproochtest_preparation/commercial-validation.json)

Важно: эти seeds годятся как стартовый набор, но не как финальный keyword universe. Во время сбора их можно чистить, расширять и помечать как `keep`, `drop`, `expand`.

## Что нужно вернуть

На выходе по каждому продукту нужен один пакет из 4 частей:

1. `keywords.csv`
2. `paid-competitors.csv`
3. `traffic-notes.md`
4. `collection-notes.md`

Если удобнее, можно вернуть один `.xlsx`, но внутри должны быть отдельные листы с теми же названиями.

Готовые шаблоны лежат здесь:

- [semrush-keywords.template.csv](/Users/sergey/Desktop/educateme-map/docs/research-v2/templates/semrush-keywords.template.csv)
- [semrush-paid-competitors.template.csv](/Users/sergey/Desktop/educateme-map/docs/research-v2/templates/semrush-paid-competitors.template.csv)
- [semrush-traffic-notes.template.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/templates/semrush-traffic-notes.template.md)
- [semrush-collection-notes.template.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/templates/semrush-collection-notes.template.md)

## Папка возврата

Складывай результаты сюда:

`/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/<PRODUCT_FOLDER>/semrush-return/`

Где `<PRODUCT_FOLDER>` это папка продукта, например:

`/Users/sergey/Desktop/educateme-map/research-runs/2026-04-18-all-24/A5_mifid_ii_compliance_training/semrush-return/`

## Общая логика сбора

Наша задача не в том, чтобы доказать `TAM`.

Наша задача:

- измерить наблюдаемый коммерческий спрос
- понять, есть ли платный рынок
- понять, есть ли конкуренты, реально покупающие трафик
- увидеть, как выглядит рынок по intent, CPC, density и route terms

Поэтому в первую очередь интересуют:

- `commercial intent`
- `CPC`
- `competitive density`
- `paid competitors`
- `price points`
- `route / exam / provider` queries

## Обязательные отчеты в SEMrush

По каждому продукту нужно пройти 4 отчета:

1. `Keyword Overview`
2. `Keyword Magic Tool`
3. `Advertising Research`
4. `Traffic Analytics`

## Шаг 1. Собери reviewed keyword set

Перед экспортом из `SEMrush` сначала собери руками reviewed set из seed-ключей.

Раздели их на 4 группы:

1. `core_transactional`
2. `buyer_problem`
3. `route_regulatory`
4. `competitor`

### 1. core_transactional

Сюда идут прямые коммерческие запросы:

- `oet preparation course`
- `mifid training luxembourg`
- `luxembourgish course`
- `medical french for nurses`

### 2. buyer_problem

Сюда идут формулировки задачи покупателя:

- `prepare nurses for oet`
- `cssf training provider`
- `corporate french training luxembourg`

### 3. route_regulatory

Сюда идут terms, которые показывают реальный route в рынок:

- exam names
- certification names
- regulator names
- provider list terms
- official route phrases

Примеры:

- `sproochtest`
- `cssf external training`
- `mifid ii certification`
- `oet exam`

### 4. competitor

Сюда идут:

- названия прямых провайдеров
- названия альтернативных routes
- branded competitor queries

## Правила чистки reviewed set

Оставляй запрос, если он:

- выглядит как реальный поисковый запрос
- содержит buyer intent или route intent
- относится к нужному продукту, а не к слишком широкому соседнему рынку
- может дать сигнал про paid activity или commercial density

Убирай запрос, если он:

- слишком похож на фразу из заметки, а не на query
- слишком общий
- не отражает наш buyer motion
- не относится к нужной географии или route

Примеры слабых запросов, которые надо обычно удалять:

- `b2c`
- `regulated financial firms need`
- `learners need a structured`

## Шаг 2. Выбери market / database / language

По каждому продукту обязательно зафиксируй:

- `market`
- `database`
- `language`
- `is_proxy_market`
- `proxy_reason`

### Правило

Если SEMrush поддерживает точный рынок и язык, используй их.

Если не поддерживает, используй ближайший proxy database, но обязательно запиши:

- что это proxy
- почему выбран именно он
- что это ограничивает

### Примеры proxy logic

- `LUX`: может потребовать несколько proxy баз по языкам, а не один рынок
- `EU`: почти всегда нужно разложить хотя бы на 1-2 ключевых страны/языка, а не смотреть один усредненный рынок
- `GCC`: не смешивать весь GCC в один сигнал, если intent завязан на OET, nursing, doctor-specific paths

## Шаг 3. Keyword Overview

Для каждого reviewed keyword сними:

- `keyword`
- `bucket`
- `market`
- `database`
- `language`
- `intent`
- `volume`
- `trend`
- `keyword_difficulty`
- `cpc`
- `competitive_density`
- `serp_features`
- `results`
- `keep_drop_expand`
- `notes`

### Что важно отметить в `notes`

- слишком широкий запрос или нет
- подходит ли под наш buyer
- есть ли явный commercial intent
- относится ли к route / exam / provider path

## Шаг 4. Keyword Magic Tool

Для каждого bucket:

- раскрой похожие keywords
- отфильтруй по intent, где это возможно
- добавь 5-15 новых полезных запросов

Новые queries нужны только если они реально улучшают coverage.

Нельзя раздувать набор мусором ради количества.

### Что вернуть дополнительно

В `keywords.csv` добавь поле:

- `source_type`

Допустимые значения:

- `seed`
- `expanded_from_semrush`

## Шаг 5. Advertising Research

Нужно понять, есть ли paid market, а не только органика.

По каждому продукту верни:

- `domain`
- `is_paid_competitor`
- `common_paid_keywords`
- `estimated_paid_traffic`
- `estimated_ad_spend`
- `top_paid_keywords`
- `ad_copy_themes`
- `fit_to_our_market`
- `notes`

Это должно идти в `paid-competitors.csv`.

### Что считать хорошим сигналом

- по нашим ключам есть реальные advertisers
- есть branded и non-branded paid terms
- ad copy отражает то же promise / route / persona

### Что считать слабым сигналом

- трафик есть, но по соседнему рынку
- платная выдача заполнена агрегаторами, не direct providers
- advertising идет по слишком широкому educational intent

## Шаг 6. Traffic Analytics

Нужен sanity check по конкурентам.

По 3-5 доменам на продукт достаточно короткой заметки:

- похож ли трафик на реальный operating competitor
- это direct provider, marketplace, media, regulator или directory
- есть ли признаки коммерческого acquisition motion

Это верни в `traffic-notes.md`.

Не нужна длинная статья. Нужен короткий фактический вывод.

## Что считать proxy на вопрос “это наш рынок?”

Нам не нужен один магический показатель.

Нужен набор прокси-сигналов.

### Сильные proxy signals

- есть `core_transactional` queries с ненулевым volume
- есть `commercial` или `transactional` intent
- есть CPC и/или paid competition
- есть branded competitors, похожие на нас
- есть route / exam / provider queries в нужной географии
- есть цены или продающие офферы у direct competitors

### Средние proxy signals

- есть volume только в route terms
- intent есть, но почти нет paid competition
- рынок существует, но buyer motion не до конца совпадает с нашим

### Слабые proxy signals

- volume есть только у очень широких информационных запросов
- весь трафик у регуляторов, справочников и контентных страниц
- конкуренты не выглядят как прямые продавцы похожего offer

## Как размечать relevance

В `keywords.csv` добавь 2 обязательных поля:

- `market_fit_relevance`
- `buyer_relevance`

Допустимые значения:

- `high`
- `medium`
- `low`

### Как ставить `market_fit_relevance`

- `high`: запрос явно относится к нашему продукту в нужной географии/route
- `medium`: запрос соседний, но может быть полезным proxy
- `low`: широкий или косвенный запрос

### Как ставить `buyer_relevance`

- `high`: query отражает решение покупателя или пользователя именно для нашего offer
- `medium`: query про смежную задачу
- `low`: query про общий интерес, но не про покупку или route

## Минимальный return schema для `keywords.csv`

Колонки:

- `product_code`
- `product_title`
- `market`
- `database`
- `language`
- `bucket`
- `source_type`
- `keyword`
- `intent`
- `volume`
- `trend`
- `keyword_difficulty`
- `cpc`
- `competitive_density`
- `serp_features`
- `results`
- `market_fit_relevance`
- `buyer_relevance`
- `keep_drop_expand`
- `notes`

## Минимальный return schema для `paid-competitors.csv`

Колонки:

- `product_code`
- `product_title`
- `market`
- `database`
- `domain`
- `is_paid_competitor`
- `common_paid_keywords`
- `estimated_paid_traffic`
- `estimated_ad_spend`
- `top_paid_keywords`
- `ad_copy_themes`
- `fit_to_our_market`
- `notes`

## Минимальный return schema для `traffic-notes.md`

Для каждого продукта:

- `Top domains reviewed`
- `What they are`
- `Are they direct competitors`
- `Do they look like real acquisition operators`
- `Anything misleading in the SERP landscape`

## Минимальный return schema для `collection-notes.md`

Для каждого продукта:

- `Reviewed keywords kept`
- `Keywords dropped`
- `Proxy databases used`
- `Why those proxies were chosen`
- `Main limitations`
- `Confidence in market read: high / medium / low`

## Что особенно важно для наших рынков

### Luxembourg / multilingual products

Важное уточнение: в этом workflow в `SEMrush` главным выбором является `database / country`, а не отдельный переключатель языка.

Значит:

- `db=LU` = local Luxembourg evidence
- язык нужно читать из самого query text
- `db=FR` / `db=DE` = adjacent market evidence, а не local Luxembourg proof

Для `Luxembourg` проверяй не один язык, а route-relevant варианты внутри `db=LU`:

- `EN`
- `FR`
- `DE`
- локальный язык, если route реально в нем живет

Не смешивай их молча. Отмечай явно:

- database
- observed language lane

### B2B products

Не ограничивайся end-user queries.

Обязательно ищи:

- `provider`
- `corporate training`
- `team training`
- `company`
- `certification provider`
- route / regulator terms

### B2C exam / language products

Обязательно ищи:

- exam terms
- prep terms
- class/course terms
- branded competitor queries
- destination/route terms, если рынок завязан на migration, licensing, registration

## Что нельзя делать

- не смешивать разные databases без пометки
- не заменять отсутствие спроса “красивыми” широкими keywords
- не строить вывод по одному keyword
- не считать info-volume доказательством платежеспособного спроса
- не подменять direct competitors директориями, regulators и media sites

## Что я потом сделаю с этими данными

После возврата я:

1. заполню `semrush_snapshot.metrics`
2. пересчитаю:
   - `demand_evidence_score`
   - `wtp_score`
   - `cac_reality_score`
   - `channel_fit_score`
   - `macro_trajectory_score`, где возможно
3. обновлю `demand_pull_composite`
4. пересчитаю `B2B` и `B2C` квадранты
5. отмечу, какие продукты действительно имеют observable pull в нашем рынке, а какие только выглядят перспективно

## Короткий чек-лист на один продукт

1. Открыть `commercial-validation.json` и взять 4 seed buckets.
2. Собрать reviewed keyword set.
3. Выбрать database и language, отметить proxy или exact.
4. Снять `Keyword Overview` по reviewed set.
5. Через `Keyword Magic Tool` добавить только полезные expansions.
6. Через `Advertising Research` собрать paid competitors.
7. Через `Traffic Analytics` сделать sanity notes по 3-5 доменам.
8. Сохранить `keywords.csv`, `paid-competitors.csv`, `traffic-notes.md`, `collection-notes.md`.

## Рекомендуемый итог

По каждому продукту достаточно:

- `12-25` reviewed keywords
- `3-10` paid competitor domains
- `3-5` traffic sanity domains

Больше не всегда лучше. Важнее чистота сигнала.
