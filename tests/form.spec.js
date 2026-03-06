import { test, expect } from '@playwright/test';

test.describe('Formulário de Casamento - Validações', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve exibir erro quando nome está vazio', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    const erroNome = page.locator('#erroNome');
    await expect(erroNome).toBeVisible();
    await expect(erroNome).toContainText('Por favor, insira seu nome completo');
  });

  test('deve exibir erro quando apenas um nome é fornecido', async ({ page }) => {
    await page.fill('#inputNome', 'João');
    await page.click('button[type="submit"]');
    
    const erroNome = page.locator('#erroNome');
    await expect(erroNome).toBeVisible();
  });

  test('deve aceitar nome completo com dois ou mais nomes', async ({ page }) => {
    await page.fill('#inputNome', 'João Silva');
    await page.click('#radioSimIrei');
    
    const erroNome = page.locator('#erroNome');
    await expect(erroNome).not.toBeVisible();
  });

  test('deve exibir erro quando presença não é selecionada', async ({ page }) => {
    await page.fill('#inputNome', 'João Silva');
    await page.click('button[type="submit"]');
    
    const erroPresenca = page.locator('#erroIraAoEvento');
    await expect(erroPresenca).toBeVisible();
  });

  test('deve validar tipo de participação quando irá ao evento', async ({ page }) => {
    await page.fill('#inputNome', 'João Silva');
    await page.click('#radioSimIrei');
    
    // Aguardar seção aparecer
    await expect(page.locator('#secaoParticipacao')).toBeVisible();
    
    await page.click('button[type="submit"]');
    
    const erroParticipacao = page.locator('#erroTipoParticipacao');
    await expect(erroParticipacao).toBeVisible();
  });

  test('deve mostrar seção de acompanhantes quando "Acompanhado" é selecionado', async ({ page }) => {
    await page.fill('#inputNome', 'João Silva');
    await page.click('#radioSimIrei');
    await page.click('#checkboxAcompanhado');
    
    const secaoDetalhes = page.locator('#secaoDetalhesAcompanhamento');
    await expect(secaoDetalhes).toBeVisible();
  });

  test('deve exigir quantidade de acompanhantes quando "Acompanhado" é selecionado', async ({ page }) => {
    await page.fill('#inputNome', 'João Silva');
    await page.click('#radioSimIrei');
    await page.click('#checkboxAcompanhado');
    
    await page.click('button[type="submit"]');
    
    const erroQuantidade = page.locator('#erroQuantidadeAcompanhantes');
    await expect(erroQuantidade).toBeVisible();
    await expect(erroQuantidade).toContainText('Por favor, informe a partir de 1 acompanhante');
  });

  test('deve gerar campos de nomes quando quantidade é preenchida', async ({ page }) => {
    await page.fill('#inputNome', 'João Silva');
    await page.click('#radioSimIrei');
    await page.click('#checkboxAcompanhado');
    
    await page.fill('#inputQuantidadeAcompanhantes', '2');
    
    const campos = page.locator('.companion-name-input');
    await expect(campos).toHaveCount(2);
  });

  test('deve prevenir números no campo de nome', async ({ page }) => {
    const inputNome = page.locator('#inputNome');
    
    // Tentar digitar números
    await inputNome.focus();
    await page.keyboard.type('123');
    
    const valor = await inputNome.inputValue();
    expect(valor).toBe(''); // Não deve conter números
  });

  test('deve limpar erros ao mudar radio button', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    const erroPresenca = page.locator('#erroIraAoEvento');
    await expect(erroPresenca).toBeVisible();
    
    await page.click('#radioSimIrei');
    
    await expect(erroPresenca).not.toBeVisible();
  });

  test('deve ocultar seção de participação quando "Não irei" é selecionado', async ({ page }) => {
    await page.click('#radioSimIrei');
    await expect(page.locator('#secaoParticipacao')).toBeVisible();
    
    await page.click('#radioNaoIrei');
    await expect(page.locator('#secaoParticipacao')).toHaveClass(/d-none/);
  });

  test('deve permitir submissão com dados válidos - Sozinho', async ({ page }) => {
    await page.fill('#inputNome', 'Maria Santos');
    await page.click('#radioSimIrei');
    await page.click('#checkboxSozinho');
    
    // Mock da resposta de duplicação
    await page.route('**/api/Convidado/verificar**', route => {
      route.abort();
    });
    
    // Mock do POST
    await page.route('**/api/Convidado/adicionar', route => {
      route.abort();
    });
    
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeEnabled();
  });

  test('deve desabilitar botão durante submissão', async ({ page }) => {
    await page.fill('#inputNome', 'Maria Santos');
    await page.click('#radioSimIrei');
    await page.click('#checkboxSozinho');
    
    // Interceptar requisição para manter pendente
    await page.route('**/api/Convidado/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      route.abort();
    });
    
    const submitBtn = page.locator('button[type="submit"]');
    
    await submitBtn.click();
    
    // Botão deve estar desabilitado durante submissão
    await expect(submitBtn).toBeDisabled();
  });

  test('deve mostrar loading overlay durante submissão', async ({ page }) => {
    await page.fill('#inputNome', 'Maria Santos');
    await page.click('#radioSimIrei');
    await page.click('#checkboxSozinho');
    
    // Interceptar requisição
    await page.route('**/api/Convidado/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 500));
      route.abort();
    });
    
    const loading = page.locator('#loadingOverlay');
    
    await page.locator('button[type="submit"]').click();
    
    // Loading deve estar visível
    await expect(loading).toHaveClass(/show/);
  });
});
