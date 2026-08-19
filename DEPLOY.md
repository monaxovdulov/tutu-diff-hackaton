# Deploy

По просьбе владельца до конца хакатона выкладываем сразу в production:

<https://tutu.apps.botops.ru/>

Deploy выполняем только по явной команде владельца `выложи`.

## Команда

```bash
just deploy
```

Она:

1. собирает image;
2. обновляет Compose-контейнер;
3. перечитывает Caddy;
4. проверяет production URL.

Диагностика:

```bash
just status
just logs
just smoke
```

## Правила

- staging и preview нет;
- публикуются текущие файлы, чистый Git не требуется;
- для отката вернуть изменение и снова выполнить `just deploy`;
- `docker compose down` не запускать: Caddy и соседние сервисы общие.
