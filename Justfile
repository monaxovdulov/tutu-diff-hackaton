set shell := ["bash", "-eo", "pipefail", "-c"]

compose := "docker compose -f compose.prod.yml"
prod_url := "https://tutu.apps.botops.ru/"
caddy_container := "granit-staging-caddy-1"
caddy_route_source := "deploy/tutu-diff.caddy"
caddy_route_target := "/srv/botops/staging-overrides/tutu-diff.caddy"
mdtask := "pnpm exec mdtask"

default:
    @just --list

# Проверить TypeScript и собрать production-файлы локально.
build:
    pnpm build

# Показать открытые задачи из спецификаций.
tasks:
    {{mdtask}} list

# Показать одну задачу целиком.
task id:
    {{mdtask}} view {{id}}

# Проверить формат и связи задач.
tasks-check:
    {{mdtask}} validate

# Собрать image и заменить production-контейнер.
up:
    {{compose}} up -d --build --remove-orphans --wait

# Установить production-маршрут и перечитать Caddy без остановки сервера.
route:
    install -m 0644 {{caddy_route_source}} {{caddy_route_target}}
    grep -Fqx 'import /srv/overrides/*.caddy' /srv/botops/Caddyfile
    docker exec {{caddy_container}} caddy validate --config /etc/caddy/Caddyfile
    docker exec {{caddy_container}} caddy reload --config /etc/caddy/Caddyfile

# Единственная команда выкладки: текущие файлы сразу уходят в production.
deploy: up route smoke
    @echo "Production обновлён: {{prod_url}}"

# Короткая проверка публичного production URL.
smoke:
    curl --fail --silent --show-error --location --max-time 20 --retry 10 --retry-delay 1 --retry-max-time 30 --retry-all-errors {{prod_url}} >/dev/null

# Показать состояние production-контейнера.
status:
    {{compose}} ps

# Показать свежие логи production-контейнера.
logs:
    {{compose}} logs --tail=100 web
