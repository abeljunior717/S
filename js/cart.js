class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.categories = {
            'joyas': 'Joyas',
            'collares': 'Collares',
            'relojeria': 'Relojería'
        };
    }

    saveToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
    }

    updateCartCount() {
        const count = this.items.reduce((total, item) => total + item.quantity, 0);
        document.querySelector('.cart-count').textContent = count;
    }

    getCategoryName(categoryKey) {
        return this.categories[categoryKey] || categoryKey;
    }

    addItem(item) {
        if (!item.stock || item.stock <= 0) {
            this.showStockMessage({ ...item, message: 'Producto agotado' });
            return false;
        }

        const existingItem = this.items.find(i => i.id === item.id);

        if (existingItem) {
            if (existingItem.quantity + (item.quantity || 1) > item.stock) {
                this.showStockMessage(item);
                return false;
            }
            existingItem.quantity += item.quantity || 1;
        } else {
            if ((item.quantity || 1) > item.stock) {
                this.showStockMessage(item);
                return false;
            }
            this.items.push({ ...item, quantity: item.quantity || 1 });
        }

        this.saveToLocalStorage();
        return true;
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveToLocalStorage();
    }

    updateQuantity(id, change) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            if (change > 0 && item.quantity + change > item.stock) {
                this.showStockMessage(item);
                return;
            }

            item.quantity += change;

            if (item.quantity <= 0) {
                this.removeItem(id);
            } else {
                this.saveToLocalStorage();
            }
        }
    }

    clearCart() {
        this.items = [];
        this.saveToLocalStorage();
    }

    calculateSubtotal() {
        return this.items.reduce((total, item) => {
            const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
            return total + (price * item.quantity);
        }, 0);
    }

    calculateShipping() {
        const subtotal = this.calculateSubtotal();
        return subtotal > 1000 ? 0 : 150;
    }

    calculateTotal() {
        return this.calculateSubtotal() + this.calculateShipping();
    }

    updateSummary() {
        document.getElementById('subtotal').textContent = `$${this.calculateSubtotal().toFixed(2)}`;
        document.getElementById('shipping').textContent = `$${this.calculateShipping().toFixed(2)}`;
        document.getElementById('total').textContent = `$${this.calculateTotal().toFixed(2)}`;
    }

    showStockMessage(item) {
        const existingMessages = document.querySelectorAll('.stock-message');
        existingMessages.forEach(msg => msg.remove());

        const message = document.createElement('div');
        message.className = 'stock-message';
        message.textContent = item.message || `Límite alcanzado: Solo ${item.stock} disponibles de ${item.name}`;
        document.body.appendChild(message);

        setTimeout(() => {
            message.style.animation = 'fadeOut 0.3s';
            setTimeout(() => message.remove(), 300);
        }, 3000);
    }

    generateTicket() {
        const ticketContent = document.getElementById('ticket-content');
        const now = new Date();
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
        const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';

        if (!currentUser && !isAdmin) {
            alert('Debes iniciar sesión para generar el ticket.');
            window.location.href = 'login.html';
            return;
        }

        if (this.items.length === 0) {
            alert('No hay productos en el carrito.');
            return;
        }

        let clienteInfo = 'Cliente: Invitado';
        if (isAdmin) {
            clienteInfo = 'Cliente: Administrador';
        } else if (currentUser.username) {
            clienteInfo = `Cliente: ${currentUser.username}`;
            if (currentUser.fullname) {
                clienteInfo += `<br>Nombre: ${currentUser.fullname}`;
            }
        } else if (currentUser.fullname) {
            clienteInfo = `Nombre: ${currentUser.fullname}`;
        }

        const ticketHTML = `
            <div class="ticket-header">
                <h2>Suárez Joyería</h2>
                <p>Calle Principal 123, Ciudad</p>
                <p>Tel: 555-123-4567</p>
                <p>Fecha: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}</p>
                <p>Ticket #${Math.floor(Math.random() * 10000)}</p>
                <div style="margin: 10px 0; font-family: 'Courier New', monospace; white-space: pre-line;">
                    ${clienteInfo}
                </div>
            </div>
            <div class="ticket-items">
                ${this.items.map(item => {
                    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                    const subtotal = price * item.quantity;
                    return `
                    <div class="ticket-item">
                        <span>${item.name} (${item.quantity} x $${price.toFixed(2)})</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>`;
                }).join('')}
            </div>
            <div class="ticket-total">
                <p>Subtotal: $${this.calculateSubtotal().toFixed(2)}</p>
                <p>Envío: $${this.calculateShipping().toFixed(2)}</p>
                <p>TOTAL: $${this.calculateTotal().toFixed(2)}</p>
            </div>
            <div class="ticket-footer">
                <p>¡Gracias por su compra!</p>
                <p>Para devoluciones, presente este ticket</p>
                <p>www.suarezjoyeria.com</p>
            </div>`;
        ticketContent.innerHTML = ticketHTML;
    }

    saveToHistory() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;

        const historyKey = `history_${currentUser.username}`;
        const previousHistory = JSON.parse(localStorage.getItem(historyKey)) || [];

        const timestamp = new Date().toLocaleString();
        const newRecord = {
            date: timestamp,
            items: this.items.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity
            }))
        };

        previousHistory.push(newRecord);
        localStorage.setItem(historyKey, JSON.stringify(previousHistory));
    }

    getPurchaseHistory() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return [];

        const historyKey = `history_${currentUser.username}`;
        const history = JSON.parse(localStorage.getItem(historyKey)) || [];
        return history;
    }

    renderPurchaseHistory(containerId) {
        const container = document.getElementById(containerId);
        const history = this.getPurchaseHistory();

        if (!container) return;
        if (history.length === 0) {
            container.innerHTML = '<p>No tienes compras registradas.</p>';
            return;
        }

        container.innerHTML = history.map(record => {
            const itemsHTML = record.items.map(item => `
                <li>${item.name} - ${item.quantity} x $${parseFloat(item.price).toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}</li>
            `).join('');

            return `
                <div class="purchase-record">
                    <h4>Compra del ${record.date}</h4>
                    <ul>${itemsHTML}</ul>
                    <hr>
                </div>
            `;
        }).join('');
    }

    printTicket() {
        window.print();
    }

    async downloadTicketPDF() {
        try {
            if (typeof jsPDF !== 'undefined') {
                const { jsPDF } = window.jspdf;
                const ticketContent = document.getElementById('ticket-content');

                const canvas = await html2canvas(ticketContent, {
                    scale: 2,
                    logging: false,
                    useCORS: true
                });

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm' });
                const imgWidth = 80;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 15, 10, imgWidth, imgHeight);
                pdf.save('ticket_suarez_joyeria.pdf');
            } else {
                alert('Error al generar PDF. Por favor intente imprimir el ticket.');
            }
        } catch (error) {
            console.error('Error al generar PDF:', error);
            alert('Ocurrió un error al generar el PDF.');
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Cart;
}
