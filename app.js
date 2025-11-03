// Simple Payroll Manager using localStorage

const STORAGE_KEY = "payroll_employees_v1";
const empForm = document.getElementById("employeeForm");
const empTableBody = document.querySelector("#empTable tbody");
const search = document.getElementById("search");
const clearBtn = document.getElementById("clearBtn");
const noData = document.getElementById("noData");

function loadEmployees() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveEmployees(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function calcNet(emp) {
  const b = +emp.basic || 0, a = +emp.allowances || 0, d = +emp.deductions || 0;
  return (b + a - d).toFixed(2);
}

function renderTable(filter = "") {
  const employees = loadEmployees().filter(e =>
    e.name.toLowerCase().includes(filter.toLowerCase())
  );
  empTableBody.innerHTML = "";
  if (employees.length === 0) {
    noData.style.display = "block";
    return;
  }
  noData.style.display = "none";

  employees.forEach(emp => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${emp.name}</td>
      <td>${emp.basic}</td>
      <td>${emp.allowances}</td>
      <td>${emp.deductions}</td>
      <td>${calcNet(emp)}</td>
      <td>
        <button class="edit-btn" data-id="${emp.id}">Edit</button>
        <button class="payslip-btn" data-id="${emp.id}">Payslip</button>
        <button class="delete-btn" data-id="${emp.id}">Delete</button>
      </td>`;
    empTableBody.appendChild(row);
  });
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

empForm.addEventListener("submit", e => {
  e.preventDefault();
  const id = document.getElementById("empId").value;
  const name = document.getElementById("name").value.trim();
  const basic = document.getElementById("basic").value;
  const allowances = document.getElementById("allowances").value;
  const deductions = document.getElementById("deductions").value;
  if (!name) return alert("Enter employee name!");

  const employees = loadEmployees();

  if (id) {
    const idx = employees.findIndex(e => e.id === id);
    if (idx > -1) employees[idx] = { id, name, basic, allowances, deductions };
  } else {
    employees.push({ id: uid(), name, basic, allowances, deductions });
  }

  saveEmployees(employees);
  empForm.reset();
  document.getElementById("empId").value = "";
  renderTable(search.value);
});

clearBtn.addEventListener("click", () => {
  empForm.reset();
  document.getElementById("empId").value = "";
});

empTableBody.addEventListener("click", e => {
  const btn = e.target;
  const id = btn.dataset.id;
  const employees = loadEmployees();
  const emp = employees.find(e => e.id === id);

  if (btn.classList.contains("edit-btn")) {
    document.getElementById("empId").value = emp.id;
    document.getElementById("name").value = emp.name;
    document.getElementById("basic").value = emp.basic;
    document.getElementById("allowances").value = emp.allowances;
    document.getElementById("deductions").value = emp.deductions;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (btn.classList.contains("delete-btn")) {
    if (confirm("Delete this employee?")) {
      saveEmployees(employees.filter(e => e.id !== id));
      renderTable(search.value);
    }
  }

  if (btn.classList.contains("payslip-btn")) {
    const net = calcNet(emp);
    const w = window.open("", "_blank", "width=600,height=600");
    w.document.write(`
      <h2>Payslip</h2>
      <p><b>Name:</b> ${emp.name}</p>
      <p>Basic Pay: ${emp.basic}</p>
      <p>Allowances: ${emp.allowances}</p>
      <p>Deductions: ${emp.deductions}</p>
      <p><b>Net Pay:</b> ${net}</p>
      <p>Date: ${new Date().toLocaleDateString()}</p>
      <button onclick="window.print()">Print</button>
    `);
  }
});

search.addEventListener("input", e => renderTable(e.target.value));
renderTable();
