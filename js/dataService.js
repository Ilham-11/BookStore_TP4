
async function loadJson(path) {
    
    const response = await fetch(path);

    
    if (!response.ok) {
        throw new Error(
            `Impossible de charger ${path} (HTTP ${response.status}).`
        );
    }

    
    return response.json();
}

export async function loadAllData() {
    
    const [customers, products, orders] = await Promise.all([
        loadJson("data/customers.json"),
        loadJson("data/products.json"),
        loadJson("data/orders.json")
    ]);

    
    return {
        customers,
        products,
        orders
    };
}
