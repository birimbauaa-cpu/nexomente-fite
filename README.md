# NexoMente — protótipo FITE

Site estático responsivo para demonstração de uma plataforma de foco e organização com experiência ajustável.

## Como abrir

### Opção rápida
Abra `index.html` no navegador.

### Opção recomendada
Sirva a pasta por HTTP para habilitar o service worker/PWA. Exemplo:

```bash
python -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Como publicar

Envie **todo o conteúdo desta pasta** para a raiz do seu host/site estático. Não precisa de Node, npm, banco de dados ou build.

Arquivos principais:

- `index.html` — página principal
- `css/styles.css` — identidade visual e responsividade
- `js/app.js` — timer, modo foco, quebra de tarefas, prioridades e acessibilidade
- `manifest.webmanifest` + `sw.js` — instalação/PWA e cache do app shell
- `SOURCES.md` — referências científicas, de acessibilidade e créditos de imagens

## Observação sobre as fotos

As fotos do Pexels usadas nesta versão já estão incluídas localmente em `assets/images/`. Os links de origem e créditos estão em `SOURCES.md`.

## Trocar o nome do projeto

Procure por `NexoMente` em `index.html`, `manifest.webmanifest` e `README.md`. O logotipo visual é feito em CSS/SVG e pode ser alterado em `assets/logo-mark.svg`.

## Dados e privacidade

O protótipo não envia dados para servidor. Tarefa atual, três prioridades e preferências visuais ficam no `localStorage` do navegador do usuário.
