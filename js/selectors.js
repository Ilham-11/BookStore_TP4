

export function getCustomerById(state, customerId) {
    return state.customers.find(
        customer => customer.id === customerId
    );
}


export function getProductById(state, productId) {
    return state.products.find(
        product => product.id === productId
    );
}


export function getOrderLines(state, order) {
    return order.items.map(item => {
        const product = getProductById(state, item.productId);

        if (!product) {
            throw new Error(
                `Le produit ${item.productId} est introuvable.`
            );
        }

        return {
            product: product,
            quantity: item.quantity,
            lineTotal: product.price * item.quantity
        };
    });
}

export function getOrderTotal(state, order) {
    const lines = getOrderLines(state, order);

    return lines.reduce(
        (sum, line) => sum + line.lineTotal,
        0
    );
}


export function getFilteredOrders(state) {
    const search = state.searchText
        .trim()
        .toLocaleLowerCase("fr");

    return state.orders.filter(order => {
        const customer = getCustomerById(
            state,
            order.customerId
        );

        const matchesName = customer &&
            customer.name.toLocaleLowerCase("fr").includes(search);

        const matchesStatus =
            state.selectedStatus === "all" ||
            order.status === state.selectedStatus;

        const lines = getOrderLines(state, order);

        const matchesCategory =
            state.selectedCategory === "all" ||
            lines.some(line =>
                line.product.category === state.selectedCategory
            );

        return matchesName && matchesStatus && matchesCategory;
    });
}


export function getCumulativeAmount(state) {
    return state.orders.reduce(
        (sum, order) => sum + getOrderTotal(state, order),
        0
    );
}
