/* Simple payroll demo using localStorage */
const STORAGE_KEY = 'payroll_employees_v1';

const empForm = document.getElementById('employeeForm');
const empTableBody = document.querySelector('#empTable tbody');
const noData = document.getElementById('noData');
const search = document.getElementById('search');
const clearBtn = document.getElementById('clearBtn');

function loadEmployees(){
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveEmployees(arr){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function calcNetPay(emp){
  // Basic arithmetic done step-by-step to reduce mistakes
  const basic = Number(emp.basic) || 0;
  const allow = Number(emp.allowances) || 0;
  const ded = Number(emp.deductions) || 0;
  // Net pay formula = basic + allowances - deductions
  const net = basic + allow - ded;
  // Round to 2 decimals
  return Math.round(net * 100) / 100;
}

function renderTable(filter = ''){
  const rows = loadEmployees();
  const filtered = rows.filter(r => r.name.toLowerCase().includes(filter.toLowerCase()));
  empTableBody.innerHTML = '';
  if(filtered.length === 0){
    noData.style.display = 'block';
    return;
  } else noData.style.display = 'none';

  filtered.forEach(emp => {
    const tr = document.createElement('tr');
    const net = calcNetPay(emp);
    tr.innerHTML = `
      <td>${emp.name}</td>
      <td>${Number(emp.basic).toFixed(2)}</td>
      <td>${Number(emp.allowances||0).toFixed(2)}</td>
      <td>${Number(emp.deductions||0).toFixed(2)}</td>
      <td>${net.toFixed(2)}</td>
      <td>
        <button class="edit" data-id="${emp.id}">Edit</button>
        <button class="payslip" data-id="${emp.id}">Payslip</button>
        <button class="delete" data-id="${emp.id}">Delete</button>
      </td>`;
    empTableBody.appendChild(tr);
  });
}

// create unique id (simple)
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

empForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('empId').value;
  const name = document.getElementById('name').value.trim();
  const basic = document.getElementById('basic').value;
  const allowances = document.getElementById('allowances').value;
  const deductions = document.getElementById('deductions').value;

  if(!name){ alert('Please enter a name'); return; }
  const employees = loadEmployees();

  if(id){ // edit
    const idx = employees.findIndex(x => x.id === id);
    if(idx > -1){
      employees[idx] = { id, name, basic, allowances, deductions };
    }
  } else { // add
    employees.push({ id: uid(), name, basic, allowances, deductions });
  }

  saveEmployees(employees);
  empForm.reset();
  document.getElementById('empId').value = '';
  renderTable(search.value);
});

clearBtn.addEventListener('click', () => {
  empForm.reset();
  document.getElementById('empId').value = '';
});

empTableBody.addEventListener('click', (e) => {
  const btn = e.target;
  if(btn.tagName !== 'BUTTON') return;
  const id = btn.dataset.id;
  const employees = loadEmployees();
  const emp = employees.find(x => x.id === id);
  if(btn.classList.contains('edit')){
    if(!emp) return;
    document.getElementById('empId').value = emp.id;
    document.getElementById('name').value = emp.name;
    document.getElementById('basic').value = emp.basic;
    document.getElementById('allowances').value = emp.allowances;
    document.getElementById('deductions').value = emp.deductions;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if(btn.classList.contains('delete')){
    if(!confirm('Delete this employee?')) return;
    const filtered = employees.filter(x => x.id !== id);
    saveEmployees(filtered);
    renderTable(search.value);
  } else if(btn.classList.contains('payslip')){
    if(!emp) return;
    showPayslip(emp);
  }
});

function showPayslip(emp){
  const net = calcNetPay(emp);
  // basic printable payslip using window.open
  const popup = window.open('', '_blank', 'width=600,height=600');
  popup.document.write(`
    <html><head><title>Payslip - ${emp.name}</title>
    <style>
      body{font-family:Arial,Helvetica,sans-serif;padding:20px;}
      h2{margin-top:0;}
      table{width:100%;border-collapse:collapse;}
      td{padding:8px;border:1px solid #ddd;}
    </style>
    </head><body>
    <h2>Payslip</h2>
    <p><strong>Name:</strong> ${emp.name}</p>
    <table>
      <tr><td>Basic Pay</td><td>${Number(emp.basic).toFixed(2)}</td></tr>
      <tr><td>Allowances</td><td>${Number(emp.allowances||0).toFixed(2)}</td></tr>
      <tr><td>Deductions</td><td>${Number(emp.deductions||0).toFixed(2)}</td></tr>
      <tr><td><strong>Net Pay</strong></td><td><strong>${net.toFixed(2)}</strong></td></tr>
    </table>
    <p style="margin-top:20px;">Date: ${new Date().toLocaleDateString()}</p>
    <p><button onclick="window.print()">Print Payslip</button></p>
    </body></html>`);
  popup.document.close();
}

// search
search.addEventListener('input', (e) => renderTable(e.target.value));

// initial render
renderTable();
