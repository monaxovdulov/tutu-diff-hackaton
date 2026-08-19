# Tutu MCP

Официальный endpoint: [https://mcp.tutu.ru/mcp](https://mcp.tutu.ru/mcp)  
Страница хакатона: [https://hackathon2026.tutu.ru](https://hackathon2026.tutu.ru)

## Инструменты

- Поиск: `search_hotels`, `search_avia`, `search_rail`, `search_bus`, `search_etrain`, `search_multitransport`.
- Детали: `get_offer_details`, `get_rail_seatmap`.
- Инструкции: `get_avia_instructions`, `get_rail_instructions`, `get_bus_instructions`, `get_etrain_instructions`, `get_hotels_instructions`, `get_multitransport_instructions`.
- Результат: `create_checkout_link`, `fetch_resource`.


## В текущей архитектуре

Tutu MCP вызывает не браузер, а серверный TravelAgent через OpenAI Agents SDK.
Виджет получает только нормализованные карточки и прогресс. Raw payload MCP не
попадает в UI-контракт.

Для первого живого слайса достаточно одного основного поиска и нормализации
2–3 различающихся вариантов. Детали, seatmap и checkout link не вызываем, пока
они не нужны для результата.

## Использование

- Собери параметры до вызова и вызывай только нужный инструмент.
- Не проверяй доступность отдельными запросами, не запускай вызовы параллельно и не делай автоматические ретраи.
- Переиспользуй уже полученный ответ. Для ручной проверки достаточно одного главного сценария после законченного вертикального куска.
- При сетевой ошибке или блокировке остановись, не долби endpoint повторно.

Причина осторожности: IP команды уже блокировался на стороне Туту — их адрес не отвечал по ICMP и TCP 443, хотя остальной интернет работал.
