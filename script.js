$(document).ready(function() {
    const $form = $('#formularioEvento');
    const $attendingRadios = $('input[name="iraAoEvento"]');
    const $companionSection = $('#secaoParticipacao');
    const $companionCheckboxes = $('input[name="tipoDeParticipacao"]');
    const $successMessage = $('#mensagemSucesso');
    const $formSummary = $('#resumoFormulario');
    const $nameInput = $('#inputNome');
    const $aloneCheckbox = $('#checkboxSozinho');
    const $accompaniedCheckbox = $('#checkboxAcompanhado');
    const $companionDetailsSection = $('#secaoDetalhesAcompanhamento');
    const $companionCount = $('#inputQuantidadeAcompanhantes');
    const $companionNamesContainer = $('#containerNomesAcompanhantes');
    
    // Mensagens de erro
    const $nameError = $('#erroNome');
    const $attendingError = $('#erroIraAoEvento');
    const $companionError = $('#erroTipoParticipacao');
    const $companionCountError = $('#erroQuantidadeAcompanhantes');
    const $companionNamesError = $('#erroNomesAcompanhantes');

    // Limpar mensagens de erro
    function clearErrors() {
        $nameError.removeClass('show');
        $attendingError.removeClass('show');
        $companionError.removeClass('show');
        $companionCountError.removeClass('show');
        $companionNamesError.removeClass('show');
    }

    // Mostrar/ocultar seção condicional baseado na resposta
    function toggleCompanionSection() {
        const isAttending = $('#radioSimIrei').is(':checked');
        
        if (isAttending) {
            $companionSection.removeClass('d-none').addClass('show');
            $companionCheckboxes.prop('required', true);
        } else {
            $companionSection.addClass('d-none').removeClass('show');
            $companionCheckboxes.prop('required', false).prop('checked', false);
            $companionDetailsSection.addClass('d-none');
            $companionCount.val('0');
            $companionNamesContainer.empty().addClass('d-none');
            $companionError.removeClass('show');
            $companionCountError.removeClass('show');
            $companionNamesError.removeClass('show');
        }
    }

    // Mostrar/ocultar detalhes de acompanhantes
    function toggleCompanionDetails() {
        const isAccompanied = $accompaniedCheckbox.is(':checked');
        
        if (isAccompanied) {
            $companionDetailsSection.removeClass('d-none');
            $companionCount.prop('required', true).val('');
            $companionNamesContainer.empty().addClass('d-none');
        } else {
            $companionDetailsSection.addClass('d-none');
            $companionCount.prop('required', false).val('');
            $companionNamesContainer.empty().addClass('d-none');
            $companionCountError.removeClass('show');
            $companionNamesError.removeClass('show');
        }
    }

    // Gerar campos de texto para nomes de acompanhantes
    function generateCompanionNameFields() {
        const count = parseInt($companionCount.val()) || 0;
        
        if (count > 0 && count <= 10) {
            $companionNamesContainer.empty();
            
            for (let i = 1; i <= count; i++) {
                const inputGroup = `
                    <div class="companion-input-group">
                        <label for="companionName${i}">Acompanhante ${i}</label>
                        <input type="text" class="form-control companion-name-input" 
                               id="companionName${i}" 
                               name="companionName${i}" 
                               placeholder="Digite o nome do acompanhante" 
                               maxlength="50"
                               required>
                    </div>
                `;
                $companionNamesContainer.append(inputGroup);
            }
            
            $companionNamesContainer.removeClass('d-none');
            $companionCountError.removeClass('show');
        } else if (count === 0 && $companionCount.val() === '0') {
            // Se o usuário digitou explicitamente 0
            $companionCountError.text('Por favor, informe uma quantidade a partir de 1 ou escolha "Vou sozinho(a)".');
            $companionCountError.addClass('show');
            $companionNamesContainer.empty().addClass('d-none');
        } else {
            $companionNamesContainer.empty().addClass('d-none');
            $companionCountError.removeClass('show');
        }
    }

    // Listeners para os radiobuttons
    $attendingRadios.on('change', function() {
        toggleCompanionSection();
        clearErrors();
    });

    // Listeners para os checkboxes de acompanhamento
    $companionCheckboxes.on('change', function() {
        if ($(this).is(':checked')) {
            $companionCheckboxes.not(this).prop('checked', false);
        }
        // Aguardar um tick para garantir que a desmarcação foi processada
        setTimeout(function() {
            toggleCompanionDetails();
            $companionError.removeClass('show');
        }, 0);
    });

    // Listener para quantidade de acompanhantes
    $companionCount.on('change', function() {
        generateCompanionNameFields();
        $companionCountError.removeClass('show');
    });

    // Submeter formulário
    $form.on('submit', function(e) {
        e.preventDefault();
        clearErrors();

        const name = $nameInput.val();
        const attending = $('input[name="iraAoEvento"]:checked').val();
        const companionChecked = $('input[name="tipoDeParticipacao"]:checked');
        const companion = companionChecked.length > 0 ? companionChecked.val() : '-';
        const companionCount = parseInt($companionCount.val()) || 0;

        let isValid = true;

        // Validação: nome não pode estar vazio
        if (!name.trim()) {
            $nameError.addClass('show');
            isValid = false;
        }

        // Validação: presença no evento deve ser selecionada
        if (!attending) {
            $attendingError.addClass('show');
            isValid = false;
        }

        // Validação: se vai ao evento, precisa selecionar uma opção de companhia
        if (attending === 'sim' && companionChecked.length === 0) {
            $companionError.addClass('show');
            isValid = false;
        }

        // Validação: se acompanhado, precisa preencher quantidade
        if (companion === 'acompanhado' && companionCount === 0) {
            $companionCountError.text('Por favor, informe uma quantidade a partir de 1 ou escolha "Vou sozinho(a)".');
            $companionCountError.addClass('show');
            isValid = false;
        }

        // Validação: se acompanhado, todos os nomes devem estar preenchidos
        if (companion === 'acompanhado' && companionCount > 0) {
            let allNamesFilled = true;
            $('.companion-name-input').each(function() {
                if (!$(this).val().trim()) {
                    allNamesFilled = false;
                    return false;
                }
            });

            if (!allNamesFilled) {
                $companionNamesError.addClass('show');
                isValid = false;
            }
        }

        if (!isValid) {
            return;
        }

        // Construir objeto com os dados do formulário
        const dadosFormulario = {
            nome: name.trim(),
            iraAoEvento: attending,
            tipoDeParticipacao: companion,
            quantidadeDeAcompanhantes: companion === 'acompanhado' ? companionCount : 0,
            nomesAcompanhantes: []
        };

        // Adicionar nomes dos acompanhantes
        if (companion === 'acompanhado') {
            $('.companion-name-input').each(function() {
                const companionName = $(this).val().trim();
                if (companionName) {
                    dadosFormulario.nomesAcompanhantes.push(companionName);
                }
            });
        }

        // Enviar dados para o servidor
        $.ajax({
            url: 'https://seu-endpoint-aqui.com/api/form', // SUBSTITUIR POR SEU ENDPOINT
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(dadosFormulario),
            success: function(response) {
                // Sucesso na resposta
                $successMessage.removeClass('d-none').addClass('show');

                // Montar resumo
                const attendingText = attending === 'sim' ? 'Sim' : 'Não';
                const companionText = companion === 'sozinho' ? 'Sozinho(a)' : 
                                     companion === 'acompanhado' ? 'Acompanhado(a)' : '-';

                let summaryHTML = `
                    <div class="card-body">
                        <p class="mb-2"><strong>Nome:</strong> ${escapeHtml(name)}</p>
                        <p class="mb-2"><strong>Irá ao evento:</strong> ${attendingText}</p>
                `;

                if (attending === 'sim') {
                    summaryHTML += `<p class="mb-2"><strong>Forma de participação:</strong> ${companionText}</p>`;
                    
                    if (companion === 'acompanhado') {
                        summaryHTML += `<p class="mb-2"><strong>Quantidade de acompanhantes:</strong> ${companionCount}</p>`;
                        summaryHTML += `<p class="mb-0"><strong>Nomes dos acompanhantes:</strong></p><ul class="mt-2">`;
                        
                        $('.companion-name-input').each(function() {
                            const companionName = $(this).val().trim();
                            if (companionName) {
                                summaryHTML += `<li>${escapeHtml(companionName)}</li>`;
                            }
                        });
                        
                        summaryHTML += `</ul>`;
                    }
                }

                summaryHTML += `</div>`;

                $formSummary.html(summaryHTML).removeClass('d-none');

                // Limpar campos após 2 segundos
                setTimeout(() => {
                    $form[0].reset();
                    $companionSection.addClass('d-none').removeClass('show');
                    $successMessage.addClass('d-none').removeClass('show');
                    $formSummary.addClass('d-none');
                    $companionDetailsSection.addClass('d-none');
                    $companionNamesContainer.empty().addClass('d-none');
                    clearErrors();
                }, 2000);
            },
            error: function(xhr, status, error) {
                // Erro na resposta
                console.error('Erro ao enviar formulário:', error);
                alert('Erro ao enviar o formulário. Por favor, tente novamente.');
            }
        });
    });

    // Limpar formulário
    $form.on('reset', function() {
        setTimeout(() => {
            $successMessage.addClass('d-none').removeClass('show');
            $formSummary.addClass('d-none');
            $companionSection.addClass('d-none').removeClass('show');
            $companionDetailsSection.addClass('d-none');
            $companionNamesContainer.empty().addClass('d-none');
            clearErrors();
        }, 0);
    });

    // Função para escapar HTML e prevenir XSS
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
});


