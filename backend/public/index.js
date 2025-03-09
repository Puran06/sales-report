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

    // Helper function to format dates
    function formatDate(date) {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate) ? parsedDate.toLocaleDateString() : 'Invalid Date';
    }

    // Fetch products data and populate the product table
    async function fetchProducts() {
        try {
            const response = await fetch('http://localhost:5021/api/products');
            const products = await response.json();
            productTable.innerHTML = ''; // Clear table before updating

            // Populate product table
            products.forEach(product => {
                const row = productTable.insertRow();
                row.insertCell(0).textContent = product.name;
                row.insertCell(1).textContent = product.category;
                row.insertCell(2).textContent = `₹${product.price.toFixed(2)}`;
                row.insertCell(3).textContent = product.stock;
                row.insertCell(4).textContent = formatDate(product.dateAdded);  // Ensure correct date format
            });

            // Update product statistics
            totalProducts.textContent = products.length;
            const totalStock = products.reduce((acc, product) => acc + product.stock, 0);
            inStock.textContent = totalStock;

            // Update monthly stock chart
            const categories = [...new Set(products.map(p => p.category))];
            const categoryStock = categories.map(category => ({
                label: category,
                stock: products.filter(p => p.category === category).reduce((acc, p) => acc + p.stock, 0)
            }));

            new Chart(monthlyStockChartCtx, {
                type: 'bar',
                data: {
                    labels: categories,
                    datasets: [{
                        label: 'Stock by Category',
                        data: categoryStock.map(c => c.stock),
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });

            return products; // Return products for use in fetchSales
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    // Fetch sales data and populate the sales table
    async function fetchSales(products) {
        try {
            const response = await fetch('http://localhost:5021/api/sales');
            const sales = await response.json();
            salesTable.innerHTML = ''; // Clear table before updating

            // Create a map of products for quick lookup by productId
            const productMap = new Map();

            products.forEach(product => {
                // Ensure both productId from sales and _id.$oid are strings for comparison 
                productMap.set(product._id, product);
                // console.log ("hello",product)
            });

            // Debugging: Log the product map
            console.log('Product Map:', productMap);

            console.log('sales',sales);

            // Populate sales table with product details
            sales.forEach(sale => {
                const row = salesTable.insertRow();

                const productId = sale.productId._id; // Make sure this is the correct reference
                const product = productMap.get(productId); // Use the productId to find the product

                // Debugging: Log the sale and the product info
                console.log('Sale Product ID:', productId, 'Product:', product);

                const productName = product ? product.name : 'Product Not Found'; // Handle missing product
                row.insertCell(0).textContent = productName;
                row.insertCell(1).textContent = sale.quantity;
                row.insertCell(2).textContent = `₹${sale.price.toFixed(2)}`;
                row.insertCell(3).textContent = `₹${sale.totalPrice.toFixed(2)}`;
                row.insertCell(4).textContent = formatDate(sale.saleDate);  // Ensure correct date format
            });

            // Update sales statistics
            const totalRevenueAmount = sales.reduce((acc, sale) => acc + sale.totalPrice, 0);
            totalRevenue.textContent = `₹${totalRevenueAmount.toFixed(2)}`;
            totalSales.textContent = sales.length;

            // Update monthly sales chart
            const monthlySales = Array(12).fill(0);
            sales.forEach(sale => {
                const month = new Date(sale.saleDate).getMonth();
                monthlySales[month] += sale.totalPrice;
            });

            new Chart(monthlySalesChartCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'Monthly Sales Revenue',
                        data: monthlySales,
                        fill: false,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        tension: 0.1
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching sales:', error);
        }
    }

    // Initial data fetch
    const products = await fetchProducts();
    await fetchSales(products);
});
