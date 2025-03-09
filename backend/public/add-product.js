document.addEventListener("DOMContentLoaded", function () {
    const addProductForm = document.getElementById("addProductForm");
  
    addProductForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // Prevent form submission from reloading the page
  
      // Get form values
      const name = document.getElementById("name").value.trim();
      const category = document.getElementById("category").value.trim();
      const price = parseFloat(document.getElementById("price").value);
      const stock = parseInt(document.getElementById("stock").value, 10);
      const dateAdded = document.getElementById("dateAdded").value;
  
      // Validate fields
      if (!name || !category || isNaN(price) || isNaN(stock) || !dateAdded) {
        alert("❌ All fields must be filled out correctly.");
        return;
      }
  
      // Prepare data
      const data = {
        name,
        category,
        price,
        stock,
        dateAdded: new Date(dateAdded).toISOString(), // Ensure dateAdded is an ISO string
      };
  
      console.log("📤 Sending Data:", data); // Debugging
  
      try {
        // Send POST request to backend
        const response = await fetch("http://localhost:5021/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
  
        // Check if the response is OK (status code 2xx)
        if (!response.ok) {
          const errorText = await response.text();
          console.error("📩 Server Error Response:", errorText);
  
          let errorMessage = "❌ Error adding product.";
          try {
            const errorResult = JSON.parse(errorText);
            errorMessage = errorResult.message || errorMessage;
          } catch (jsonError) {
            console.error("🔥 JSON Parsing Error:", jsonError);
          }
  
          alert(errorMessage);
          return;
        }
  
        // Parse the JSON response
        const result = await response.json();
        console.log("📩 Parsed Response:", result);
  
        // Check for successful addition of product
        if (response.status === 201) {
          alert("✅ Product added successfully!");
          addProductForm.reset(); // Reset the form after successful submission
        } else {
          alert("❌ Error adding product: " + (result.message || "Unknown error"));
        }
      } catch (error) {
        console.error("🔥 Fetch Error:", error);
        alert("❌ Error adding product: " + error.message);
      }
    });
  });
  