let entries = JSON.parse(localStorage.getItem('passwordEntries') || '[]');
let selectedIndex = null;

const settingsBtn = document.getElementById('settingsBtn');
const entriesList = document.getElementById('entriesList');
const entryDetail = document.getElementById('entryDetail');
const searchInput = document.getElementById('searchInput');
const importFile = document.getElementById('importFile');
const addEntryBtn = document.getElementById('addEntryBtn');

function promptPasswordModal(message) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'modal';

    modal.innerHTML = `
      <div class="modal-box">
        <h2>${message}</h2>
        <input id="modalPasswordInput" type="password" placeholder="Clave" class="form-input" />
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
          <button id="modalCancelBtn" class="button button-danger">Cancelar</button>
          <button id="modalOkBtn" class="button button-green">Aceptar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const input = modal.querySelector('#modalPasswordInput');
    const cancelBtn = modal.querySelector('#modalCancelBtn');
    const okBtn = modal.querySelector('#modalOkBtn');

    function cleanup() {
      modal.remove();
    }

    cancelBtn.onclick = () => {
      cleanup();
      resolve(null);
    };

    okBtn.onclick = () => {
      const val = input.value.trim();
      if (!val) {
        input.focus();
        return;
      }
      cleanup();
      resolve(val);
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') okBtn.click();
      if (e.key === 'Escape') cancelBtn.click();
    });

    input.focus();
  });
}

function alertModal(message) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'modal';

    modal.innerHTML = `
      <div class="modal-box text-center">
        <p>${message}</p>
        <button id="alertCloseBtn" class="button button-accent" style="margin-top: 1rem;">Cerrar</button>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#alertCloseBtn');
    closeBtn.onclick = () => {
      modal.remove();
      resolve();
    };
  });
}

function saveEntries() {
  localStorage.setItem('passwordEntries', JSON.stringify(entries));
}

function renderList(filter = '') {
  entriesList.innerHTML = '';
  const filtered = entries.filter(e =>
    e.website.toLowerCase().includes(filter.toLowerCase()) ||
    e.email.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    entriesList.innerHTML = `<p class="text-accent text-center" style="margin-top: 2rem;">Sin resultados</p>`;
    return;
  }

  filtered.forEach((entry) => {
    const div = document.createElement('div');
    div.className = 'entry-card';
    div.innerHTML = `
      <img src="https://www.google.com/s2/favicons?domain=${entry.website}" style="width: 2rem; height: 2rem; border-radius: 50%;" />
      <div style="display: flex; flex-direction: column; overflow: hidden;">
        <span style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${entry.website}</span>
        <span class="text-accent" style="font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${entry.email}</span>
      </div>
    `;
    div.onclick = () => {
      selectedIndex = entries.indexOf(entry);
      renderDetail();
    };
    entriesList.appendChild(div);
  });
}

function renderDetail() {
  const entry = entries[selectedIndex];
  if (!entry) return;

  entryDetail.innerHTML = `
    <div class="space-y-4">
      <div>
        <h2 style="font-size: 1.5rem; font-weight: 600;">${entry.website}</h2>
        <a href="https://${entry.website}" class="text-accent" target="_blank" style="text-decoration: underline;">${entry.website}</a>
      </div>

      <div>
        <p class="text-accent" style="font-size: 0.875rem; margin-bottom: 0.25rem;">Correo electrónico</p>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <input type="text" readonly value="${entry.email}" class="input-copy" />
          <button onclick="navigator.clipboard.writeText('${entry.email}')" class="text-accent">📋</button>
        </div>
      </div>

      <div>
        <p class="text-accent" style="font-size: 0.875rem; margin-bottom: 0.25rem;">Contraseña</p>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <input id="passInput" type="password" readonly value="${entry.password}" class="input-copy" />
          <button onclick="document.getElementById('passInput').type = document.getElementById('passInput').type === 'password' ? 'text' : 'password'" class="text-accent">👁️</button>
          <button onclick="navigator.clipboard.writeText('${entry.password}')" class="text-accent">📋</button>
        </div>
      </div>

      <div>
        <p class="text-accent" style="font-size: 0.875rem; margin-bottom: 0.25rem;">Nota</p>
        <p style="white-space: pre-wrap;">${entry.note || '-'}</p>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
        <button onclick="openForm(true)" class="button button-accent">✏️ Editar</button>
        <button onclick="deleteEntry()" class="button button-danger">🗑️ Eliminar</button>
      </div>
    </div>
  `;
}

function deleteEntry() {
  // Crear el modal como elemento DOM
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-box">
      <p class="text-accent text-center" style="margin-bottom: 1rem;">¿Eliminar esta entrada?</p>
      <div class="buttons" style="display: flex; gap: 1rem; justify-content: center;">
        <button class="button button-danger" id="confirmDeleteBtn">Confirmar</button>
        <button class="button" id="cancelDeleteBtn">Cancelar</button>
      </div>
    </div>
  `;

  // Añadir modal al body (fuera de entryDetail)
  document.body.appendChild(modal);

  // Botones para confirmar o cancelar
  document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    entries.splice(selectedIndex, 1);
    saveEntries();
    selectedIndex = null;
    renderList(searchInput.value);
    entryDetail.innerHTML = `<p class="text-accent text-center">Selecciona una entrada</p>`;
    modal.remove(); // quitar modal al confirmar
  });

  document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
    entryDetail.innerHTML = `<p class="text-accent text-center">Selecciona una entrada</p>`;
    modal.remove(); // quitar modal al cancelar
  });
}



function openForm(edit = false) {
  const entry = edit ? entries[selectedIndex] : { website: '', email: '', password: '', note: '' };
  const form = document.createElement('div');
  form.className = 'modal';

  form.innerHTML = `
    <div class="modal-box">
      <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem;">${edit ? 'Editar' : 'Nuevo'} Login</h2>
      <input type="text" id="formWebsite" value="${entry.website}" placeholder="Sitio web" class="form-input" />
      <input type="text" id="formEmail" value="${entry.email}" placeholder="Correo" class="form-input" />
      <input type="text" id="formPassword" value="${entry.password}" placeholder="Contraseña" class="form-input" />
      <textarea id="formNote" rows="3" placeholder="Nota..." class="form-input textarea-notes">${entry.note || ''}</textarea>
      <div style="display: flex; justify-content: space-between; margin-top: 1rem;">
        <button class="button button-danger" onclick="this.closest('.modal').remove()">Cancelar</button>
        <button class="button button-green" onclick="saveForm(${edit})">Guardar</button>
      </div>
    </div>
  `;
  document.body.appendChild(form);
}

function setTheme(mode) {
  const body = document.body;
  if (mode === 'light') {
    body.classList.add('light');
  } else {
    body.classList.remove('light');
  }
  localStorage.setItem('themeMode', mode);
}

function openSettings() {
  if (document.getElementById('settingsModal')) return;

  const modal = document.createElement('div');
  modal.id = 'settingsModal';
  modal.className = 'modal';

  modal.innerHTML = `
    <div class="modal-box">
      <h2 style="font-size: 1.25rem; font-weight: bold;">Ajustes</h2>
      <hr style="border-color: #5b21b6;" />
      <div style="display: flex; justify-content: space-between; gap: 0.5rem; margin-top: 1rem;">
        <button id="exportBtnSettings" class="button button-accent">Exportar</button>
        <button id="importBtnSettings" class="button button-accent">Importar</button>
      </div>

      <hr style="border-color: #5b21b6; margin: 1.5rem 0;" />

      <div style="display: flex; justify-content: space-between; gap: 0.5rem;">
        <button id="btnLightMode" class="button button-accent">Modo Claro</button>
        <button id="btnDarkMode" class="button button-accent">Modo Oscuro</button>
      </div>

      <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
        <button id="closeSettingsBtn" class="button button-danger">Cerrar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('#exportBtnSettings').onclick = () => {
    exportEntries();
  };

  modal.querySelector('#importBtnSettings').onclick = () => {
    importFile.click();
  };

  modal.querySelector('#btnLightMode').onclick = () => {
    setTheme('light');
  };

  modal.querySelector('#btnDarkMode').onclick = () => {
    setTheme('dark');
  };

  modal.querySelector('#closeSettingsBtn').onclick = () => {
    modal.remove();
  };

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// Aplica el tema guardado al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  const savedMode = localStorage.getItem('themeMode') || 'dark';
  setTheme(savedMode);
});


async function exportEntries() {
  const password = await promptPasswordModal('Clave para cifrar el archivo:');
  if (!password) return;
  try {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(entries), password).toString();
    const blob = new Blob([encrypted], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'passwords.json';
    a.click();
    URL.revokeObjectURL(url);
    await alertModal('Exportación completada correctamente.');
  } catch {
    await alertModal('Error durante la exportación.');
  }
}

importFile.onchange = async () => {
  const file = importFile.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    const password = await promptPasswordModal('Clave para descifrar el archivo:');
    if (!password) return;
    try {
      const decrypted = CryptoJS.AES.decrypt(reader.result, password).toString(CryptoJS.enc.Utf8);
      const data = JSON.parse(decrypted);
      entries = data;
      saveEntries();
      renderList(searchInput.value);
      entryDetail.innerHTML = `<p class="text-accent text-center">Importación completada</p>`;
      await alertModal('Importación completada correctamente.');
    } catch (e) {
      await alertModal('Error al descifrar o archivo inválido.');
    }
    importFile.value = '';
  };
  reader.readAsText(file);
};

function saveForm(edit) {
  const website = document.getElementById('formWebsite').value.trim();
  const email = document.getElementById('formEmail').value.trim();
  const password = document.getElementById('formPassword').value.trim();
  const note = document.getElementById('formNote').value.trim();

  if (!website || !email || !password) {
    alert('Por favor, completa los campos: Sitio web, Correo y Contraseña.');
    return;
  }

  const entry = { website, email, password, note };
  if (edit) {
    entries[selectedIndex] = entry;
  } else {
    entries.push(entry);
  }

  saveEntries();
  document.querySelector('.modal').remove();
  renderList(searchInput.value);
  if (edit) renderDetail();
}

searchInput.oninput = () => renderList(searchInput.value);
addEntryBtn.onclick = () => openForm(false);
settingsBtn.onclick = openSettings;

renderList();
entryDetail.innerHTML = `<p class="text-accent text-center">Selecciona una entrada</p>`;
