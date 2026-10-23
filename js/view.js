
import {
    getCustomerById,
    getOrderTotal,
    getOrderLines,
    getFilteredOrders,
    getCumulativeAmount
} from "./selectors.js";


const money = value => new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 2
}).format(value);


function statusLabel(status) {
    if (status === "Livree") return "Livrée";
    if (status === "Annulee") return "Annulée";

    return status;
}


function statusClass(status) {
    return status.replaceAll(" ", "-");
}


export function showError(message) {
    const box = document.querySelector("#errorBox");

    box.textContent = message;
    box.classList.remove("d-none");
}


export function hideError() {
    document.querySelector("#errorBox").classList.add("d-none");
}


export function renderIndicators(state) {
    document.querySelector("#customersCount").textContent =
        state.customers.length;

    document.querySelector("#productsCount").textContent =
        state.products.length;

    document.querySelector("#ordersCount").textContent =
        state.orders.length;

    document.querySelector("#totalAmount").textContent =
        money(getCumulativeAmount(state));
}


export function renderProducts(state) {
    const grid = document.querySelector("#productsGrid");

    grid.innerHTML = state.products.map(product => `
        <div class="col-12 col-sm-6 col-lg-3">
            <article class="card book-card">

                <img
                    class="book-cover"
                    src="${product.image}"
                    alt="Couverture illustrative de ${product.name}"
                    loading="lazy"
                    onerror="this.onerror=null;this.src='https://placehold.co/600x800/f7f1e8/243447?text=BookStore';"
                >

                <div class="card-body d-flex flex-column">

                    <span class="category-pill align-self-start">
                        ${product.category}
                    </span>

                    <h3 class="book-title">${product.name}</h3>

                    <p class="book-author">
                        par ${product.author}
                    </p>

                    <p class="book-description">
                        ${product.description}
                    </p>

                    <div class="mt-auto d-flex justify-content-between
                                align-items-center gap-2">

                        <span class="book-price">
                            ${money(product.price)}
                        </span>

                        <small class="text-muted">
                            Stock : ${product.stock}
                        </small>

                    </div>
                </div>
            </article>
        </div>
    `).join("");

    document.querySelector("#catalogCount").textContent =
        `${state.products.length} livres`;
}


export function renderCategoryOptions(state) {
    const select = document.querySelector("#categoryFilter");
    const current = state.selectedCategory;

    const categories = [
        ...new Set(state.products.map(product => product.category))
    ].sort();

    select.innerHTML =
        '<option value="all">Toutes les catégories</option>' +
        categories.map(category =>
            `<option value="${category}">${category}</option>`
        ).join("");

    select.value = current;
}


export function renderOrders(state) {
    const tbody = document.querySelector("#ordersTableBody");
    const orders = getFilteredOrders(state);

    tbody.innerHTML = orders.map(order => {
        const customer = getCustomerById(state, order.customerId);

        return `
            <tr>
                <td>
                    <span class="order-id">#${order.id}</span>
                </td>

                <td>
                    ${customer ? customer.name : "Client inconnu"}
                </td>

                <td>
                    ${new Date(order.date + "T12:00:00")
                        .toLocaleDateString("fr-FR")}
                </td>

                <td>
                    <span class="status-badge status-${statusClass(order.status)}">
                        ${statusLabel(order.status)}
                    </span>
                </td>

                <td class="fw-bold">
                    ${money(getOrderTotal(state, order))}
                </td>

                <td>
                    <button
                        class="btn btn-caramel btn-sm"
                        type="button"
                        data-order-id="${order.id}">
                        Détails
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    document.querySelector("#emptyOrders").classList.toggle(
        "d-none",
        orders.length !== 0
    );
}


export function renderAll(state) {
    renderIndicators(state);
    renderProducts(state);
    renderCategoryOptions(state);
    renderOrders(state);
}

export function showOrderDetails(state, orderId) {
    const order = state.orders.find(
        item => item.id === Number(orderId)
    );

    if (!order) {
        showError(`La commande ${orderId} est introuvable.`);
        return;
    }

    const customer = getCustomerById(state, order.customerId);
    const lines = getOrderLines(state, order);

    const body = document.querySelector("#orderModalBody");

    body.innerHTML = `
        <div class="row g-3 mb-4">

            <div class="col-6 col-md-3">
                <div class="detail-meta">
                    <span>Client</span>
                    <strong>${customer ? customer.name : "Inconnu"}</strong>
                </div>
            </div>

            <div class="col-6 col-md-3">
                <div class="detail-meta">
                    <span>Ville</span>
                    <strong>${customer ? customer.city : "—"}</strong>
                </div>
            </div>

            <div class="col-6 col-md-3">
                <div class="detail-meta">
                    <span>Date</span>
                    <strong>
                        ${new Date(order.date + "T12:00:00")
                            .toLocaleDateString("fr-FR")}
                    </strong>
                </div>
            </div>

            <div class="col-6 col-md-3">
                <div class="detail-meta">
                    <span>Statut</span>
                    <strong>${statusLabel(order.status)}</strong>
                </div>
            </div>

        </div>

        <div class="table-responsive">
            <table class="table align-middle">

                <thead>
                    <tr>
                        <th>Livre</th>
                        <th>Prix unitaire</th>
                        <th>Quantité</th>
                        <th>Total ligne</th>
                    </tr>
                </thead>

                <tbody>
                    ${lines.map(line => `
                        <tr>
                            <td>${line.product.name}</td>
                            <td>${money(line.product.price)}</td>
                            <td>${line.quantity}</td>
                            <td class="fw-bold">${money(line.lineTotal)}</td>
                        </tr>
                    `).join("")}
                </tbody>

            </table>
        </div>

        <div class="text-end mt-3">
            <span class="text-muted me-2">
                Total de la commande
            </span>

            <strong class="fs-4" style="color:var(--caramel)">
                ${money(getOrderTotal(state, order))}
            </strong>
        </div>
    `;

    document.querySelector("#orderModalTitle").textContent =
        `Commande #${order.id}`;

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.querySelector("#orderModal")
    );

    modal.show();
}
