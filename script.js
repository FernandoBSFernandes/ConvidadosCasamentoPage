$(document).ready(function() {
    // Verificar se o prazo de inscrições passou
    function verificarPrazoInscricoes() {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const prazoLimite = new Date(2026, 2, 26); // Mês é 0-indexed (2 = março, data limite: 26/03/2026)
        prazoLimite.setHours(23, 59, 59, 999);
        
        if (hoje > prazoLimite) {
            // Prazo passou - travar form
            $form.find('input, textarea, select, button').prop('disabled', true);
            $form.prepend('<div class="alert alert-danger fw-bold mb-4" role="alert">🚫 <strong>Inscrições Encerradas!</strong> O prazo para inscrições (26/03/2026) já passou. Obrigado a todos que se inscreveram!</div>');
            return false;
        }
        return true;
    }
    
    // Cache de elementos
    const $form = $("#formularioEvento");
    const $btnSubmit = $('button[type="submit"]');
    const $loading = $("#loadingOverlay"); // Loading já existe no HTML
    let formSubmitedSuccessfully = false;
    const $radioPresenca = $('input[name="iraAoEvento"]');
    const $secaoParticipacao = $("#secaoParticipacao");
    const $checkboxParticipacao = $('input[name="tipoDeParticipacao"]');
    const $mensagemSucesso = $("#mensagemSucesso");
    const $resumoFormulario = $("#resumoFormulario");
    const $inputNome = $("#inputNome");
    const $checkboxSozinho = $("#checkboxSozinho");
    const $checkboxAcompanhado = $("#checkboxAcompanhado");
    const $secaoDetalhesAcompanhamento = $("#secaoDetalhesAcompanhamento");
    const $inputQuantidadeAcompanhantes = $("#inputQuantidadeAcompanhantes");
    const $containerNomesAcompanhantes = $("#containerNomesAcompanhantes");
    const $erroNome = $("#erroNome");
    const $erroIraAoEvento = $("#erroIraAoEvento");
    const $erroTipoParticipacao = $("#erroTipoParticipacao");
    const $erroQuantidadeAcompanhantes = $("#erroQuantidadeAcompanhantes");
    const $erroNomesAcompanhantes = $("#erroNomesAcompanhantes");

    // Função para limpar erros
    function limparErros() {
        $erroNome.removeClass("show");
        $erroIraAoEvento.removeClass("show");
        $erroTipoParticipacao.removeClass("show");
        $erroQuantidadeAcompanhantes.removeClass("show");
        $erroNomesAcompanhantes.removeClass("show");
    }

    // Função para prevenir números em campos de texto
    function preventNumbers(event) {
        if (/[0-9]/.test(event.key)) {
            event.preventDefault();
        }
    }

    // Função para alternar seção de acompanhantes
    function alternarSecaoAcompanhantes() {
        const isChecked = $("#radioSimIrei").is(":checked");
        if (isChecked) {
            $secaoParticipacao.removeClass("d-none").addClass("show");
            $checkboxParticipacao.prop("required", true);
        } else {
            $secaoParticipacao.addClass("d-none").removeClass("show");
            $checkboxParticipacao.prop("required", false).prop("checked", false);
            $secaoDetalhesAcompanhamento.addClass("d-none");
            $inputQuantidadeAcompanhantes.val("");
            $containerNomesAcompanhantes.empty().addClass("d-none");
            $erroTipoParticipacao.removeClass("show");
            $erroQuantidadeAcompanhantes.removeClass("show");
            $erroNomesAcompanhantes.removeClass("show");
        }
    }

    // Função para alternar detalhes de acompanhamento
    function alternarDetalhesAcompanhantes() {
        const isChecked = $checkboxAcompanhado.is(":checked");
        if (isChecked) {
            $secaoDetalhesAcompanhamento.removeClass("d-none");
            $inputQuantidadeAcompanhantes.prop("required", true).val("");
        } else {
            $secaoDetalhesAcompanhamento.addClass("d-none");
            $inputQuantidadeAcompanhantes.prop("required", false).val("");
            $containerNomesAcompanhantes.empty().addClass("d-none");
            $erroQuantidadeAcompanhantes.removeClass("show");
            $erroNomesAcompanhantes.removeClass("show");
        }
    }

    // Função para obter ordinal
    function getOrdinal(num) {
        const ordinals = ["1º", "2º", "3º", "4º", "5º", "6º", "7º", "8º", "9º", "10º"];
        return ordinals[num - 1] || num;
    }

    // Função para escapar caracteres HTML
    function escapeHtml(text) {
        const map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };
        return text.replace(/[&<>"']/g, char => map[char]);
    }

    // Função para capitalizar primeira letra de cada palavra
    function capitalizeName(name) {
        return name.trim().split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }

    // Função para gerar campos de nomes dos acompanhantes
    function gerarCamposNomesAcompanhantes() {
        const quantity = parseInt($inputQuantidadeAcompanhantes.val()) || 0;

        if (quantity > 0 && quantity <= 10) {
            $containerNomesAcompanhantes.empty();
            for (let i = 1; i <= quantity; i++) {
                const ordinal = getOrdinal(i);
                $containerNomesAcompanhantes.append(
                    `<div class="companion-input-group">
                        <label for="companionName${i}">Insira o nome do ${ordinal} acompanhante</label>
                        <input type="text" class="form-control companion-name-input" id="companionName${i}" name="companionName${i}" placeholder="Digite o nome do acompanhante" maxlength="50" required>
                    </div>`
                );
                $("#companionName" + i).on("keypress", preventNumbers);
            }
            $containerNomesAcompanhantes.removeClass("d-none");
            $erroQuantidadeAcompanhantes.removeClass("show");
        } else if (quantity === 0 && $inputQuantidadeAcompanhantes.val() === "0") {
            $erroQuantidadeAcompanhantes.text("Por favor, informe a partir de 1 acompanhante, ou informe que você vai sozinha.").addClass("show");
            $containerNomesAcompanhantes.empty().addClass("d-none");
        } else {
            $containerNomesAcompanhantes.empty().addClass("d-none");
            $erroQuantidadeAcompanhantes.removeClass("show");
        }
    }

    // Eventos
    verificarPrazoInscricoes(); // Verificar prazo antes de qualquer coisa
    
    $inputNome.on("keypress", preventNumbers);

    // Verificar se o convidado já existe quando sair do campo de nome
    $inputNome.on("blur", function() {
        const nome = $(this).val().trim();
        
        if (nome.length > 0) {
            const nomeCapitalizado = capitalizeName(nome);
            $.ajax({
                url: 'https://eventos-hmlo.onrender.com/api/Convidado/verificar?nome=' + encodeURIComponent(nomeCapitalizado),
                type: 'GET',
                success: function(response) {
                    if (response && response.existe) {
                        const modal = new bootstrap.Modal(document.getElementById('modalNomeRegistrado'));
                        modal.show();
                        $inputNome.attr('data-duplicado', 'true');
                    } else {
                        $inputNome.removeAttr('data-duplicado');
                    }
                },
                error: function(xhr, status, error) {
                    $inputNome.removeAttr('data-duplicado');
                }
            });
        } else {
            $inputNome.removeAttr('data-duplicado');
        }
    });

    $radioPresenca.on("change", function() {
        alternarSecaoAcompanhantes();
        limparErros();
    });

    $checkboxParticipacao.on("change", function() {
        $(this).is(":checked") && $checkboxParticipacao.not(this).prop("checked", false);
        alternarDetalhesAcompanhantes();
        $erroTipoParticipacao.removeClass("show");
    });

    $inputQuantidadeAcompanhantes.on("change input", function() {
        gerarCamposNomesAcompanhantes();
    });

    // Evento de submissão
    $form.on("submit", function(e) {
        e.preventDefault();
        limparErros();
        $btnSubmit.prop("disabled", true);

        const nome = $inputNome.val();
        const iraAoEvento = $('input[name="iraAoEvento"]:checked').val();
        const tipoDeParticipacao = $('input[name="tipoDeParticipacao"]:checked');
        const tipoParticipacaoValue = tipoDeParticipacao.length > 0 ? tipoDeParticipacao.val() : "-";
        const quantidadeAcompanhantes = parseInt($inputQuantidadeAcompanhantes.val()) || 0;

        let isValid = true;

        // Validações
        const nomePalavras = nome.trim().split(/\s+/).filter(word => word.length > 0);
        if (!nome.trim() || nomePalavras.length < 2) {
            $erroNome.text("Por favor, insira seu nome completo (nome e sobrenome).").addClass("show");
            isValid = false;
        }

        if (!iraAoEvento) {
            $erroIraAoEvento.addClass("show");
            isValid = false;
        }

        if (iraAoEvento === "sim" && tipoDeParticipacao.length === 0) {
            $erroTipoParticipacao.addClass("show");
            isValid = false;
        }

        if (tipoParticipacaoValue === "acompanhado" && quantidadeAcompanhantes === 0) {
            $erroQuantidadeAcompanhantes.text("Por favor, informe a partir de 1 acompanhante, ou informe que você vai sozinha.").addClass("show");
            isValid = false;
        }

        if (tipoParticipacaoValue === "acompanhado" && quantidadeAcompanhantes > 0) {
            const emptyCompanions = $containerNomesAcompanhantes.find(".companion-name-input").filter(function() {
                return !$(this).val().trim();
            });
            if (emptyCompanions.length > 0) {
                $erroNomesAcompanhantes.addClass("show");
                isValid = false;
            }
        }

        // Se há erro de validação, reabilita o botão e retorna
        if (!isValid) {
            $btnSubmit.prop("disabled", false);
            return;
        }

        // Verificar se o nome é duplicado
        if ($inputNome.attr('data-duplicado') === 'true') {
            $btnSubmit.prop("disabled", false);
            return;
        }

        // Preparar dados
        const nomeCapitalizado = capitalizeName(nome);
        const dadosFormulario = {
            nome: nomeCapitalizado,
            iraAoRodizio: iraAoEvento === "sim",
            participacao: tipoParticipacaoValue === "sozinho" ? "Sozinho" : tipoParticipacaoValue === "acompanhado" ? "Acompanhado" : "-",
            quantidadeAcompanhantes: tipoParticipacaoValue === "acompanhado" ? quantidadeAcompanhantes : 0,
            nomesAcompanhantes: []
        };

        if (tipoParticipacaoValue === "acompanhado") {
            $containerNomesAcompanhantes.find(".companion-name-input").each(function() {
                const compNome = $(this).val().trim();
                if (compNome) {
                    dadosFormulario.nomesAcompanhantes.push(compNome);
                }
            });
        }

        // Enviar para API
        $loading.addClass('show');
        $.ajax({
            url: 'https://eventos-hmlo.onrender.com/api/Convidado/adicionar',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(dadosFormulario),
            success: function(response) {
                $loading.removeClass('show');
                exibirResumo(dadosFormulario, nome, iraAoEvento, tipoParticipacaoValue, quantidadeAcompanhantes, response);
            },
            error: function(xhr, status, error) {
                $loading.removeClass('show');
                console.error('Erro ao enviar formulário:', error);
                const erroResponse = xhr.responseJSON || { mensagem: 'Erro desconhecido ao enviar o formulário.' };
                exibirResumo(dadosFormulario, nome, iraAoEvento, tipoParticipacaoValue, quantidadeAcompanhantes, erroResponse);
            }
        });
    });

    // Função para exibir resumo
    function exibirResumo(dadosFormulario, nome, iraAoEvento, tipoParticipacaoValue, quantidadeAcompanhantes, response) {
        // Verificar se há erro na resposta
        // Considera erro se: codigoStatus >= 400 OU se houver mensagem de erro na resposta
        const codigoStatus = response && response.codigoStatus ? response.codigoStatus : null;
        const temErroStatus = codigoStatus && codigoStatus >= 400;
        const temErroMensagem = response && response.mensagem && response.mensagem.toLowerCase().includes('erro');
        const temErro = temErroStatus || temErroMensagem;
        
        if (temErro) {
            // É um erro da API - verificar se é limite de convidados
            const mensagemApi = response && typeof response.mensagem === 'string' ? response.mensagem.toLowerCase() : '';
            const ehErroLimite = mensagemApi.includes('limite') || mensagemApi.includes('100') || mensagemApi.includes('lotado') || mensagemApi.includes('cheio') || mensagemApi.includes('máxim');
            
            if (ehErroLimite) {
                // ❌ Erro de limite de convidados - BLOQUEIA PERMANENTEMENTE
                $btnSubmit.prop("disabled", true);
                formSubmitedSuccessfully = true;
                const mensagemErro = `<div class="alert alert-danger fw-bold" role="alert">🚫 <strong>Inscrições Encerradas!</strong> Infelizmente, atingimos o limite máximo de 100 convidados confirmados. Obrigado pelo interesse!</div>`;
                $resumoFormulario.html(mensagemErro).removeClass("d-none");
            } else {
                // ❌ Outro erro qualquer (validação, rede, bad request, etc) - LIBERA BOTÃO para tentar novamente
                $btnSubmit.prop("disabled", false);
                formSubmitedSuccessfully = false;
                let mensagemErro = "";
                if (response && typeof response.mensagem === 'string') {
                    mensagemErro = `<div class="alert alert-danger" role="alert">❌ ${escapeHtml(response.mensagem)}</div>`;
                } else {
                    mensagemErro = `<div class="alert alert-danger" role="alert">❌ Erro ao processar o formulário. Tente novamente.</div>`;
                }
                $resumoFormulario.html(mensagemErro).removeClass("d-none");
            }
            return;
        }
        
        // ✅ SUCESSO - BLOQUEIA PERMANENTEMENTE o botão
        $btnSubmit.prop("disabled", true);
        formSubmitedSuccessfully = true;
        
        // Mostra mensagem de sucesso
        $mensagemSucesso.removeClass("d-none").addClass("show");

        let mensagemPersonalizada = "";
        let resumoHTML = "";
        
        if (iraAoEvento === "não") {
            mensagemPersonalizada = `<div class="alert alert-warning mt-4 mb-0" role="alert">😢 Ficaremos triste com a sua não presença. Lamentamos, mas entendemos a sua ausência!</div>`;
        } else if (iraAoEvento === "sim") {
            if (tipoParticipacaoValue === "acompanhado") {
                mensagemPersonalizada = `<div class="alert alert-success mt-4 mb-0" role="alert">✅ Convidado cadastrado com sucesso! Estaremos também aguardando os seus acompanhantes!<br><br><small>💡 <strong>Dica:</strong> Você pode adicionar este evento ao seu calendário clicando no botão abaixo.</small></div>`;
            } else {
                mensagemPersonalizada = `<div class="alert alert-success mt-4 mb-0" role="alert">✅ Convidado cadastrado com sucesso!<br><br><small>💡 <strong>Dica:</strong> Você pode adicionar este evento ao seu calendário clicando no botão abaixo.</small></div>`;
            }
        }
        
        resumoHTML = mensagemPersonalizada;
        
        // Adicionar botão de download do calendário se foi para o evento
        if (iraAoEvento === "sim") {
            resumoHTML += `<div class="mt-4 text-center"><a href="#" class="btn btn-outline-primary btn-sm" id="btnBaixarCalendario" data-bs-toggle="tooltip" data-bs-title="Clique aqui pra adicionar nossa recepção ao seu calendario do telefone." title="Clique aqui pra adicionar nossa recepção ao seu calendario do telefone.">📅 Adicionar ao Calendário</a></div>`;
        }
        
        $resumoFormulario.html(resumoHTML).removeClass("d-none");
        
        // Adicionar evento ao botão de download
        if ($("#btnBaixarCalendario").length) {
            const tooltip = new bootstrap.Tooltip(document.getElementById('btnBaixarCalendario'));
            $("#btnBaixarCalendario").on("click", function(e) {
                e.preventDefault();
                gerarArquivoIcs();
            });
        }
    }

    // Função para gerar arquivo .ics (calendário)
    function gerarArquivoIcs() {
        // Data do evento: 25 de abril de 2026, 19:00 às 23:00
        const dataInicio = "20260425T190000"; // Data em formato iCalendar
        const dataFim = "20260425T230000";
        const dataAtual = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        
        const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Casamento Suzana e Fernando//PT
CALSCALE:GREGORIAN
BEGIN:VEVENT
DTSTART:${dataInicio}
DTEND:${dataFim}
DTSTAMP:${dataAtual}
UID:casamento-suzana-fernando@example.com
CREATED:${dataAtual}
DESCRIPTION:Recepção de Casamento de Suzana e Fernando\nLocal: Restaurante Picanha do Delei\nRua João Cândido, 81 - Posse, Nova Iguaçu\nRodízio de pizzas e massas - R$ 75,00 (adultos)\nInformações: https://www.instagram.com/picanhadodelei/
LAST-MODIFIED:${dataAtual}
LOCATION:Restaurante Picanha do Delei, Rua João Cândido, 81 - Posse, Nova Iguaçu
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:Recepção de Casamento - Suzana e Fernando
END:VEVENT
END:VCALENDAR`;
        
        // Criar blob e link de download
        const element = document.createElement("a");
        element.setAttribute("href", "data:text/calendar;charset=utf-8," + encodeURIComponent(ics));
        element.setAttribute("download", "casamento-suzana-fernando.ics");
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    // Evento de input no campo de nome para re-habilitar botão após sucesso
    $inputNome.on("input", function() {
        if (formSubmitedSuccessfully && $(this).val().trim() !== "") {
            $btnSubmit.prop("disabled", false);
            formSubmitedSuccessfully = false;
        }
    });

    // Evento de reset
    $form.on("reset", function() {
        setTimeout(() => {
            $mensagemSucesso.addClass("d-none").removeClass("show");
            $resumoFormulario.addClass("d-none");
            $secaoParticipacao.addClass("d-none").removeClass("show");
            $secaoDetalhesAcompanhamento.addClass("d-none");
            $containerNomesAcompanhantes.empty().addClass("d-none");
            $btnSubmit.prop("disabled", false);
            formSubmitedSuccessfully = false;
            limparErros();
        }, 0);
    });
});


