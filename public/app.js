const apiUrl = '/api/items';
const itemForm = document.getElementById('item-form');
const itemIdInput = document.getElementById('item-id');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const itemsList = document.getElementById('items-list');
const messageBox = document.getElementById('message');
const cancelButton = document.getElementById('cancel-button');

function showMessage(text, isError = false) {
  messageBox.textContent = text;
  messageBox.style.color = isError ? '#d32f2f' : '#1e3a8a';
  if (text) {
    setTimeout(() => {
      messageBox.textContent = '';
    }, 3000);
  }
}

function clearForm() {
  itemIdInput.value = '';
  titleInput.value = '';
  descriptionInput.value = '';
  itemForm.querySelector('button[type="submit"]').textContent = 'Save Item';
}

async function fetchItems() {
  const response = await fetch(apiUrl);
  const items = await response.json();
  itemsList.innerHTML = items.map(renderItemRow).join('');
}

function renderItemRow(item) {
  return `
    <tr>
      <td>${escapeHtml(item.title)}</td>
      <td>${escapeHtml(item.description || '')}</td>
      <td class="actions">
        <button type="button" onclick="editItem(${item.id}, '${escapeJs(item.title)}', '${escapeJs(item.description || '')}')">Edit</button>
        <button type="button" class="danger" onclick="deleteItem(${item.id})">Delete</button>
      </td>
    </tr>
  `;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJs(text) {
  return text.replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '');
}

window.editItem = (id, title, description) => {
  itemIdInput.value = id;
  titleInput.value = title;
  descriptionInput.value = description;
  itemForm.querySelector('button[type="submit"]').textContent = 'Update Item';
};

window.deleteItem = async (id) => {
  if (!confirm('Delete this item?')) return;
  const response = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
  if (response.ok) {
    showMessage('Item deleted successfully.');
    fetchItems();
  } else {
    const error = await response.json();
    showMessage(error.error || 'Unable to delete item', true);
  }
};

itemForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = itemIdInput.value;
  const payload = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
  };

  if (!payload.title) {
    showMessage('Title is required.', true);
    return;
  }

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${apiUrl}/${id}` : apiUrl;

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    showMessage(error.error || 'Save failed', true);
    return;
  }

  clearForm();
  fetchItems();
  showMessage(id ? 'Item updated successfully.' : 'Item created successfully.');
});

cancelButton.addEventListener('click', () => {
  clearForm();
});

fetchItems();
