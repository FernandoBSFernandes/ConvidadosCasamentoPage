# Testes Automatizados com Playwright

## 📋 Descrição

Este projeto usa **Playwright** para testes automatizados do formulário de confirmação de presença.

## 🚀 Como Usar

### 1. **Instalar dependências**
```bash
npm install
```

### 2. **Rodar todos os testes**
```bash
npm test
```

### 3. **Rodar testes com interface visual**
```bash
npm run test:ui
```

### 4. **Executar teste específico com debug**
```bash
npm run test:debug
```

### 5. **Ver relatório de testes**
```bash
npm run test:report
```

## 📊 O que é testado?

### Validações de Formulário
- ✅ Campo de nome **obrigatório** e com mínimo 2 palavras
- ✅ Seleção de presença **necessária**
- ✅ Tipo de participação **obrigatório** quando "Sim" é selecionado
- ✅ Quantidade de acompanhantes **obrigatória** quando "Acompanhado" é selecionado
- ✅ **Prevenção de números** no campo de nome
- ✅ Limpeza de erros ao mudar seleções

### Comportamento da UI
- ✅ Exibição/ocultação de **seções dinâmicas**
- ✅ Geração de **campos de nomes** de acompanhantes
- ✅ **Loading spinner** durante submissão
- ✅ Desabilitação de **botão durante submissão**
- ✅ Exibição correta de **mensagens de erro**

### Estados do Formulário
- ✅ Submissão com dados válidos (Sozinho)
- ✅ Submissão com dados válidos (Acompanhado)
- ✅ Comportamento do botão de submissão

## 🎯 Exemplos de Testes

```javascript
// Testar validação de nome
test('deve exibir erro quando nome está vazio', async ({ page }) => {
  await page.goto('/');
  await page.click('button[type="submit"]');
  
  const erroNome = page.locator('#erroNome');
  await expect(erroNome).toBeVisible();
});

// Testar geração de campos dinâmicos
test('deve gerar campos de nomes quando quantidade é preenchida', async ({ page }) => {
  await page.fill('#inputNome', 'João Silva');
  await page.click('#radioSimIrei');
  await page.click('#checkboxAcompanhado');
  await page.fill('#inputQuantidadeAcompanhantes', '2');
  
  const campos = page.locator('.companion-name-input');
  await expect(campos).toHaveCount(2);
});
```

## 🌐 Navegadores Testados

- ✅ **Chrome** (Chromium)
- ✅ **Firefox**
- ✅ **Safari** (WebKit)

## 📁 Estrutura

```
tests/
  └── form.spec.js          # Testes do formulário
playwright.config.js        # Configuração do Playwright
```

## ⚙️ Configuração

O arquivo `playwright.config.js` está pre-configurado com:
- **Base URL:** `http://localhost:3000`
- **Servidor automático:** `http-server` na porta 3000
- **Relatório:** HTML com screenshots
- **Retries:** 2 tentativas em CI, 0 em desenvolvimento

## 🛠️ Troubleshooting

### Erro: "connection refused"
```bash
# Certifique-se que está rodando em browser completo
npm test
```

### Erro: "Element not found"
Os testes usam IDs e classes do HTML. Verifique que o HTML contém:
- `#inputNome`
- `#radioSimIrei`, `#radioNaoIrei`
- `#checkboxSozinho`, `#checkboxAcompanhado`
- `#inputQuantidadeAcompanhantes`
- Etc.

### Limpar cache de testes
```bash
rm -r test-results/
rm -r blob-report/
```

## 📚 Documentação Oficial

- [Playwright Docs](https://playwright.dev/)
- [Teste Selectors](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)

## ✨ Próximos Passos

- [ ] Adicionar testes de integração com API
- [ ] Testar resposta do servidor (sucesso/erro)
- [ ] Testar geração do arquivo .ics
- [ ] Testar performance da página
- [ ] Adicionar testes de acessibilidade (axe)

---

**Desenvolvido com ❤️ para o casamento de Suzana e Fernando**
