document.addEventListener('DOMContentLoaded', function () {
    const productSelect = document.getElementById('productSelect');
    const availableStock = document.getElementById('availableStock');
    const priceInput = document.getElementById('price');
    const quantityInput = document.getElementById('quantity');
    const dateInput = document.getElementById('date');
    const sellProductForm = document.getElementById('sellProductForm');

    // Fetch all products and populate dropdown
    async function fetchProducts() {
        try {
            const response = await fetch('http://localhost:5021/api/products');
            if (!response.ok) {
                throw new Error(`Failed to fetch products: ${response.status}`);
            }
            const products = await response.json();
            console.log('Fetched products:', products); // Debugging

            // Clear existing options
            productSelect.innerHTML = '<option value="">Select a product</option>';

            // Populate the dropdown with products
            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product._id; // Use _id (already transformed to string)
                option.textContent = product.name;
                productSelect.appendChild(option);
            });
        } catch (error) {
            console.error('🔥 Error fetching products:', error);
            alert('❌ Error fetching products. Check console for details.');
        }
    }

    // Update stock and price when a product is selected
    productSelect.addEventListener('change', async () => {
        const productId = productSelect.value;
        if (productId) {
            try {
                const response = await fetch(`http://localhost:5021/api/products/${productId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch product details: ${response.status}`);
                }
                const product = await response.json();
                console.log('Selected product:', product); // Debugging

                // Update available stock and price
                availableStock.value = product.stock;
                priceInput.value = product.price;
            } catch (error) {
                console.error('Error fetching product details:', error);
                alert('❌ Error fetching product details.');
            }
        } else {
            // Clear fields if no product is selected
            availableStock.value = '';
            priceInput.value = '';
        }
    });

    // Sell product form submission
    sellProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const productId = productSelect.value;
        const quantity = parseInt(quantityInput.value);
        const price = parseFloat(priceInput.value);
        const date = dateInput.value;

        // Validate input fields
        if (!productId || isNaN(quantity) || isNaN(price) || !date) {
            alert('❌ Please fill out all fields correctly.');
            return;
        }

        // Check if the quantity is less than or equal to the available stock
        const availableStockValue = parseInt(availableStock.value);
        if (quantity > availableStockValue) {
            alert('❌ Not enough stock available.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5021/api/sales/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    quantity,
                    price,
                    saleDate: new Date(date).toISOString(),
                }),
            });

            if (!response.ok) {
                const errorDetails = await response.json();
                throw new Error(`Failed to record sale: ${errorDetails.message || response.status}`);
            }

            const result = await response.json();
            alert(result.message);

            // Reset form and refresh product list after successful sale
            if (response.status === 201) {
                sellProductForm.reset();
                fetchProducts(); // Fetch products to update stock info
                availableStock.value = ''; // Clear available stock after sale
                priceInput.value = ''; // Clear price field
            }
        } catch (error) {
            console.error('Error selling product:', error);
            alert('❌ Error selling product: ' + error.message);
        }
    });

    // Fetch products when the page loads
    fetchProducts();
});
