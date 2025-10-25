# Subagent Playground

Этот проект полностью управляется через Codex subagents. Ниже — инструкции для быстрой проверки с нуля.

## Установка
```bash
subagents init --config-dir .agents/codex-subagents
subagents register web-agent dev \
  --repo $(pwd) --branch feature/site \
  --config-dir .agents/codex-subagents
subagents worktree create --agent web-agent --config-dir .agents/codex-subagents
```

## Генерация файлов
```bash
subagents file write index.html --agent web-agent --stdin < index.html.template
subagents file write styles.css --agent web-agent --stdin < styles.css.template
subagents file write script.js  --agent web-agent --stdin < script.js.template
```

## Удалённые метрики и логи
```bash
subagents serve --rate-limit 120 --rate-window 60 --token secret
subagents metrics --remote-url http://127.0.0.1:8075 --token secret
subagents logs web-agent --remote-url http://127.0.0.1:8075 --token secret --follow --follow-seconds 15
```

## Коммиты и публикация
```bash
subagents exec web-agent -- git status -sb
subagents exec web-agent -- git commit -am "feat: update landing"
subagents exec web-agent -- git push origin feature/site
```

## Что дальше
- Добавить CI, используя `subagents exec` для запусков тестов.
- Настроить review-агента: `subagents review <PR> --agent reviewer`.
