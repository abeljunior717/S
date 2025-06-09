<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Joyas - Suárez Joyería</title>
    <link rel="stylesheet" href="css/styles.css">
    <style>
        /* Estilos específicos para la página de joyas */
        .joyas-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 30px;
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .joya-item {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.3s, box-shadow 0.3s;
        }

        .joya-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        .joya-item img {
            width: 100%;
            height: 250px;
            object-fit: cover;
        }

        .detalles {
            padding: 15px;
        }

        .detalles h3 {
            margin: 0 0 10px;
            color: #333;
        }

        .detalles p {
            margin: 0 0 10px;
            color: #666;
            font-size: 14px;
        }

        .precio {
            font-weight: bold;
            color: #222;
            font-size: 18px;
            margin: 10px 0;
        }

        .btn-add-to-cart {
            width: 100%;
            padding: 10px;
            background-color: #333;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .btn-add-to-cart:hover {
            background-color: #555;
        }

        /* Estilos para el usuario en el navbar */
        .user-section {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .user-name {
            font-weight: 500;
            color: #333;
        }

        .logout-btn {
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
            font-size: 0.9em;
            padding: 5px 0;
        }

        .logout-btn:hover {
            color: #f44336;
            text-decoration: underline;
        }

        .login-link {
            color: #333;
            text-decoration: none;
            font-weight: 500;
        }

        .login-link:hover {
            color: #555;
            text-decoration: underline;
        }

        /* Notificaciones */
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 4px;
            color: white;
            transform: translateX(120%);
            transition: transform 0.5s ease;
            z-index: 1000;
        }

        .notification.show {
            transform: translateX(0);
        }

        .notification.success {
            background-color: #4CAF50;
        }

        .notification.error {
            background-color: #f44336;
        }
    </style>
</head>
<body>
    <header>
        <div class="logo">
            <h1>SUAREZ</h1>
        </div>
        <nav>
            <ul>
                <li><a href="index.html">Inicio</a></li>
                <li class="dropdown">
                    <a href="#colecciones">Colecciones</a>
                    <ul class="dropdown-menu">
                        <li><a href="joyas.html">Joyas</a></li>
                        <li><a href="collares.html">Collares</a></li>
                        <li><a href="relojeria.html">Relojería</a></li>
                    </ul>
                </li>
                <li><a href="#ofertas">Ofertas</a></li>
                <li><a href="#nosotros">Nosotros</a></li>
                <li><a href="#contacto">Contacto</a></li>
                
                <!-- Sección de usuario y carrito -->
                <li class="user-section">
                    <!-- Carrito -->
                    <a href="cart.html" id="cart-icon">
                        🛒 <span class="cart-count">0</span>
                    </a>
                    
                    <!-- Usuario autenticado -->
                    <div class="auth-element user-info" style="display: none;">
                        <span class="user-name"></span>
                        <button class="logout-btn">Cerrar sesión</button>
                    </div>
                    
                    <!-- Usuario invitado -->
                    <div class="guest-element" style="display: none;">
                        <a href="login.html" class="login-link">Iniciar sesión</a>
                    </div>
                </li>
            </ul>
        </nav>
    </header>

    <section id="joyas">
        <h2>Nuestra Colección de Joyas</h2>
        <div class="joyas-container">
            <!-- Joya 1 -->
            <div class="joya-item" data-id="joya_010">
                <img src="images/SJ_Imagenes/SJ2_Imagenes/Joyas/so13070-00agamv.png" alt="Anillo de Cuarzo">
                <div class="detalles">
                    <h3>Anillo de Cuarzo</h3>
                    <p>Anillo de cuarzo moderno y elegante.</p>
                    <p class="precio">$1,200</p>
                    <button class="btn-add-to-cart">Agregar al carrito</button>
                </div>
            </div>

            <!-- Joya 2 -->
            <div class="joya-item" data-id="joya_011">
                <img src="images/SJ_Imagenes/SJ2_Imagenes/Joyas/so13097_st.jpg" alt="Anillo de Oro">
                <div class="detalles">
                    <h3>Anillo de Oro</h3>
                    <p>Anillo de oro de 18k con diseño clásico.</p>
                    <p class="precio">$1,500</p>
                    <button class="btn-add-to-cart">Agregar al carrito</button>
                </div>
            </div>

            <!-- Joya 3 -->
            <div class="joya-item" data-id="joya_012">
                <img src="images/SJ_Imagenes/SJ2_Imagenes/Joyas/SO11172-00AG.jpg" alt="Anillo Glamor">
                <div class="detalles">
                    <h3>Anillo Glamor</h3>
                    <p>Destacado por su diseño minimalista.</p>
                    <p class="precio">$1,000</p>
                    <button class="btn-add-to-cart">Agregar al carrito</button>
                </div>
            </div>

            <!-- Joya 4 -->
            <div class="joya-item" data-id="joya_013">
                <img src="images/SJ_Imagenes/SJ2_Imagenes/Joyas/pe14002-agtp_1.jpg" alt="Aretes Azules">
                <div class="detalles">
                    <h3>Aretes Azules</h3>
                    <p>Aretes azules con detalles en diamante.</p>
                    <p class="precio">$900</p>
                    <button class="btn-add-to-cart">Agregar al carrito</button>
                </div>
            </div>

            <!-- Joya 5 -->
            <div class="joya-item" data-id="joya_014">
                <img src="images/SJ_Imagenes/SJ2_Imagenes/Joyas/pe13044-agqzci.jpg" alt="Aretes Tooworr">
                <div class="detalles">
                    <h3>Aretes Tooworr</h3>
                    <p>Aretes fluorescentes con diseño moderno.</p>
                    <p class="precio">$750</p>
                    <button class="btn-add-to-cart">Agregar al carrito</button>
                </div>
            </div>

            <!-- Joya 6 -->
            <div class="joya-item" data-id="joya_015">
                <img src="images/SJ_Imagenes/SJ2_Imagenes/Joyas/pe12060-pb6mm.jpg" alt="Aretes de Perla">
                <div class="detalles">
                    <h3>Aretes de Perla</h3>
                    <p>Diseño clásico con perlas naturales.</p>
                    <p class="precio">$1,100</p>
                    <button class="btn-add-to-cart">Agregar al carrito</button>
                </div>
            </div>
        </div>
    </section>

    <footer>
        <p>&copy; 2023 Suárez Joyería. Todos los derechos reservados.</p>
    </footer>

    <!-- Scripts -->
    <script src="js/auth.js"></script>
    <script src="js/cart.js"></script>
    
    <script>
        // Inicializar carrito
        document.addEventListener('DOMContentLoaded', function() {
            // Actualizar contador del carrito
            function updateCartCount() {
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
                document.querySelector('.cart-count').textContent = totalItems;
            }
            
            // Agregar productos al carrito
            document.querySelectorAll('.btn-add-to-cart').forEach(button => {
                button.addEventListener('click', function() {
                    const joyaItem = this.closest('.joya-item');
                    const product = {
                        id: joyaItem.getAttribute('data-id'),
                        name: joyaItem.querySelector('h3').textContent,
                        price: joyaItem.querySelector('.precio').textContent,
                        image: joyaItem.querySelector('img').src,
                        quantity: 1
                    };
                    
                    let cart = JSON.parse(localStorage.getItem('cart')) || [];
                    const existingItem = cart.find(item => item.id === product.id);
                    
                    if (existingItem) {
                        existingItem.quantity = (existingItem.quantity || 1) + 1;
                    } else {
                        cart.push(product);
                    }
                    
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartCount();
                    
                    // Mostrar notificación usando auth.js
                    if (window.auth && window.auth.showNotification) {
                        window.auth.showNotification(`${product.name} agregado al carrito`, 'success');
                    }
                });
            });
            
            // Inicializar
            updateCartCount();
        });
    </script>
</body>
</html>