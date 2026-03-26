$(document).ready(function() {
    // Verificar se o prazo de inscrições passou
    function verificarPrazoInscricoes() {
        const agora = new Date();
        // Prazo: 22/04/2026, 18:59
        const prazoLimite = new Date(2026, 3, 22, 18, 59, 59, 999); // Mês 3 = abril
        if (agora > prazoLimite) {
            // Prazo passou - travar form
            $form.find('input, textarea, select, button').prop('disabled', true);
            $("#alertaPrazoEncerrado").removeClass("d-none");
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
        $erroNome.addClass("d-none").removeClass("show");
        $erroIraAoEvento.addClass("d-none").removeClass("show");
        $erroTipoParticipacao.addClass("d-none").removeClass("show");
        $erroQuantidadeAcompanhantes.addClass("d-none").removeClass("show");
        $erroNomesAcompanhantes.addClass("d-none").removeClass("show");
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
            $erroTipoParticipacao.addClass("d-none").removeClass("show");
            $erroQuantidadeAcompanhantes.addClass("d-none").removeClass("show");
            $erroNomesAcompanhantes.addClass("d-none").removeClass("show");
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
            $erroQuantidadeAcompanhantes.addClass("d-none").removeClass("show");
            $erroNomesAcompanhantes.addClass("d-none").removeClass("show");
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
                const tmpl = document.getElementById("templateAcompanhante");
                const clone = tmpl.content.cloneNode(true);
                clone.querySelector("label").setAttribute("for", "companionName" + i);
                clone.querySelector("label").textContent = "Insira o nome do " + ordinal + " acompanhante";
                clone.querySelector("input").setAttribute("id", "companionName" + i);
                clone.querySelector("input").setAttribute("name", "companionName" + i);
                $containerNomesAcompanhantes.append(clone);
                $("#companionName" + i).on("keypress", preventNumbers);
            }
            $containerNomesAcompanhantes.removeClass("d-none");
            $erroQuantidadeAcompanhantes.addClass("d-none").removeClass("show");
        } else if (quantity === 0 && $inputQuantidadeAcompanhantes.val() === "0") {
            $erroQuantidadeAcompanhantes.text("Por favor, informe a partir de 1 acompanhante, ou informe que você vai sozinha.").removeClass("d-none").addClass("show");
            $containerNomesAcompanhantes.empty().addClass("d-none");
        } else {
            $containerNomesAcompanhantes.empty().addClass("d-none");
            $erroQuantidadeAcompanhantes.addClass("d-none").removeClass("show");
        }
    }

    // Função para atualizar a barra de progresso de vagas
    function atualizarBarraVagas(vagasRestantes, pessoasConfirmadas) {
        const total = 105;
        const preenchido = typeof pessoasConfirmadas === 'number' ? pessoasConfirmadas : total - vagasRestantes;
        const percentual = Math.min((preenchido / total) * 100, 100);

        const $barra = $("#barraVagas");
        const $texto = $("#textoVagas");
        const $contagem = $("#textoContagem");

        $barra.css("width", percentual + "%").attr("aria-valuenow", percentual);
        $contagem.text(preenchido + "/" + total + " pessoas");

        // Variação de cor conforme vagas restantes
        $barra.removeClass("bg-success bg-warning bg-danger text-dark");
        if (vagasRestantes > 50) {
            $barra.addClass("bg-success");
            $texto.text("🟢 " + vagasRestantes + " vagas disponíveis");
        } else if (vagasRestantes > 20) {
            $barra.addClass("bg-warning text-dark");
            $texto.text("🟡 Atenção! Apenas " + vagasRestantes + " vagas restantes");
        } else if (vagasRestantes > 0) {
            $barra.addClass("bg-danger");
            $texto.text("🔴 Últimas " + vagasRestantes + " vagas! Corra!");
        } else {
            $barra.addClass("bg-danger");
            $texto.text("🚫 Vagas esgotadas!");
        }
    }

    // Função para buscar vagas na API
    function buscarVagasRestantes() {
        $.ajax({
            url: 'https://eventos-hmlo.onrender.com/api/Convidado/vagas-restantes',
            type: 'GET',
            success: function(response) {
                if (response && typeof response.vagasRestantes === 'number') {
                    atualizarBarraVagas(response.vagasRestantes, response.pessoasConfirmadas);
                }
            },
            error: function() {
                $("#textoVagas").text("Não foi possível carregar as vagas.");
            }
        });
    }

    // Eventos
    verificarPrazoInscricoes(); // Verificar prazo antes de qualquer coisa
    buscarVagasRestantes(); // Carregar vagas ao inicializar
    setInterval(buscarVagasRestantes, 30000); // Polling a cada 30 segundos

    // Contagem regressiva de dias até o prazo
    function atualizarContagemDias() {
        const agora = new Date();
        const prazo = new Date(2026, 3, 22, 18, 59, 59, 999); // 22/04/2026 18:59
        const diffMs = prazo - agora;
        const $badge = $("#contagemDias");
        $badge.removeClass("bg-success bg-warning text-dark bg-danger");

        if (diffMs < 0) {
            $badge.addClass("bg-danger").text("🚫 Prazo encerrado");
            return;
        }

        const totalMinutos = Math.floor(diffMs / 60000);
        const totalHoras   = Math.floor(diffMs / 3600000);
        const dias         = Math.floor(diffMs / 86400000);
        const horas        = Math.floor((diffMs % 86400000) / 3600000);
        const minutos      = Math.floor((diffMs % 3600000) / 60000);

        if (dias > 2) {
            // Mais de 2 dias: exibe só os dias
            $badge.addClass(dias > 10 ? "bg-success" : dias >= 5 ? "bg-warning text-dark" : "bg-danger")
                  .text("📅 " + dias + " dias restantes");
        } else if (totalHoras >= 24) {
            // 1–2 dias: exibe dias + horas
            const dLabel = dias === 1 ? "1 dia" : dias + " dias";
            $badge.addClass("bg-danger").text("⚠️ " + dLabel + " e " + horas + "h restantes");
        } else if (totalMinutos >= 60) {
            // Menos de 1 dia: exibe horas + minutos
            $badge.addClass("bg-danger").text("🔥 " + totalHoras + "h " + minutos + "min restantes");
        } else {
            // Menos de 1 hora: exibe só minutos
            $badge.addClass("bg-danger").text("⚡ " + totalMinutos + " minuto" + (totalMinutos !== 1 ? "s" : "") + " restantes");
        }
    }
    atualizarContagemDias();
    setInterval(atualizarContagemDias, 60000); // Atualiza a cada minuto

    // Inicializar botão de adicionar ao calendário
    new bootstrap.Tooltip(document.getElementById('btnBaixarCalendario'));
    $("#btnBaixarCalendario").on("click", function(e) {
        e.preventDefault();
        gerarArquivoIcs();
    });

    const $modalNome = new bootstrap.Modal(document.getElementById('modalNomeRegistrado'));

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
                    const existeConvidado = response && response.existeComoConvidado;
                    const existeAcompanhante = response && response.existeComoAcompanhante;

                    if (existeConvidado || existeAcompanhante) {
                        let tipoDuplicado, mensagemModal;

                        if (existeConvidado) {
                            tipoDuplicado = 'convidado';
                            mensagemModal = 'Este nome já está registrado na lista de presença como convidado. Caso deseje atualizar seus dados, entre em contato conosco.';
                        } else {
                            tipoDuplicado = 'acompanhante';
                            mensagemModal = 'Este nome já está registrado como acompanhante de outro convidado. Caso precise de esclarecimentos, entre em contato conosco.';
                        }

                        $('#modalNomeRegistrado .modal-body p').text(mensagemModal);
                        $modalNome.show();
                        $inputNome.attr('data-duplicado', tipoDuplicado);
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
        $erroTipoParticipacao.addClass("d-none").removeClass("show");
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
            $erroNome.text("Por favor, insira seu nome completo (nome e sobrenome).").removeClass("d-none").addClass("show");
            isValid = false;
        }

        if (!iraAoEvento) {
            $erroIraAoEvento.removeClass("d-none").addClass("show");
            isValid = false;
        }

        if (iraAoEvento === "sim" && tipoDeParticipacao.length === 0) {
            $erroTipoParticipacao.removeClass("d-none").addClass("show");
            isValid = false;
        }

        if (tipoParticipacaoValue === "acompanhado" && quantidadeAcompanhantes === 0) {
            $erroQuantidadeAcompanhantes.text("Por favor, informe a partir de 1 acompanhante, ou informe que você vai sozinha.").removeClass("d-none").addClass("show");
            isValid = false;
        }

        if (tipoParticipacaoValue === "acompanhado" && quantidadeAcompanhantes > 0) {
            const emptyCompanions = $containerNomesAcompanhantes.find(".companion-name-input").filter(function() {
                return !$(this).val().trim();
            });
            if (emptyCompanions.length > 0) {
                $erroNomesAcompanhantes.removeClass("d-none").addClass("show");
                isValid = false;
            }
        }

        // Se há erro de validação, reabilita o botão e retorna
        if (!isValid) {
            $btnSubmit.prop("disabled", false);
            return;
        }

        // Verificar se o nome é duplicado
        const tipoDuplicado = $inputNome.attr('data-duplicado');
        if (tipoDuplicado) {
            let mensagemDuplicado;
            if (tipoDuplicado === 'convidado') {
                mensagemDuplicado = 'Este nome já está registrado como convidado. Caso precise de ajuda, entre em contato conosco.';
            } else {
                mensagemDuplicado = 'Este nome já está registrado como acompanhante de outro convidado. Caso precise de ajuda, entre em contato conosco.';
            }
            $erroNome.text(mensagemDuplicado).removeClass("d-none").addClass("show");
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
                // Atualizar barra de vagas com dados da resposta do cadastro
                if (response && typeof response.vagasRestantes === 'number') {
                    atualizarBarraVagas(response.vagasRestantes, response.pessoasConfirmadas);
                }
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
            const ehErroLimite = mensagemApi.includes('limite') || mensagemApi.includes('100') || mensagemApi.includes('105') || mensagemApi.includes('lotado') || mensagemApi.includes('cheio') || mensagemApi.includes('máxim');
            
            if (ehErroLimite) {
                // ❌ Erro de limite de convidados - BLOQUEIA PERMANENTEMENTE
                $btnSubmit.prop("disabled", true);
                formSubmitedSuccessfully = true;
                const mensagemErro = `<div class="alert alert-danger fw-bold" role="alert">🚫 <strong>Inscrições Encerradas!</strong> Infelizmente, atingimos o limite máximo de 105 convidados confirmados. Obrigado pelo interesse!</div>`;
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
        
        $resumoFormulario.html(resumoHTML).removeClass("d-none");
        
        if (iraAoEvento === "sim") {
            $("#secaoCalendario").removeClass("d-none");
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
    // Também limpa o flag de duplicado para não bloquear nova tentativa com nome diferente
    $inputNome.on("input", function() {
        $(this).removeAttr('data-duplicado');
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
            $("#secaoCalendario").addClass("d-none");
            $btnSubmit.prop("disabled", false);
            formSubmitedSuccessfully = false;
            $inputNome.removeAttr('data-duplicado');
            limparErros();
        }, 0);
    });
});


