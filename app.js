const STORAGE_KEY = 'finance_tracker_transactions';

function loadTransactions() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function render() {
  const transactions = loadTransactions();
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
  document.getElementById('totalExpense').textContent = formatCurrency(totalExpense);
  document.getElementById('balance').textContent = formatCurrency(balance);

  const max = Math.max(totalIncome, totalExpense, 1);
  const incomePercent = (totalIncome / max) * 100;
  const expensePercent = (totalExpense / max) * 100;
  document.getElementById('barIncome').style.width = incomePercent + '%';
  document.getElementById('barExpense').style.width = expensePercent + '%';

  const list = document.getElementById('transactionsList');
  if (transactions.length === 0) {
    list.innerHTML = '<p class="empty-state">Nenhuma transação cadastrada.</p>';
    return;
  }

  list.innerHTML = transactions.slice().reverse().map((t, idx) => `
    <div class="transaction-item">
      <div class="transaction-info">
        <div class="transaction-desc">${escapeHtml(t.description)}</div>
        <div class="transaction-meta">${t.category} • ${new Date(t.date).toLocaleDateString('pt-BR')}</div>
      </div>
      <div class="transaction-amount ${t.type}">${t.type === 'income' ? '+' : '-'} ${formatCurrency(t.amount)}</div>
      <button class="btn btn-danger" onclick="deleteTransaction(${transactions.length - 1 - idx})">Excluir</button>
    </div>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

window.deleteTransaction = function(index) {
  const transactions = loadTransactions();
  transactions.splice(index, 1);
  saveTransactions(transactions);
  render();
};

document.getElementById('transactionForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const description = document.getElementById('description').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').options[document.getElementById('category').selectedIndex].text;

  if (!description || isNaN(amount) || amount <= 0) return;

  const transactions = loadTransactions();
  transactions.push({
    id: Date.now(),
    description,
    amount,
    type,
    category,
    date: new Date().toISOString()
  });
  saveTransactions(transactions);

  document.getElementById('transactionForm').reset();
  render();
});

render();
