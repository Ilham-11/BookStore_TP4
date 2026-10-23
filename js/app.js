
import { state } from "./state.js";

import { loadAllData } from "./dataService.js";

import {
    renderAll,
    renderOrders,
    showOrderDetails,
    showError,
    hideError
} from "./view.js";


async function init() {
    try {
        
        const data = await loadAllData();

        
        state.customers = data.customers;
        state.products = data.products;
        state.orders = data.orders;

        
        renderAll(state);

        
        hideError();

        
        document.querySelector("#searchInput")
            .addEventListener("input", event => {
                state.searchText = event.target.value;
                renderOrders(state);
            });

        
        document.querySelector("#statusFilter")
            .addEventListener("change", event => {
                state.selectedStatus = event.target.value;
                renderOrders(state);
            });

        
        document.querySelector("#categoryFilter")
            .addEventListener("change", event => {
                state.selectedCategory = event.target.value;
                renderOrders(state);
            });

       
        document.querySelector("#ordersTableBody")
            .addEventListener("click", event => {
                const button = event.target.closest("[data-order-id]");

                if (button) {
                    showOrderDetails(state, button.dataset.orderId);
                }
            });

    } catch (error) {
        
        console.error(error);

        
        showError(
            "Impossible de charger les données. " +
            "Vérifiez que vous utilisez Live Server et que les fichiers JSON existent. " +
            "Détail : " + error.message
        );
    }
}


document.addEventListener("DOMContentLoaded", init);
