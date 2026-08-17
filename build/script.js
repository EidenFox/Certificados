const grid = document.getElementById('course-grid');
const modal = document.getElementById('course-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal');

/* INICIO DE FUNÇÃO DE [loadCourses]; esta função faz [a requisição fetch no courses_index.json unificado e a iteração para a criação dos cards no DOM] */
async function loadCourses() {
    try {
        const response = await fetch('./build/courses_index.json');
        if (!response.ok) throw new Error('Failed to load courses index');

        const courses = await response.json();
        courses.forEach(data => createCard(data));
    } catch (error) {
        console.error("Error loading courses:", error);
    }
}

/* INICIO DE FUNÇÃO DE [createCard]; esta função faz [a criação dos elementos HTML do card individual e sua injeção na grid] */
function createCard(data) {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
        <img src="${data.imagem_curso}" alt="Capa do Curso" class="card-img" onerror="this.src='https://via.placeholder.com/480x270?text=Sem+Imagem'">
        <div class="card-content">
            <h2 class="card-title">${data.nome_curso}</h2>
            <div class="card-meta">
                <span>⏱ ${data.tempo_curso || 'N/A'}</span>
                <span>📚 ${data.quantidade_aulas || '0'} aulas</span>
            </div>
        </div>
    `;

    card.addEventListener('click', () => openModal(data));
    grid.appendChild(card);
}

/* INICIO DE FUNÇÃO DE [openModal]; esta função faz [a injeção de dados no modal de exibição, renderiza o botão "Ver Certificado" e adiciona um Select para baixar os arquivos disponíveis] */
function openModal(data) {
    const topicsHtml = data.topicos_abordados && data.topicos_abordados.length > 0
        ? data.topicos_abordados.map(t => `<li>${t}</li>`).join('')
        : '<li>Nenhum tópico listado.</li>';

    const instructorImgHtml = data.imagem_professor
        ? `<img src="${data.imagem_professor}" alt="Foto do Professor" class="instructor-img">`
        : '';

    // Renderizando o grupo de download via Select
    let downloadOptionsHtml = '';
    if (data.certificado_pdf || data.certificado_jpg) {
        downloadOptionsHtml += `
            <div class="download-container" style="margin-top: 1rem; display: flex; gap: 0.5rem; align-items: center;">
                <select id="downloadFormat" style="padding: 0.5rem; border-radius: 0.25rem;">
                    <option value="" disabled selected>Escolha o formato...</option>
                    ${data.certificado_pdf ? `<option value="${data.certificado_pdf}">PDF</option>` : ''}
                    ${data.certificado_jpg ? `<option value="${data.certificado_jpg}">JPG</option>` : ''}
                </select>
                <button id="downloadBtn" class="cert-dwn" style="margin-top: 0; background-color: #3b82f6;">Baixar</button>
            </div>
        `;
    }

    // Renderizando os links de certificado
    let certLinkHtml = '';
    if (data.link_certificado) {
        certLinkHtml = `<a href="${data.link_certificado}" target="_blank" class="cert-link">Ver Certificado</a>`;
    }

    modalBody.innerHTML = `
        <div class="modal-header">
            <img src="${data.imagem_curso}" alt="Capa do Curso" class="modal-cover" onerror="this.src='https://via.placeholder.com/480x270?text=Sem+Imagem'">
            <div class="modal-info">
                <h2>${data.nome_curso}</h2>
                <div class="instructor-info">
                    ${instructorImgHtml}
                    <strong>${data.nome_professor || 'Professor não informado'}</strong>
                </div>
                <div>
                    <span class="badge">⏱ ${data.tempo_curso || 'N/A'}</span>
                    <span class="badge">📚 ${data.quantidade_aulas || '0'} aulas</span>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-start;">
                ${downloadOptionsHtml}
                </div>
            </div>
        </div>
        
        <h3>Descrição</h3>
        <div class="description">${data.descricao_curso || 'Sem descrição.'}</div>
        
        <h3>O que você aprenderá</h3>
        <ul class="topics-list">
            ${topicsHtml}
        </ul>
        ${certLinkHtml}

    `;

    modal.classList.remove('hidden');

    // Listener para o botão de Download
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const select = document.getElementById('downloadFormat');
            if (select.value) {
                const a = document.createElement('a');
                a.href = select.value;
                a.download = '';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                alert('Por favor, selecione um formato primeiro.');
            }
        });
    }
}

closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
    }
});

loadCourses();