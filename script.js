$(document).ready(function() {
    // Cache de elementos
    const $form = $("#formularioEvento");
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
        const char = String.fromCharCode(event.which);
        if (/[0-9]/.test(char)) {
            event.preventDefault();
        }
    }

    // Função para alternar seção de participação
    function toggleCompanionSection() {
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
    function toggleCompanionDetails() {
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

    // Função para gerar campos de nomes dos acompanhantes
    function generateCompanionNameFields() {
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
    $inputNome.on("keypress", preventNumbers);

    $radioPresenca.on("change", function() {
        toggleCompanionSection();
        limparErros();
    });

    $checkboxParticipacao.on("change", function() {
        $(this).is(":checked") && $checkboxParticipacao.not(this).prop("checked", false);
        toggleCompanionDetails();
        $erroTipoParticipacao.removeClass("show");
    });

    $inputQuantidadeAcompanhantes.on("change", function() {
        generateCompanionNameFields();
    });

    // Evento de submissão
    $form.on("submit", function(e) {
        e.preventDefault();
        limparErros();

        const nome = $inputNome.val();
        const iraAoEvento = $('input[name="iraAoEvento"]:checked').val();
        const tipoDeParticipacao = $('input[name="tipoDeParticipacao"]:checked');
        const tipoParticipacaoValue = tipoDeParticipacao.length > 0 ? tipoDeParticipacao.val() : "-";
        const quantidadeAcompanhantes = parseInt($inputQuantidadeAcompanhantes.val()) || 0;

        let isValid = true;

        // Validações
        if (!nome.trim()) {
            $erroNome.addClass("show");
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

        if (!isValid) return;

        // Preparar dados
        const dadosFormulario = {
            nome: nome.trim(),
            iraAoEvento: iraAoEvento,
            tipoDeParticipacao: tipoParticipacaoValue,
            quantidadeDeAcompanhantes: tipoParticipacaoValue === "acompanhado" ? quantidadeAcompanhantes : 0,
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
        $.ajax({
            url: 'https://localhost:5000/api/Convidado/adicionar',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(dadosFormulario),
            success: function(response) {
                exibirResumo(dadosFormulario, nome, iraAoEvento, tipoParticipacaoValue, quantidadeAcompanhantes);
            },
            error: function(xhr, status, error) {
                console.error('Erro ao enviar formulário:', error);
                // Mesmo com erro, mostrar o resumo
                exibirResumo(dadosFormulario, nome, iraAoEvento, tipoParticipacaoValue, quantidadeAcompanhantes);
            }
        });
    });

    // Função para exibir resumo
    function exibirResumo(dadosFormulario, nome, iraAoEvento, tipoParticipacaoValue, quantidadeAcompanhantes) {
        $mensagemSucesso.removeClass("d-none").addClass("show");

        let resumoHTML = `<div class="card-body"><p class="mb-2"><strong>Nome:</strong> ${escapeHtml(nome)}</p><p class="mb-2"><strong>Irá ao evento:</strong> ${iraAoEvento === "sim" ? "Sim" : "Não"}</p>`;

        if (iraAoEvento === "sim") {
            const tipoParticipacao = tipoParticipacaoValue === "sozinho" ? "Sozinho(a)" : tipoParticipacaoValue === "acompanhado" ? "Acompanhado(a)" : "-";
            resumoHTML += `<p class="mb-2"><strong>Forma de participação:</strong> ${tipoParticipacao}</p>`;

            if (tipoParticipacaoValue === "acompanhado") {
                resumoHTML += `<p class="mb-2"><strong>Quantidade de acompanhantes:</strong> ${quantidadeAcompanhantes}</p><p class="mb-0"><strong>Nomes dos acompanhantes:</strong></p><ul class="mt-2">`;
                $containerNomesAcompanhantes.find(".companion-name-input").each(function() {
                    const compNome = $(this).val().trim();
                    if (compNome) {
                        resumoHTML += `<li>${escapeHtml(compNome)}</li>`;
                    }
                });
                resumoHTML += `</ul>`;
            }
        }

        resumoHTML += `</div>`;
        $resumoFormulario.html(resumoHTML).removeClass("d-none");

        setTimeout(() => {
            $form[0].reset();
            $secaoParticipacao.addClass("d-none").removeClass("show");
            $mensagemSucesso.addClass("d-none").removeClass("show");
            $resumoFormulario.addClass("d-none");
            $secaoDetalhesAcompanhamento.addClass("d-none");
            $containerNomesAcompanhantes.empty().addClass("d-none");
            limparErros();
        }, 2000);
    }

    // Função para escapar HTML
    function escapeHtml(text) {
        const htmlEscapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, char => htmlEscapeMap[char]);
    }

    // Evento de reset
    $form.on("reset", function() {
        setTimeout(() => {
            $mensagemSucesso.addClass("d-none").removeClass("show");
            $resumoFormulario.addClass("d-none");
            $secaoParticipacao.addClass("d-none").removeClass("show");
            $secaoDetalhesAcompanhamento.addClass("d-none");
            $containerNomesAcompanhantes.empty().addClass("d-none");
            limparErros();
        }, 0);
    });
});


