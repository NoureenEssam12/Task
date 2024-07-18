

document.addEventListener('DOMContentLoaded', () => {
  const customerTableBody = document.querySelector('#customerTable tbody');
  const searchInput = document.querySelector('#search');
  const ctx = document.getElementById('transactionChart').getContext('2d');
  let transactions = [];
  let customers = [];
  let chart;

  fetch('http://localhost:3000/api/data')
      .then(response => response.json())
      .then(data => {
          customers = data.customers;
          transactions = data.transactions;
          displayTable(transactions);
      })
      .catch(error => console.error('Error fetching data:', error));

  function displayTable(transactions) {
      customerTableBody.innerHTML = '';
      const uniqueCustomerIds = [...new Set(transactions.map(t => t.customer_id))];

      uniqueCustomerIds.forEach(customerId => {
          const customerTransactions = transactions.filter(t => t.customer_id === customerId);
          const customer = customers.find(c => c.id === customerId);
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${customer.name}</td>
              <td>${customerTransactions.map(t => `${t.date}`).join('<br>')}</td>
              <td>${customerTransactions.map(t => `${t.amount}`).join('<br>')}</td>
          `;
          row.addEventListener('click', () => displayChart(customerId));
          customerTableBody.appendChild(row);
      });
  }

  searchInput.addEventListener('input', (event) => {
      const query = event.target.value.toLowerCase();
      const filteredTransactions = transactions.filter(transaction => {
          const customer = customers.find(c => c.id === transaction.customer_id);
          return customer.name.toLowerCase().includes(query) || 
                 transaction.amount.toString().includes(query);
      });
      displayTable(filteredTransactions);
      
      if (filteredTransactions.length > 0) {
          const firstCustomerId = filteredTransactions[0].customer_id;
          displayChart(firstCustomerId);
      } else {
          if (chart) {
              chart.destroy();
          }
      }
  });

  function displayChart(customerId) {
      const customerTransactions = transactions.filter(transaction => transaction.customer_id === customerId);
      const labels = customerTransactions.map(transaction => transaction.date);
      const data = customerTransactions.map(transaction => transaction.amount);

      if (chart) {
          chart.destroy();
      }

      chart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: labels,
              datasets: [{
                  label: 'Transaction Amount',
                  data: data,
                  backgroundColor: 'rgba(75, 192, 192, 0.9)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1
              }]
          },
          options: {
              scales: {
                  y: {
                      beginAtZero: true
                  }
              }
          }
      });
  }
  
  console.log(Chart);
});

