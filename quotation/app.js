(() => {
  const itemRowsBody = document.getElementById('itemRows');
  const addItemBtn = document.getElementById('addItem');
  const printBtn = document.getElementById('printBtn');

  const yen = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });
  const dateFormatter = new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });

  function formatDate(value) {
    if (!value) return '';
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return '';
    return dateFormatter.format(date);
  }

  function createItemRow(initial = {}) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" class="item-name" placeholder="例: 部材費" value="${initial.name ?? ''}"></td>
      <td><input type="number" class="qty" min="0" step="1" value="${initial.qty ?? 1}"></td>
      <td><input type="text" class="unit" placeholder="式" value="${initial.unit ?? '式'}"></td>
      <td><input type="number" class="price" min="0" step="1" value="${initial.price ?? 0}"></td>
      <td><button type="button" class="remove-item" title="この行を削除">×</button></td>
    `;
    tr.querySelectorAll('input').forEach((input) => input.addEventListener('input', render));
    tr.querySelector('.remove-item').addEventListener('click', () => {
      tr.remove();
      render();
    });
    return tr;
  }

  function addItem(initial) {
    itemRowsBody.appendChild(createItemRow(initial));
    render();
  }

  function collectItems() {
    return [...itemRowsBody.querySelectorAll('tr')].map((tr) => {
      const name = tr.querySelector('.item-name').value.trim();
      const qty = Number(tr.querySelector('.qty').value) || 0;
      const unit = tr.querySelector('.unit').value.trim();
      const price = Number(tr.querySelector('.price').value) || 0;
      return { name, qty, unit, price, amount: qty * price };
    });
  }

  function render() {
    document.getElementById('out-quoteNumber').textContent = document.getElementById('quoteNumber').value;
    document.getElementById('out-issueDate').textContent = formatDate(document.getElementById('issueDate').value);
    document.getElementById('out-validUntil').textContent = formatDate(document.getElementById('validUntil').value);
    document.getElementById('out-subject').textContent = document.getElementById('subject').value;
    document.getElementById('out-clientName').textContent = document.getElementById('clientName').value;
    document.getElementById('out-issuerName').textContent = document.getElementById('issuerName').value;
    document.getElementById('out-issuerAddress').textContent = document.getElementById('issuerAddress').value;
    document.getElementById('out-issuerTel').textContent = document.getElementById('issuerTel').value;
    document.getElementById('out-notes').textContent = document.getElementById('notes').value;

    const items = collectItems();
    const tbody = document.getElementById('out-itemRows');
    tbody.innerHTML = '';
    items.forEach((item) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(item.name)}</td>
        <td class="num">${item.qty}</td>
        <td>${escapeHtml(item.unit)}</td>
        <td class="amount">${yen.format(item.price)}</td>
        <td class="amount">${yen.format(item.amount)}</td>
      `;
      tbody.appendChild(tr);
    });

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = Number(document.getElementById('taxRate').value) || 0;
    const tax = Math.floor(subtotal * (taxRate / 100));
    const total = subtotal + tax;

    document.getElementById('out-subtotal').textContent = yen.format(subtotal);
    document.getElementById('out-taxRate').textContent = taxRate;
    document.getElementById('out-tax').textContent = yen.format(tax);
    document.getElementById('out-total').textContent = yen.format(total);
    document.getElementById('out-grandTotal').textContent = yen.format(total);
  }

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }

  function setDefaultDates() {
    const today = new Date();
    const toInputValue = (date) => date.toISOString().slice(0, 10);
    document.getElementById('issueDate').value = toInputValue(today);
    const validUntil = new Date(today);
    validUntil.setMonth(validUntil.getMonth() + 1);
    document.getElementById('validUntil').value = toInputValue(validUntil);
  }

  document.querySelectorAll('.editor input, .editor textarea').forEach((el) => {
    el.addEventListener('input', render);
  });

  addItemBtn.addEventListener('click', () => addItem());
  printBtn.addEventListener('click', () => window.print());

  setDefaultDates();
  addItem({ name: '', qty: 1, unit: '式', price: 0 });
  render();
})();
