document.addEventListener('DOMContentLoaded', async function () {
    // Cache DOM elements
    const productTable = document.getElementById('productTable').getElementsByTagName('tbody')[0];
    const salesTable = document.getElementById('salesTable').getElementsByTagName('tbody')[0];
    const totalProducts = document.getElementById('totalProducts');
    const inStock = document.getElementById('inStock');
    const totalRevenue = document.getElementById('totalRevenue');
    const totalSales = document.getElementById('totalSales');
    const monthlyStockChartCtx = document.getElementById('monthlyStockChart').getContext('2d');
    const monthlySalesChartCtx = document.getElementById('monthlySalesChart').getContext('2d');

    let stockChart, salesChart;

    // Helper function to format dates
    function formatDate(date) {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate) ? parsedDate.toLocaleDateString() : 'Invalid Date';
    }

    // Fetch products from the API
    async function fetchProducts() {
        try {
            const response = await fetch('http://localhost:5021/api/products');
            const products = await response.json();
            productTable.innerHTML = '';

            // Populate the product table
            products.forEach(product => {
                const row = productTable.insertRow();
                row.insertCell(0).textContent = product.name;
                row.insertCell(1).textContent = product.category;
                row.insertCell(2).textContent = `₹${product.price.toFixed(2)}`;
                row.insertCell(3).textContent = product.stock;
                row.insertCell(4).textContent = formatDate(product.dateAdded);
            });

            // Update summary metrics
            totalProducts.textContent = products.length;
            inStock.textContent = products.reduce((acc, product) => acc + product.stock, 0);

            // Update the stock chart
            updateStockChart(products);

            return products;
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    // Fetch sales from the API and map product names
    async function fetchSales(products) {
        try {
            const response = await fetch('http://localhost:5021/api/sales');
            const sales = await response.json();
            salesTable.innerHTML = '';

            // Create a map of product IDs to product names
            const productMap = new Map(products.map(product => [product._id.$oid, product]));

            // Populate the sales table
            sales.forEach(sale => {
                const row = salesTable.insertRow();
                const saleProductId = sale.productId?.$oid; // Extract the nested $oid
                const product = saleProductId ? productMap.get(saleProductId) : null;

                // Log mismatched product IDs for debugging
                if (!product) {
                    console.warn(`Product ID not found: ${saleProductId}`);
                }

                row.insertCell(0).textContent = product ? product.name : 'Unknown Product';
                row.insertCell(1).textContent = sale.quantity;
                row.insertCell(2).textContent = `₹${sale.price.toFixed(2)}`;
                row.insertCell(3).textContent = `₹${sale.totalPrice.toFixed(2)}`;
                row.insertCell(4).textContent = formatDate(sale.saleDate);
            });

            // Update summary metrics
            totalRevenue.textContent = `₹${sales.reduce((acc, sale) => acc + sale.totalPrice, 0).toFixed(2)}`;
            totalSales.textContent = sales.length;

            // Update the sales chart
            updateSalesChart(sales);
        } catch (error) {
            console.error('Error fetching sales:', error);
        }
    }

    // Update the stock chart
    function updateStockChart(products) {
        const categories = [...new Set(products.map(p => p.category))];
        const categoryStock = categories.map(category =>
            products.filter(p => p.category === category).reduce((acc, p) => acc + p.stock, 0)
        );

        if (stockChart) stockChart.destroy();
        stockChart = new Chart(monthlyStockChartCtx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Stock by Category',
                    data: categoryStock,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: { scales: { y: { beginAtZero: true } } }
        });
    }

    // Update the sales chart
    function updateSalesChart(sales) {
        const monthlySales = Array(12).fill(0);
        sales.forEach(sale => {
            const month = new Date(sale.saleDate).getMonth();
            monthlySales[month] += sale.totalPrice;
        });

        if (salesChart) salesChart.destroy();
        salesChart = new Chart(monthlySalesChartCtx, {
            type: 'line',
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [{
                    label: 'Monthly Sales',
                    data: monthlySales,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: { scales: { y: { beginAtZero: true } } }
        });
    }

    // Export to PDF
    document.getElementById('export-pdf').addEventListener('click', function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text('Product Table', 10, 10);
        doc.autoTable({ html: '#productTable' });
        doc.text('Sales Table', 10, doc.autoTable.previous.finalY + 10);
        doc.autoTable({ html: '#salesTable' });
        doc.save('report.pdf');
    });

    // Export to Excel
    document.getElementById('export-excel').addEventListener('click', function () {
        const workbook = XLSX.utils.book_new();
        const productWorksheet = XLSX.utils.table_to_sheet(document.getElementById('productTable'));
        XLSX.utils.book_append_sheet(workbook, productWorksheet, 'Products');
        const salesWorksheet = XLSX.utils.table_to_sheet(document.getElementById('salesTable'));
        XLSX.utils.book_append_sheet(workbook, salesWorksheet, 'Sales');
        XLSX.writeFile(workbook, 'report.xlsx');
    });

    // Export to Word
    document.getElementById('export-word').addEventListener('click', function () {
        const docx = window.docx;
        const doc = new docx.Document();
        doc.addSection({
            children: [new docx.Paragraph('Product and Sales Report')]
        });
        docx.Packer.toBlob(doc).then(blob => {
            saveAs(blob, 'report.docx');
        });
    });

    // Fetch products and sales data
    const products = await fetchProducts();
    await fetchSales(products);
});