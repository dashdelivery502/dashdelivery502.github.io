import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, get, push, set, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyArxtD5VjH4YH1T39dFn0yEyp9NAh42tXM",
    authDomain: "dash-delivery-502.firebaseapp.com",
    projectId: "dash-delivery-502",
    storageBucket: "dash-delivery-502.firebasestorage.app",
    messagingSenderId: "145432661248",
    appId: "1:145432661248:web:2b811789ce6415995877e5",
    measurementId: "G-9GX5BS52R2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Sesión anónima activa con UID:", user.uid);
  } else {
    signInAnonymously(auth)
      .then(() => console.log("Nueva sesión anónima iniciada"))
      .catch((error) => console.error("Error en Auth:", error));
  }
});

let carrito = [];
let restauranteActual = "";
let categoriaActual = "";
let vistaActual = "panel-inicio";
let subcategoriaActiva = 'menus';

const NUMERO_WHATSAPP = "50253062335";

const negociosPorCategoria = {
    "restaurantes": [
        { nombre: "CEVICHES FISH EXPRESS", envioGratis: true, img: "https://i.ibb.co/qMC0wHPv/Gemini-Generated-Image-juo5lgjuo5lgjuo5.jpg" },
        { nombre: "TAQUERO MUCHO", envioGratis: true, img: "https://tse3.mm.bing.net/th/id/OIP.qe7T7Csz67hNeMv8u4vGqwHaLH?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" },
        { nombre: "POLLO DELY ROSY", envioGratis: true, img: "https://i.pinimg.com/736x/18/4f/c4/184fc416f0e739d24fa767f4ce1fb717.jpg" },
        { nombre: "LA SICILIANA", envioGratis: false, img: "https://tse1.mm.bing.net/th/id/OIP.wTIHkJCHLmqCnBpLtw7vvwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" },
        { nombre: "POLLO GRANJERO", envioGratis: false, img: "https://tse2.mm.bing.net/th/id/OIP.o0i_j3gt56YaiL7XiTpfgAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" },
        { nombre: "DOMINOS EXPRESS", envioGratis: false, img: "https://tse4.mm.bing.net/th/id/OIP.y0F_StlyjW83DR4e5klmZwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" },
        { nombre: "CARNITAS EL GORDO", envioGratis: false, img: "https://static.vecteezy.com/system/resources/previews/048/006/291/large_2x/pork-dumplings-chef-free-vector.jpg" },
        { nombre: "LA NEVERIA", envioGratis: false, img: "img/neveria.webp" },
        { nombre: "HOLANDESA", envioGratis: false, img: "img/holandesa.webp" }
    ],
    "farmacia": [
        { nombre: "FARMACIA MI SALUD", envioGratis: true, img: "https://static.vecteezy.com/system/resources/previews/006/303/724/original/pharmacy-logo-template-icon-symbol-design-free-vector.jpg" },
        { nombre: "BELLO OASIS", envioGratis: false, img: "img/bello-oasis.webp" }
    ],
    "mercado": [
        { nombre: "VERDURAS Y FRUTAS JENNYFER", envioGratis: false, img: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=300" },
        { nombre: "CARNICERIA EL RANCHO", envioGratis: false, img: "https://static.vecteezy.com/system/resources/previews/006/981/131/original/fresh-meat-premium-beef-logo-free-vector.jpg" },
        { nombre: "MERCADITO ORIENTE", envioGratis: false, img: "https://www.creativefabrica.com/wp-content/uploads/2024/12/09/Modern-Ecommerce-Website-Logo-SVG-Vector-Graphics-111628754-1-580x387.jpg" }
    ],
    "vehiculos": [
        { nombre: "MOTOS HONDA", envioGratis: true, img: "https://toppng.com/uploads/thumbnail/honda-logo-11540236620o3erbhp25m.png" }
    ],
    "hogar": [
        { nombre: "TOTALPLAST", envioGratis: true, img: "img/plast.webp" },
        { nombre: "1VEA HOGAR", envioGratis: true, img: "img/1vea.webp" }
    ],
    "otros": [
        { nombre: "GRAN BAZAR", envioGratis: true, img: "img/bazar.webp" }
    ]
};

const infoRestaurantes = {
    "CEVICHES FISH EXPRESS": { envioGratis: true, mensajeInfo: "Horario delivery 8am-5pm / envio gratis aplica desde Q55 en casco urbano" }, 
    "TAQUERO MUCHO": { envioGratis: true, mensajeInfo: "Horario delivery 8am-8pm / envio gratis aplica desde Q30 en casco urbano" },
    "POLLO DELY ROSY": { envioGratis: true, mensajeInfo: "Horario delivery 8am-8pm / envio gratis aplica desde Q30 en casco urbano" },
    "LA SICILIANA": { envioGratis: false, mensajeInfo: "Horario delivery 9am-8pm" },
    "POLLO GRANJERO": { envioGratis: false, mensajeInfo: "Horario delivery 9am-6pm" },
    "DOMINOS EXPRESS": { envioGratis: false, mensajeInfo: "Horario delivery 8am-8pm"},
    "CARNITAS EL GORDO": { envioGratis: false },
    "LA NEVERIA": { envioGratis: false, mensajeInfo: "Horario delivery 9am-5pm"},
    "HOLANDESA": { envioGratis: false, mensajeInfo: "Horario delivery 9am-7pm" },
    "FARMACIA MI SALUD": { envioGratis: true, mensajeInfo: "Horario delivery 8am-8pm / envio gratis aplica desde Q70" },
    "BELLO OASIS": { envioGratis: false, mensajeInfo: "Horario delivery 8am-8pm"},
    "VERDURAS Y FRUTAS JENNYFER": { envioGratis: false, mensajeInfo: "Horario delivery 8am-5pm"},
    "CARNICERIA EL RANCHO": { envioGratis: false, mensajeInfo: "Horario delivery 8am-4pm"},
    "MERCADITO ORIENTE": { envioGratis: false, mensajeInfo: "Horario delivery 8am-7pm" },
    "TOTALPLAST": { envioGratis: true, mensajeInfo: "Horario delivery 8am-8pm / envio gratis aplica desde Q70"},
    "MOTOS HONDA": { envioGratis: true, mensajeInfo: "Envio gratis a todo el pais, de 2 a 3 dias para entrega" },
    "1VEA HOGAR": { envioGratis: true, mensajeInfo: "Producto desde la fabrica a tu hogar" },
    "GRAN BAZAR": { envioGratis: true, mensajeInfo:"Envio de 1 a 3 dias, envio gratis aplica desde Q150"}
};

const menus = {
    "CEVICHES FISH EXPRESS": [
        { nombre: "ceviche mixto", precio: 50, descripcion: "Mariscos frescos surtidos marinados en zumo de limón con cilantro, cebolla picada y galletas saladas.", imagen: "https://www.laylita.com/recetas/wp-content/uploads/1-Ceviche-de-camaron-640x640.jpg", subcat: "menus" },
        { nombre: "ceviche mixto grande", precio: 80, descripcion: "Porción familiar de camarón y pescado con sazón especial de la casa, aguacate y acompañamientos.", imagen: "https://www.laylita.com/recetas/wp-content/uploads/1-Ceviche-de-camaron-640x640.jpg" , subcat: "menus"},
        { nombre: "ceviche de camaron", precio: 80, descripcion: "Camarones seleccionados curtidos en limón con tomate, cebolla, salsa inglesa y un toque picante.", imagen: "https://www.guatemala.com/fotos/2020/04/ceviche-885x500.jpg", subcat: "menus" },
        { nombre: "Gaseosa en lata", precio: 6, descripcion: "Lata fría salvavidas sabor uva, limon o naranja.", imagen: "https://latorremx.vtexassets.com/arquivos/ids/190394-800-auto?v=638494109579900000&width=800&height=auto&aspect=true", opciones: ["Uva", "Limón", "Naranja"], subcat: "bebidas" }
    ],
    "TAQUERO MUCHO": [
        { nombre: "Quesa Birria", precio: 35, descripcion: "3 tortillas rellenas de carne de res deshebrada con abundante queso", imagen: "img/quesabirria1.webp", subcat: "menus" },
        { nombre: "Doraditas de Birria", precio: 35, descripcion: "tortilla dorada con carne deshebrada", imagen: "img/doraditas.webp", subcat: "menus" },
        { nombre: "Mega Birria", precio: 60, descripcion: "tortilla grande rellena de carne de res deshebrada y abundante queso", imagen: "img/megabirria.webp", subcat: "menus" },
        { nombre: "Costra de Queso", precio: 40, descripcion: "queso a la plancha tostado y crujiente", imagen: "img/costra-queso.webp", subcat: "menus" },
        { nombre: "Birria Men", precio: 45, descripcion: "sopa de fideos cocidos con consome de birria y una abundante mezcla de birria y queso", imagen: "img/birria-men.webp", subcat:"menus" },
        { nombre: "Taco Tradicional Mexicano", precio: 30, descripcion: "taco mexicano con carne a su eleccion", imagen: "img/taco-pastor.webp", opciones: ["al pastor", "de asada", "de pollo", "de longaniza", "de chorizo"], subcat:"menus" },
        { nombre: "Quesadillas y Burritos", precio: 35, descripcion: "Tradicional mexicano(a) con carne", imagen: "img/quesadilla2.webp", opciones: ["de asada", "al pastor", "de pollo","longaniza", "chorizo"], subcat:"menus" },
        { nombre: "Taqueroburguer", precio: 45, descripcion: "Hamburguesa de la casa con papas", imagen: "img/taqueroburger1.webp", subcat:"menus" },
        { nombre: "Torito con papas", precio: 40, descripcion: "hamburguesa con huevo y papas", imagen: "img/torito.webp", subcat:"menus" },
        { nombre: "Churrasquito Mixto", precio: 45, descripcion: "Churrasquito de 3 carnes", imagen: "img/churrasco.webp", subcat:"menus" },
        { nombre: "6 Alitas en Barbacoa", precio: 40, descripcion: "alitas de pollo bañadas en barbacoa", imagen: "img/alitas1.webp", subcat:"menus"},
        { nombre: "12 Alitas en Barbacoa", precio: 60, descripcion: "alitas de pollo bañadas en barbacoa", imagen: "img/alitas1.webp", subcat:"menus" },
        { nombre: "Bandeja de 20 tacos", precio: 200, descripcion: "20 tacos mixtos con acompañamiento", imagen: "img/bandejas.webp", subcat:"menus" },
        { nombre: "Bandeja de 15 Tacos", precio: 160, descripcion: "15 tacos mixtos con acompañamientos", imagen: "img/bandejas.webp", subcat:"menus" },
        { nombre: "Bandeja de 12 Tacos", precio: 135, descripcion: "12 tacos mixtos con acompañamientos", imagen: "img/bandejas.webp", subcat:"menus" },
        { nombre: "Licuados", precio: 15, descripcion: "licuado de fruta natural a su eleccion", imagen: "img/licuados.webp", opciones: ["Fresa", "Banano", "Melon"], subcat:"bebidas" },
        { nombre: "Piña Colada", precio: 30, descripcion: "coctel dulce y refrescante elaborada con jugo de piña principalmente", imagen: "img/p-colada.webp", subcat:"bebidas" },
        { nombre: "Cafe Helado", precio: 30, descripcion: "bebida refrescante con hielo hecha a base de cafe", imagen: "img/cafe-helado.webp", subcat:"bebidas" },
        { nombre: "Michelada", precio: 35, descripcion: "mezcla de jugos vegetales y cerveza", imagen: "img/michelada.webp", subcat:"bebidas" },
        { nombre: "Gaseosa", precio: 8, descripcion: "bebida gaseosa refrescante", opciones: ["Sprite","Fanta Uva", "Fanta Naranja","Coca Cola"], imagen: "img/cocacola.webp", subcat:"bebidas" },
        { nombre: "Agua pura jirai", precio: 5, descripcion: "pura y refrescante", imagen: "img/jirai.webp",subcat:"bebidas" },
        { nombre: "Bebida Natural", precio: 10, descripcion: "Fresco natural preparado al día .", imagen: "https://media.istockphoto.com/id/1171303132/photo/strawberry-cocktail-and-strawberry-on-wooden-table-with-a-blank-space-for-a-text.jpg?s=1024x1024&w=is&k=20&c=7up1VlKOlVHW6V-HQp7IyC5J-WS2xbEYdd3RD3YxfC4=", opciones: ["Fresa", "Sandia", "Limonada", "melon"], subcat:"bebidas" }
    ],
    "POLLO DELY ROSY": [
        { nombre: "Combo 1 Pieza (1Papas + 1Ensalada)", precio: 20, descripcion: "Pieza de pollo crujiente + papas fritas y ensalada", imagen: "https://static.vecteezy.com/system/resources/previews/073/675/187/large_2x/fried-chicken-and-french-fries-free-png.png", subcat:"menus" },
        { nombre: "Combo 2 Piezas (1Papas + 1Ensalada)", precio: 30, descripcion: "Dos piezas de pollo acompañadas de 1 porcion de papas fritas y 1 ensalada.", imagen: "https://tse3.mm.bing.net/th/id/OIP.vuytQ9IbZyLeWM6A5BoakwHaF0?r=0&w=1920&h=1510&rs=1&pid=ImgDetMain&o=7&rm=3", subcat:"menus" },
        { nombre: "Combo 3 Piezas (1Papas + 1Ensalada)", precio: 37, descripcion: "Tres piezas de pollo frito con 1 porcion de papa y 1 ensalada", imagen: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=300",subcat:"menus" },
        { nombre: "combo 5 piezas (2ensaladas + 2papas", precio: 5, descripcion: "5 piezas de pollo (no pechuga)", imagen: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=300", subcat:"menus" },
        { nombre: "combo 8 piezas(3ensaladas + 3papas)", precio: 5, descripcion: "8 piezas de pollo (no pechuga)", imagen: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=300", subcat:"menus" },
        { nombre: "1 Papa", precio: 7, descripcion: "Complemento extra individual", imagen: "https://static.vecteezy.com/system/resources/previews/059/482/403/non_2x/crispy-golden-french-fries-served-in-a-red-container-for-a-delicious-fast-food-snack-french-fries-food-fast-food-snack-isolated-lunch-take-out-free-png.png",subcat:"complementos" },
        { nombre: "1 Ensalada", precio: 7, descripcion: "Complemento extra individual.", imagen: "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/bfubmka0kj0j23n1ndnx", subcat:"complementos" },
        { nombre: "Papas Locas", precio: 15, descripcion: "Papas fritas con salsa y mayonesa", imagen: "https://lh7-rt.googleusercontent.com/docsz/AD_4nXcnibWid62HSACJCV9jl2pbaLD0xj-XybCaS6AR_GCix25V9xBbEWNMVPOjuIXDH10_7XAyAlFa5Au3GsMv27ZjVVArSq7hwomRSM-j1Bt37dUKXuc82mXF7h_lQOq_O_POXPtKvg?key=ls6I_YEY3fzKA7j1A3GHLg", subcat:"complementos" },
        { nombre: "Agua pura jirai", precio: 5, descripcion: "pura y refrescante", imagen: "img/jirai.webp", subcat:"bebidas" },
        { nombre: "Gaseosa en lata", precio: 8, descripcion: "Bebida gaseosa Coca Cola en lata.",opciones:["coca cola","sprite","fanta uva","fanta naranja"], imagen: "img/cocacola.webp", subcat:"bebidas" }
    ],
    "LA SICILIANA": [
        { nombre: "Pizza Personal", precio: 15, descripcion: "Pizza individual de 4 rebanadas horneada en piedra con salsa de tomate y queso mozzarella.", imagen: "img/personal-sici.webp", subcat:"menus" },
        { nombre: "Calzone Supremo", precio: 20, descripcion: "mas relleno, mas razones para pedirlo", imagen: "img/calzone.webp", subcat:"menus" },
        { nombre: "Pizza Carnilover", precio: 60, descripcion: "Pizza grande cargada con pepperoni, salchicha italiana, jamón, tocino crocante y extra queso.", imagen: "img/carnilover-sici.webp",subcat:"menus" },
        { nombre: "Pizza Hawaiana", precio: 60, descripcion: "Combinación clásica de piña caramelizada en almíbar, trozos de jamón premium y queso derretido.", imagen: "img/hawai-sici.webp" ,subcat:"menus"},
        { nombre: "Pizza Grande Extra Queso", precio: 55, descripcion: "Pizza familiar de 8 porciones bañada en doble capa de queso mozzarella fundido.", imagen: "img/extra-queso-sici.webp",subcat:"menus" },
        { nombre: "2 Pizzas Grandes (+ 8 Canelitas)", precio: 90, descripcion: "Super combo de 2 pizzas familiares a elección más 8 deliciosos palitroques dulces con canela.", imagen: "img/combo1-sici.webp",subcat:"menus" },
        { nombre: "Agua pura jirai", precio: 5, descripcion: "pura y refrescante", imagen: "img/jirai.webp",subcat:"bebidas" },
        { nombre: "1L de Pepsi", precio: 8, descripcion: "Botella desechable de 1 Litro para compartir.", imagen: "img/pepsi.webp",subcat:"bebidas" }
    ],
    "POLLO GRANJERO": [
        { nombre: "Menu 1 pieza", precio: 25, descripcion: "1 pieza (no pechuga) + 1 papa + 1 ensalada", imagen: "https://tb-static.uber.com/prod/image-proc/processed_images/b4119674e9468e902f62efaf88e8d949/fb86662148be855d931b37d6c1e5fcbe.jpeg",subcat:"menus" },
        { nombre: "Menu 2 piezas", precio: 35, descripcion: "2 piezas(no pechuga) + 1 papa + 1 ensalada", imagen: "https://tb-static.uber.com/prod/image-proc/processed_images/b4119674e9468e902f62efaf88e8d949/fb86662148be855d931b37d6c1e5fcbe.jpeg",subcat:"menus" },
        { nombre: "Menu 3 piezas", precio: 45, descripcion: "3 piezas(no pechuga) + 1 papa + 1 ensalada ", imagen: "https://tb-static.uber.com/prod/image-proc/processed_images/b4119674e9468e902f62efaf88e8d949/fb86662148be855d931b37d6c1e5fcbe.jpeg",subcat:"menus" },
        { nombre: "Combo 5 piezas", precio: 85, descripcion: "5 piezas(no pechuga) + 2 papas + 2 ensaladas", imagen: "https://cdn.telediario.cr/uploads/media/2026/03/19/cadena-cierra-sus-operaciones-en.jpg", subcat:"menus" },
        { nombre: "Combo 8 piezas", precio: 120, descripcion: "8 piezas(no pechuga)+3 papas +3 ensaladas", imagen: "https://images.rappi.co.cr/restaurants_background/7367_1654882378124.png?e=webp&d=800x800&q=70",subcat:"menus" },
        { nombre: "Hamburguesa", precio: 22, descripcion: "Hamburguesa doble con queso", imagen: "https://pricelisto-files.s3.us-east-2.amazonaws.com/pollo-granjero-cr/hamburguesa-doble-torta.png",subcat:"menus" },
        { nombre: "Porcion de papas", precio: 8, descripcion: "papas fritas normales", imagen: "https://pricelisto-files.s3.us-east-2.amazonaws.com/pollo-granjero-cr/papa-frita-pequena.png",subcat:"complementos" },
        { nombre: "Ensalada", precio: 8, descripcion: "ensalada de repollo individual", imagen: "https://pricelisto-files.s3.us-east-2.amazonaws.com/pollo-granjero-cr/ensalada-de-repollo.png" ,subcat:"complementos"},
        { nombre: "Pastelito", precio: 7, descripcion: "unidad de pastelito relleno con manzana", imagen: "https://tse1.mm.bing.net/th/id/OIP.x6D1n4exd2z5Eah7-kNryQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" ,subcat:"complementos"},
        { nombre: "Gaseosa en lata", precio: 6, descripcion: "gaseosa salvavidas sabor limon,uva o naranja", imagen: "https://latinshopatl.com/cdn/shop/files/Salvavidaslimon1.jpg?v=1749489837&width=1946", opciones: ["Limón", "Uva", "Naranja"],subcat:"bebidas" },
        { nombre: "Agua pura jirai", precio: 5, descripcion: "pura y refrescante", imagen: "img/jirai.webp" ,subcat:"bebidas"},
        { nombre: "1L de Pepsi", precio: 8, descripcion: "Botella desechable de 1 Litro para compartir.", imagen: "img/pepsi.webp",subcat:"bebidas" }
    ],
    "DOMINOS EXPRESS": [
        { nombre: "Pizza Pepperoni", precio: 55, descripcion: "rebanadas de pepperoni doradito y queso fundido.", imagen: "img/peperoni-domi.webp",subcat:"menus" },
        { nombre: "Pizza Tropical", precio: 65, descripcion: "Sabor agridulce especial con jamón, piña fresca y salsa de la casa.", imagen: "img/tropical-domi.webp",subcat:"menus" },
        { nombre: "Pizza Carnivora", precio: 70, descripcion: "jamón, pepperoni, carne molida y salchicha frita.", imagen: "img/carnivora-domi.webp",subcat:"menus" },
        { nombre: "Pizzerola", precio: 20, descripcion: "queso derretido y especias italianas.", imagen: "img/pizzerola-domi.webp",subcat:"menus" },
        { nombre: "Mega Empanada", precio: 20, descripcion: "Empanada gigante frita rellena de carne picada sazonada con vegetales.", imagen: "img/empanada-domi.webp",subcat:"menus" },
        { nombre: "Gaseosa Salvavidas en Lata", precio: 6, descripcion: "gaseosa salvavidas del sabor que prefieras", imagen: "https://latinshopatl.com/cdn/shop/files/Salvavidaslimon1.jpg?v=1749489837&width=1946", opciones: ["limon", "uva", "naranja"],subcat:"bebidas" },
        { nombre: "Agua pura jirai", precio: 5, descripcion: "pura y refrescante", imagen: "img/jirai.webp",subcat:"bebidas" },
        { nombre: "Pepsi 1 Litro", precio: 8, descripcion: "Bebida familiar refrescante Pepsi de 1 L.", imagen: "img/pepsi.webp",subcat:"bebidas" }
    ],
    "CARNITAS EL GORDO": [
        { nombre: "Libra de Carnitas", precio: 55,etiqueta: "disponible muy pronto", descripcion: "Carne de cerdo frita en su propia grasa bien doradita por fuera y suave por dentro", imagen: "img/carnitas.webp" },
        { nombre: "Media Libra de Carnitas", precio: 30,etiqueta: "disponible muy pronto", descripcion: "Media libra de crujiente carnita de cerdo acompañada de rábanos picado", imagen: "img/carnitas.webp" },
        { nombre: "Porcion de Mushque", precio: 15,etiqueta: "disponible muy pronto", descripcion: "Delicioso chicharrón picadito en pasta con especias regionales tradicionales.", imagen: "img/mushque.webp" },
        { nombre: "Docena de Longaniza", precio: 12,etiqueta: "disponible muy pronto", descripcion: "12 longanizas asadas con hierbas aromáticas y ajo listas para disfrutar.", imagen: "img/longas.webp" },
        { nombre: "1 litro de Pepsi", precio: 8,etiqueta: "disponible muy pronto", descripcion: "Botella helada de 1 litro.", imagen: "img/pepsi.webp" },
        { nombre: "Agua pura jirai", precio: 5, descripcion: "pura y refrescante", imagen: "img/jirai.webp" },
        { nombre: "gaseosa en lata", precio: 6,etiqueta: "disponible muy pronto", descripcion: "Lata personal de gaseosa salvavidas surtida.", imagen: "https://salvavidasenlinea.com.gt/wp-content/uploads/2025/01/Foto_AppTuHogar_1500px_BLUE-800x800.jpg", opciones: ["Uva", "Limón", "Naranja", "Cola"] }
    ], 
    "LA NEVERIA": [
        { nombre: "Helado wafle", precio: 14, descripcion: "cono normal con una bola de helado", imagen: "img/wafle.webp", opciones: ["Vainilla", "Chocolate", "Fresa", "napolitano"],subcat:"menus" },
        { nombre: "Wafle Doble", precio: 19, descripcion: "cono normal con dos bolas de helado", imagen: "img/wafle-doble.webp",subcat:"menus" },
        { nombre: "Choco Wafle", precio: 18, descripcion: "cono con chocolate y una bola de helado", imagen: "img/choco-wafle.webp",subcat:"menus" },
        { nombre: "Litro de helado", precio: 36, descripcion: "sabor a tu eleccion, no incluye conos", opciones: ["fresa","chocolate","queso crema"], imagen: "img/helado-litro.webp",subcat:"menus" },
        { nombre: "Medio Galon de Helado", precio: 57, descripcion: "no incluye conos, el descuento de la promocion se hace al completar su pedido",etiqueta: "promo 2xQ95",subcat:"menus", opciones: ["fresa", "vainilla"], imagen: "img/helado-medio-galon.webp" },
        { nombre: "choco banana", precio: 32, descripcion: "", imagen: "img/choco-banana.webp",subcat:"menus" },
        { nombre: "Banana topper", precio: 32, descripcion: "", imagen: "img/banana-truper.webp",subcat:"menus" },
        { nombre: "Banana split", precio: 32, descripcion: "3 bolas de helado acompañadas de banano y galleta", imagen: "img/banana-split.webp",subcat:"menus" },
        { nombre: "Cafe Helado", precio: 28, descripcion: "",opciones: ["caramelo","chocolate","chocogalleta","mocca", "cookies and creame"], imagen: "img/cafe-helado-neveria.webp",subcat:"menus" },
        { nombre: "Sundae", precio: 26, descripcion: "3 bolas de rico helado", imagen: "img/sundae.webp", opciones: ["Vainilla", "Chocolate", "Fresa"] ,subcat:"menus"},
        { nombre: "Pastel de Helado pequeño", precio: 110, descripcion: "de 4 a 6 porciones segun medida", imagen: "img/pastel-pe.webp" ,subcat:"menus"},
        { nombre: "Pastel de Helado Mediano", precio: 155, descripcion: "pastel de 8 a 12 porciones segun medida", imagen: "img/pastel-g.webp",subcat:"menus" },
        { nombre: "Pastel de Helado Grande", precio: 210, descripcion: "pastel de 16 a 20 porciones segun medida", imagen: "img/pastel-pe.webp",subcat:"menus" }
    ],
    "HOLANDESA": [
        { nombre: "Pastel California", precio: 185, descripcion: "12 a 16 porciones", imagen: "img/pastel-california.webp",subcat:"menus" },
        { nombre: "Porcion 3 leches", precio: 12, descripcion: "porcion para una persona", imagen: "img/3leches.webp",subcat:"menus" },
        { nombre: "Pastel de frutas extra grande", precio: 225, descripcion: "16 a 20 porciones", imagen: "img/pastel-frutas.webp",subcat:"menus" },
        { nombre: "pastel de frutas", precio: 130, descripcion: "8 a 10 porciones", imagen: "img/pastel-frutas.webp",subcat:"menus" },
        { nombre: "Coca Cola", precio: 8, descripcion: "Bebida gaseosa en lata de 354ml", imagen: "img/cocacola.webp",subcat:"bebidas" },
        { nombre: "3 litros de gaseosa", precio: 20, descripcion: "Botella tamaño gigante Tiky o similar de 3 Litros.", imagen: "https://salvavidasenlinea.com.gt/wp-content/uploads/2022/08/TIKY-3-LTS.png", opciones: ["Tiky", "Uva", "Limon"],subcat:"bebidas" }
    ],
    "FARMACIA MI SALUD": [
        { nombre: "Acetaminofén 500mg MK blister", precio: 10, descripcion: "Analgésico para adultos en presentacion de 10 tabletas comprimidas.", imagen: "img/aceta-mk.webp" },
        { nombre: "Acetaminofen Farmandina 100mg", precio: 40, descripcion: "analgesico y antipiretico para niños", imagen: "img/acetaminofen-farmandina.webp" },
        { nombre: "kalmanervo 25000 x 1 ampolla", precio: 72, etiqueta: "compra 3 y te regalamos 1", descripcion: "inyeccion para el dolor,inflamacion de nervios,dolor lumbar.contiene vitamina B1.B12 y B16", imagen: "img/kalmanervo.webp" },
        { nombre: "Dolo kalmanervo x 2 ampollas", precio: 75, descripcion: "inyeccion con vitaminas B1.B12.B6 y diclofenaco para dolores fuertes e inflamacion de nervios", imagen: "img/kalmanervo.webp" },
        { nombre: "Sucradel suspencion 200ml", precio: 180, descripcion: "sucralfato 1g/5ml de la marca Fardel", imagen: "img/sucradel.webp" },
        { nombre: "Ketorodel(ketorolaco) 20mg Fardel", precio: 98, descripcion: "caja x 10 tabletas recubiertas de ketorolaco trometamol 20mg", imagen: "img/ketorodel.webp" },
        { nombre: "Toallas Humedas Family Choice", precio: 14, descripcion: "presentacion extra larga con 80und para el uso diario en bebes y adultos", imagen: "img/toallitas.webp" },
        { nombre: "Suero Oral Hidravida", precio: 18, descripcion: "Sabores surtidos, indica cual es tu favorito luego de realizar el pedido", imagen: "img/hidravida.webp", opciones: ["Fresa", "Coco", "Manzana", "Natural"] }
    ],
    "BELLO OASIS": [
        { nombre: "Shampoo Calypso Keratina", precio: 25, descripcion: "shampoo de 1 litro repara,nutre,protege y alisa tu cabello", imagen: "img/calypso-keratina.webp" },
        { nombre: "Shampoo Calypso Anticaspa", precio: 25, descripcion: "shampoo de 1 litro anti caspa", imagen: "img/calypso-anticaspa.webp" },
        { nombre: "Shampoo Tammy Aguacate", precio: 10, descripcion: "shampoo tammy de 500ml da brillo y aroma agradable", imagen: "img/tammy-aguacate.webp" },
        { nombre: "Axe Dark Temperation", precio: 23, descripcion: "desodorante en aerosol de 150ml", imagen: "img/axe-dark.webp" },
        { nombre: "Axe Fragancia+Frescura", precio: 23, descripcion: "desodorante en aerosol de 150ml", imagen: "img/axe-frescura.webp" },
        { nombre: "Pomada Lecleire", precio: 10, descripcion: "cuida tu piel y dejala con un aroma encantador", imagen: "img/pomada-lecleire.webp" },
        { nombre: "Ponds Clarant B3", precio: 22, descripcion: "crema antimanchas e hidratante, unifica el tono de piel y desvanece manchas oscuras", imagen: "img/ponds-clarant.webp" }
    ],
    "VERDURAS Y FRUTAS JENNYFER": [
        { nombre: "Libra de Tomate", precio: 6, descripcion: "Tomate fresco y seleccionado.", imagen: "img/tomate.webp" },
        { nombre: "libra de cebolla", precio: 11, descripcion: "excelente tamaño para cocinar.", imagen: "img/cebolla.webp" },
        { nombre: "Libra de Papa", precio: 8, descripcion: "excelente tamaño para cocinar.", imagen: "img/libra-papa.webp" },
        { nombre: "Par de Pepinos", precio: 8, descripcion: "excelente tamaño para cocinar.", imagen: "img/pepino.webp" },
        { nombre: "Limon Criollo 6und", precio: 5, descripcion: "excelente tamaño para cocinar.", imagen: "img/limon-criollo.webp" },
        { nombre: "Mil Tomate LB", precio: 12, descripcion: "excelente tamaño para cocinar.", imagen: "img/mil-tomate.webp" },
        { nombre: "Zanahoria", precio: 4, descripcion: "Unidad de buen tamaño y bonita presentacion", imagen: "img/zanahoria.webp" },
        { nombre: "Manzana 4und", precio: 11, descripcion: "manzana fresca de buen tamaño", opciones:["Roja", "Verde"], imagen: "img/manzana.webp" },
        { nombre: "Sandia", precio: 16, descripcion: "Dulce de un tamaño grande", imagen: "img/sandia.webp " },
        { nombre: "Apio", precio: 6, descripcion: "excelente tamaño para cocinar.", imagen: "img/apio.webp" },
        { nombre: "Par de peras", precio: 9, descripcion: "excelente tamaño para cocinar.", imagen: "img/pera.webp" },
        { nombre: "Piña", precio: 15, descripcion: "excelente tamaño y dulzura", imagen: "img/pineapol.webp" },
        { nombre: "Chile Pimiento Rojo", precio: 3, descripcion: "excelente tamaño para cocinar.", imagen: "img/pimiento.webp" },
        { nombre: "Carbon en Bolsa", precio: 9, descripcion: "Bolsa mediana", imagen: "img/carbon.webp" },
        { nombre: "Bandeja de elote", precio: 19, descripcion: "Elote dulce y amarillo para caldo o churrasco", imagen: "img/elote-dulce.webp" },
        { nombre: "Libra de Uva", precio: 32, descripcion: "uva en excelente estado, fresca y de buena calidad", opciones: ["Roja","Verde"], imagen: "img/uva.webp" },
        { nombre:  "Libra de Fresa", precio: 32, descripcion: "Buen tamaño y color", imagen: "img/fresa.webp" },
        { nombre: "libra de ejote", precio: 13, descripcion: "ejote grande y tierno", imagen: "img/ejote.webp" }
    ],
    "CARNICERIA EL RANCHO": [
        { nombre: "Libra de Carne simple", precio: 38, descripcion: ", Corte fino, carne fresca", imagen: "https://carnesideal.tienda/cdn/shop/products/RES58-1_7d85edfa-86a8-4dcd-b56e-30ac1a296c49_800x.jpg?v=1627841553" },
        { nombre: "Libra de Carne Preparada", precio: 40, descripcion: ", Carne fresca, corte fino y preparacion ideal para churrasco", imagen: "https://carnesnaveda.pe/wp-content/uploads/2023/03/churrascos.jpg" },
        { nombre: "Libra de hueso", precio: 28, descripcion: " Hueso con carne ideal para caldos", imagen: "https://amazingribs.com/wp-content/uploads/2025/08/beef-short-ribs-1200.jpeg" },
        { nombre: "Libra de Carne molida", precio: 30, descripcion: ", Carne fresca del dia", imagen: "https://superxtrapanama.vtexassets.com/arquivos/ids/162811-800-auto?v=637896282367100000&width=800&height=auto&aspect=true" },
        { nombre: "10 Longanizas de res", precio: 10, descripcion: "Tamaño noble y sabor incomparable ", imagen: "https://www.donmoddang.go.th/index/add_file/GhIOVtvWed63019.jpg" }
    ],
    "MERCADITO ORIENTE": [
        { nombre: "Arroz Molinero 1 libra", precio: 7.50, descripcion: "primera calidad.", imagen: "img/molinero.webp" },
        { nombre: "Azucar Morena", precio: 20, descripcion: "2000g azucar tulipan fortificada con vitamina A", imagen: "img/azucar-morena.webp" },
        { nombre: "Azucar Caña Real 5.4lb", precio: 24, descripcion: "azucar blanca", imagen: "img/azucar-real.webp" },
        { nombre: "Azucar Morena 400g", precio: 4.50, descripcion: "azucar tulipan morena fortificada con vitamina A", imagen: "img/azucar-morena.webp" },
        { nombre: "Azucar Caña Real 500g", precio: 5.50, descripcion: "azucar blanca", imagen: "img/azucar-real.webp" },
        { nombre: "Gaseosa Ting", precio: 13, descripcion: "3L sabor a Toronja", imagen: "img/tang-toronja.webp" },
        { nombre: "Huevo mediano ", precio: 34, descripcion: "Carton de 30und, huevo blanco", imagen: "img/huevos.webp" },
        { nombre: "Bebida Lactea Foremost", precio: 12, descripcion: "alternativa saludable 0% colesterol, 946ml", imagen: "img/foremost.webp" },
        { nombre: "Cafe Quetzal Sello Verde", precio: 18, descripcion: "tostado y molido", imagen: "img/sello-verde.webp" },
        { nombre: "Cafe Musun Suave 260g", precio: 68, descripcion: "estudio.", imagen: "img/musun.grande.webp" },
        { nombre: "Cafe Musun suave 46g", precio: 18, descripcion: "aroma penetrante", imagen: "img/musun-pequeño.webp" },
        { nombre: "Pan Blanco La mejor", precio: 14, descripcion: "rápida cocción y gran sabor.", imagen: "img/lamejor.webp" },
        { nombre: "Agua pura jirai", precio: 5, descripcion: "pura y refrescante", imagen: "img/jirai.webp" },
        { nombre: "Aceite Patrona 175ml", precio: 5, descripcion: "alimentos diarios.", imagen: "img/patrona.webp" }
    ],
    "TOTALPLAST": [
        { nombre: "Basurero pequeño", precio: 30, descripcion: "basurero con tapa, colores surtido", imagen: "img/basurero.webp" },
        { nombre: "Basurero 20L con abrefacil", precio: 90, descripcion: "basurero de la marca mega, abre la tapa con el pie", imagen: "img/basurero-pedal.webp" },
        { nombre: "Set de Pichel 5L", precio: 25, descripcion: "hermoso pichel nuevo diseño con 4 vasos.", imagen: "img/pichel.webp" },
        { nombre: "Organizador Plastico", precio: 60, descripcion: "4 gavetas con diseño de ratan y color surtido", imagen: "img/organizador.webp" },
        { nombre: "Vaso Diamante", precio: 10, descripcion: "hermoso y resistente, capacidad de hasta 650ml.", imagen: "img/vasop.webp" }
    ],
    "MOTOS HONDA": [
        { nombre: "XBLADE 160 mod2026", precio: 17890, descripcion: "mecanica,gasolina/carburada, diseño deportivo y baja altura", etiqueta: "Hasta 24 cuotas sin interes", imagen: "https://th.bing.net/th/id/R.ce16a0823a94576db70b92c330f4397a?rik=6rlDgteiVsdpHg&pid=ImgRaw&r=0" },
        { nombre: "XR190L 2026", precio: 28490, descripcion: "doble proposito versatil, tablero digital y puerto usb",etiqueta: "Hasta 24 cuotas sin interes", imagen: "https://motos.honda.com.ec/uploads/galeria/XR190L_R.jpg" },
        { nombre: "XR150L 2026", precio: 16290, descripcion: "doble proposito versatil y resistente para uso diario",etiqueta: "Hasta 24 cuotas sin interes", imagen: "https://tse2.mm.bing.net/th/id/OIP.3jWa1kxtLKUUg0DXYeHO5QHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" },
        { nombre: "CRF300 RALLY 2026", precio: 68190, descripcion: "Trail ligera y de aventura 27.5 CV y 26.6 Nm",etiqueta: "Hasta 24 cuotas sin interes", imagen: "https://tse1.mm.bing.net/th/id/OIP.1e4M1aCoGjk0G-9vvNWuQgAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" },
        { nombre: "CRF125F 2026", precio: 34190, descripcion: "Todo terreno de iniciacion, 8.9HP y 10.2Nm",etiqueta: "Hasta 24 cuotas sin interes", imagen: "https://powersports.honda.com/motorcycle/trail/crf125f/-/media/products/family/crf125f/trim-hero/gallery/crf125f/2026/red/2026-crf125f-red-gallery-01.png" },
        { nombre: "CB300F TWISTER 2026", precio: 35890, descripcion: "Naked deportiva de frenos ABS y control de traccion HSTC, iluminacion led completa",etiqueta: "Hasta 24 cuotas sin interes", imagen: "https://www.iamabiker.com/wp-content/uploads/2022/08/Honda-CB300F-HD-wallpaper-6-1536x864.jpg" },
        { nombre: "CRF 300F 2026", precio: 64995, descripcion: "",etiqueta: "Hasta 24 cuotas sin interes", imagen: "img/crf300f.webp" },
        { nombre: "DIO 110 2026", precio: 12990, descripcion: "",etiqueta: "Hasta 24 cuotas sin interes", imagen: "img/dio110.webp" },
        { nombre: "NX 190 2026", precio: 28790, descripcion: "",etiqueta: "Hasta 24 cuotas sin interes", imagen: "img/nx190.webp" },
        { nombre: "CB125F TWISTER DLX 2026", precio: 13990, descripcion: "",etiqueta: "Hasta 24 cuotas sin interes", imagen: "img/cb125f.webp" },
        { nombre: "CB100 2026", precio: 9790, descripcion: "" ,etiqueta: "Hasta 24 cuotas sin interes", imagen: "img/cb100.webp" }, 
        { nombre: "NAVI 110cc 2026", precio: 12990, descripcion: "Hasta 160km por galon, compartimiento de carga y 7.8HP",etiqueta: "Hasta 24 cuotas sin interes", imagen: "https://tse2.mm.bing.net/th/id/OIP.rywZJcCck72lj6cnRE7n4QHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" }
    ],
    "1VEA HOGAR": [
        { nombre: "Cobertor de Sillon", precio: 270, descripcion: "Directo de fabrica, ideal para sala con sillones de 1,2 y 3 plazas, varios colores", imagen: "img/cobertor-sillon.webp",etiqueta: "entrega de 5-8 dias por fabricacion", opciones: ["Beige", "Gris", "Azul Marino", "Vino"] },
        { nombre: "Cobertor de Lavadora", precio: 180, descripcion: "Impermeable, resistente y facil de lavar, se adapta a cualquier lavadora", imagen: "img/lavadora.webp", etiqueta: "entrega de 5-8 dias por fabricacion" },
        { nombre: "Cortinas Blackout ", precio: 150, descripcion: "medida 137 x 213cm, argollas metalicas, varios colores", imagen: "img/cortina.webp",etiqueta: "entrega de 5-8 dias por fabricacion", opciones: ["Beige", "Gris", "Negro", "Azul"] },
        { nombre: "Cubrecama Queen", precio: 270, descripcion: "incluye fundas para almohada, variedad de diseños", imagen: "img/cobertor-cama.webp",etiqueta: "entrega de 5-8 dias por fabricacion", opciones: ["Diseño 1", "Diseño 2", "Diseño 3"] },
        { nombre: "Cubrecama King", precio: 280, descripcion: "incluye fundas para almohada, variedad de diseños", imagen: "img/cubre-king.webp",etiqueta: "entrega de 5-8 dias por fabricacion", opciones: ["Diseño 1", "Diseño 2"] },
        { nombre: "Frazada(poncho) de Terciopelo ", precio: 190, descripcion: "240x220cm facil de lavar, super suave y duradero, varios colores", imagen: "img/poncho.webp",etiqueta: "entrega de 5-8 dias por fabricacion", opciones: ["Gris", "Azul", "Café", "Vino"] },
        { nombre: "Cubrecama con Vuelo Queen ", precio: 270, descripcion: "incluye fundas para almohadas, variedad de diseños", imagen: "img/cubre-vuelo.webp",etiqueta: "entrega de 5-8 dias por fabricacion", opciones: ["Diseño 1", "Diseño 2"] },
        { nombre: "Cubrecama con Vuelo King ", precio: 275, descripcion: "incluye funda para almohada, variedad de diseños", imagen: "img/vuelo-king.webp",etiqueta: "entrega de 5-8 dias por fabricacion", opciones: ["Diseño 1", "Diseño 2"] },
        { nombre: "Toalla L ", precio: 75, descripcion: "76x147cm, 4 colores disponibles", imagen: "img/toalla.webp",etiqueta: "entrega de 5-8 dias por fabricacion", opciones: ["Celeste", "Blanco", "Beige", "Gris"] },
        { nombre: "Cojin enguantado 2und ", precio: 70, descripcion: "45x45cm 6 colores disponibles", imagen: "img/enguantada.webp",etiqueta: "entrega de 5-8 dias por fabricacion", opciones: ["Gris", "Beige", "Rojo", "Azul", "Negro", "Café"] },
        { nombre: "Almohada Blanca 2und", precio: 70, descripcion: "tamaño mediano de 74x48cm ", imagen: "img/almohada-blanca.webp", etiqueta: "entrega de 5-8 dias por fabricacion"}
    ],
    "GRAN BAZAR": [
        { nombre: "Bateria Portatil", precio: 130, descripcion: "18000 mha con doble salida para cargar dos celulares a la vez", imagen: "img/power-bank.webp" },
        { nombre: "Soporte para celular", precio: 60, descripcion: "impermeable, para moto y bicicleta", imagen: "img/porta-celular.webp" },
        { nombre: "Batidora de mano", precio: 99, descripcion: "4 aspas, 7 velocidades,completamente electrica", imagen: "img/batidora.webp" },
        { nombre: "Hervidora Electrica", precio: 110, descripcion: "capacidad de 2LT, material de acero grado alimenticio", imagen: "img/hervidora.webp" },
        { nombre: "Set utencilios 19pcs", precio: 149, descripcion: "kit completo con base y tabla para picar", imagen: "img/utenzilio.webp" },
        { nombre: "Licuadora portatil", precio: 65, descripcion: "bateria recargable, ideal para batidos y licuado de frutas blandas", opciones: ["verde","morado","celeste","rosado"], imagen: "img/licuadora.webp" },
        { nombre: "Traje impermeable", precio: 95, descripcion: "queda a personas de talla S,M,L,XL", imagen: "img/impermeable.webp" },
        { nombre: "Sombrilla de bolsillo", precio: 45, descripcion: "impermeable ligero, incluye asa para colgar y cubrepolvos, colores son surtidos", imagen: "img/sombrilla.webp" },
        { nombre: "Dispensador de agua", precio: 45, descripcion: "", imagen: "img/dispensador.webp" },
        { nombre: "Organizador europeo", precio: 125, descripcion: "60cm de alto, 20cm de ancho, 22cm de fondo, material pvc", imagen: "img/europeo.webp" },
        { nombre: "zapatera multiusos", precio: 115, descripcion: "tubos de metal, uniones de plastico, divisiones de tela", imagen: "img/zapatera.webp" },
        { nombre: "Banda terapeutica", precio: 205, descripcion: "brinda masajes termicos en hombros,codos,rodillas y piernas", imagen: "img/bandas.webp" },
        { nombre: "Bascula portatil", precio: 49, descripcion: "ideal para pesar maletas de viajes u otros", imagen: "img/pesa.webp" },
        { nombre: "Saran para sombra", precio: 105, descripcion: "3x4 metros. 80% sombra, incluye ojales para facilitar instalacion", imagen: "img/saran.webp" }
    ]
};

function guardarCarrito() {
    localStorage.setItem('dash_carrito_502', JSON.stringify(carrito));
}

function cargarCarritoGuardado() {
    const guardado = localStorage.getItem('dash_carrito_502');
    if (guardado) {
        try {
            carrito = JSON.parse(guardado);
            actualizarTotal();
        } catch (e) {
            carrito = [];
        }
    }
}

function cambiarVista(nuevaVista, push = true) {
    const panelPrincipal = document.getElementById('seccion-panel-principal');
    const seccionRestaurantes = document.getElementById('seccion-restaurantes');
    const seccionMenu = document.getElementById('seccion-menu');
    const modalCarrito = document.getElementById('modal-carrito');

    panelPrincipal.style.display = 'none';
    seccionRestaurantes.style.display = 'none';
    seccionMenu.style.display = 'none';

    if (nuevaVista === 'panel-inicio') {
        panelPrincipal.style.display = 'block';
        modalCarrito.style.display = 'none';
    } else if (nuevaVista === 'restaurantes') {
        seccionRestaurantes.style.display = 'block';
        modalCarrito.style.display = 'none';
    } else if (nuevaVista === 'menu') {
        seccionMenu.style.display = 'block';
        modalCarrito.style.display = 'none';
    } else if (nuevaVista === 'carrito') {
        if (vistaActual === 'menu') seccionMenu.style.display = 'block';
        else if (vistaActual === 'restaurantes') seccionRestaurantes.style.display = 'block';
        else panelPrincipal.style.display = 'block';

        modalCarrito.style.display = 'flex';
        verDetalleCarrito();
    }

    if (push && vistaActual !== nuevaVista) {
        history.pushState({ vista: nuevaVista }, '', `#${nuevaVista}`);
    }

    if (nuevaVista !== 'carrito') {
        vistaActual = nuevaVista;
    }
}

window.addEventListener('popstate', (e) => {
    if (e.state && e.state.vista) {
        cambiarVista(e.state.vista, false);
    } else {
        cambiarVista('panel-inicio', false);
    }
});

function irACategoria(cat) {
    categoriaActual = cat;
    document.getElementById('buscador-restaurante').value = '';
    const titulo = document.getElementById('titulo-categoria-activa');

    if (cat === 'restaurantes') titulo.textContent = "Restaurantes y Antojos";
    else if (cat === 'farmacia') titulo.textContent = "Farmacias y vitaminas";
    else if (cat === 'mercado') titulo.textContent = "Mercado";
    else if (cat === 'vehiculos') titulo.textContent = "Vehículos";
    else if (cat === 'hogar') titulo.textContent = "Prendas y Hogar";
    else titulo.textContent = "Otros Servicios";

    renderizarTiendas(negociosPorCategoria[cat] || []);
    cambiarVista('restaurantes');
}

function renderizarTiendas(tiendas) {
    const grid = document.getElementById('grid-restaurantes');
    grid.innerHTML = "";

    tiendas.forEach(tienda => {
        let badgeText = tienda.envioGratis ? '🚚 Envío Gratis' : '🚚 Envío con Costo';
        let badgeClass = tienda.envioGratis ? 'badge-gratis' : 'badge-costo';
        let badgePedidoHtml = tienda.bajoPedido ? `<span class="badge-pedido">📦 Bajo Pedido (7 días)</span>` : '';

        grid.innerHTML += `
            <div class="card-restaurante" onclick="abrirMenu('${tienda.nombre}')">
                <div class="badges-container">
                    <span class="badge-envio ${badgeClass}">${badgeText}</span>${badgePedidoHtml}
                </div>
                <img src="${tienda.img}" alt="${tienda.nombre}">
                <h3>${tienda.nombre}</h3>
            </div>
        `;
    });
}

function volverAPanelPrincipal() {
    document.getElementById('buscador-restaurante').value = '';
    document.getElementById("info-negocio-box").style.display = "none";
    cambiarVista('panel-inicio');
}

function volverANegocios() {
    document.getElementById("info-negocio-box").style.display = "none";
    cambiarVista('restaurantes');
}

function normalizarTexto(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

let temporizadorBusqueda = null;

function buscarRestaurante() {
    if (temporizadorBusqueda) {
        clearTimeout(temporizadorBusqueda);
    }

    const inputVal = document.getElementById('buscador-restaurante').value;
    const filtro = normalizarTexto(inputVal.trim());

    if (filtro === "") {
        if (vistaActual === 'resultados_busqueda' || vistaActual === 'restaurantes') {
            volverAPanelPrincipal();
        }
        return;
    }

    temporizadorBusqueda = setTimeout(() => {
        let productosEncontrados = [];

        for (let nombreRestaurante in menus) {
            const listaProductos = menus[nombreRestaurante];
            
            listaProductos.forEach((prod, index) => {
                let coincide = normalizarTexto(prod.nombre).includes(filtro) || 
                               (prod.descripcion && normalizarTexto(prod.descripcion).includes(filtro)) ||
                               normalizarTexto(nombreRestaurante).includes(filtro);

                if (coincide) {
                    productosEncontrados.push({
                        ...prod,
                        restaurante: nombreRestaurante,
                        originalIndex: index
                    });
                }
            });
        }

        categoriaActual = 'resultados_busqueda';
        document.getElementById('titulo-categoria-activa').textContent = `Resultados para: "${inputVal}"`;
        cambiarVista('restaurantes');

        renderizarProductosBuscados(productosEncontrados);
    }, 250);
}

function renderizarProductosBuscados(productos) {
    const grid = document.getElementById('grid-restaurantes');
    grid.innerHTML = "";

    if (productos.length === 0) {
        grid.innerHTML = `<p style="text-align:center; grid-column: 1/-1; padding: 30px; color: #666;">No encontramos ningún producto con "${document.getElementById('buscador-restaurante').value}". ¡Prueba con otra palabra!</p>`;
        return;
    }

    productos.forEach((prod) => {
        const descHtml = prod.descripcion ? `<div class="producto-desc">${prod.descripcion}</div>` : '';
        const etiquetaProdHtml = prod.etiqueta ? `<span class="badge-pedido" style="margin-bottom: 4px; display: inline-block;">${prod.etiqueta}</span><br>` : '';
        
        let opcionesHtml = '';
        if (prod.opciones && prod.opciones.length > 0) {
            opcionesHtml = `
                <div style="margin: 6px 0;">
                    <label style="font-size: 11px; font-weight: bold; color: #555;">Elige opción:</label>
                    <select id="opcion-busqueda-${prod.restaurante}-${prod.nombre}" style="width: 100%; padding: 4px; border-radius: 4px; border: 1px solid #ccc; font-size: 12px;">
                        ${prod.opciones.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                    </select>
                </div>
            `;
        }

        grid.innerHTML += `
            <div class="producto-card" style="background: white; border-radius: 8px; padding: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="font-size: 11px; font-weight: bold; color: #FF6600; margin-bottom: 4px; text-transform: uppercase;">🏪 ${prod.restaurante}</div>
                    <div class="producto-detalle" style="display: flex; gap: 10px;">
                        <img src="${prod.imagen || 'img/placeholder.webp'}" alt="${prod.nombre}" class="producto-img" style="width: 70px; height: 70px; object-fit: cover; border-radius: 6px;">
                        <div class="producto-info" style="flex: 1;">
                            ${etiquetaProdHtml}
                            <h4 style="font-size: 14px; margin: 0 0 4px 0;">${prod.nombre}</h4>
                            ${descHtml}${opcionesHtml}
                            <p style="font-weight: bold; color: #333; margin: 6px 0 0 0;">Q${prod.precio}.00</p>
                        </div>
                    </div>
                </div>
                <button class="btn-agregar" onclick="agregarDesdeBusqueda('${prod.restaurante}', '${prod.nombre}', ${prod.precio})" style="margin-top: 10px; width: 100%; background: #FF6600; color: white; border: none; padding: 8px; border-radius: 4px; font-weight: bold; cursor: pointer;">+ Agregar al Carrito</button>
            </div>
        `;
    });
}

function agregarDesdeBusqueda(nombreRestaurante, nombreProd, precio) {
    restauranteActual = nombreRestaurante;
    
    let seleccionExtra = "";
    const selectElement = document.getElementById(`opcion-busqueda-${nombreRestaurante}-${nombreProd}`);
    if (selectElement) {
        seleccionExtra = selectElement.value;
    }

    let nombreFinal = nombreProd;
    if (seleccionExtra) {
        nombreFinal = `${nombreProd} (${seleccionExtra})`;
    }

    agregarAlCarritoDirecto(nombreFinal, precio);
}

function obtenerSubcategoria(prod) {
    // 🟢 ESTO ES LO QUE FALTABA: Leer la subcategoría manual primero
    if (prod.subcat) return prod.subcat;

    const nombre = normalizarTexto(prod.nombre);
    const desc = prod.descripcion ? normalizarTexto(prod.descripcion) : "";
    const texto = nombre + " " + desc;

    const palabrasBebida = ["gaseosa", "lata", "agua", "refresco", "fresco", "licuado", "colada", "cafe", "michelada", "pepsi", "coca", "jugo", "te", "bebida", "ting", "sprite", "fanta", "salvavidas", "cerveza"];
    const palabrasComplemento = ["papa", "papas", "ensalada", "porcion", "longaniza", "mushque", "chicharron", "extra", "pastelito", "canelitas"];

    if (palabrasBebida.some(p => texto.includes(p))) return "bebidas";
    if (palabrasComplemento.some(p => texto.includes(p))) return "complementos";
    return "menus";
}

function cambiarSubcategoria(subcat) {
    subcategoriaActiva = subcat;
    renderizarMenuConSubcategorias(restauranteActual);
}

function abrirMenu(nombreRestaurante) {
    restauranteActual = nombreRestaurante;
    document.getElementById('titulo-restaurante').textContent = nombreRestaurante;
    subcategoriaActiva = 'menus';

    const infoBox = document.getElementById("info-negocio-box");
    const datosNegocio = infoRestaurantes[nombreRestaurante];

    if (infoBox) {
        if (datosNegocio && datosNegocio.mensajeInfo) {
            infoBox.innerHTML = datosNegocio.mensajeInfo;
            infoBox.style.display = "block";
        } else {
            infoBox.style.display = "none";
        }
    }

    let imgNegocioUrl = "";
    for (let cat in negociosPorCategoria) {
        const tiendaEncontrada = negociosPorCategoria[cat].find(t => t.nombre === nombreRestaurante);
        if (tiendaEncontrada) {
            imgNegocioUrl = tiendaEncontrada.img;
            break;
        }
    }

    const imgBannerElement = document.getElementById('img-banner-negocio');
    if (imgBannerElement) {
        if (imgNegocioUrl) {
            imgBannerElement.src = imgNegocioUrl;
            imgBannerElement.style.display = "block";
        } else {
            imgBannerElement.style.display = "none";
        }
    }

    renderizarMenuConSubcategorias(nombreRestaurante);
    cambiarVista('menu');
}

function renderizarMenuConSubcategorias(nombreRestaurante) {
    let tabsContainer = document.getElementById('subcategorias-container');
    if (!tabsContainer) {
        tabsContainer = document.createElement('div');
        tabsContainer.id = 'subcategorias-container';
        const listaProd = document.getElementById('lista-productos');
        listaProd.parentNode.insertBefore(tabsContainer, listaProd);
    }

    const productos = menus[nombreRestaurante] || [];

    // Verificar si el negocio actual pertenece a la categoría "restaurantes"
    const esRestaurante = negociosPorCategoria["restaurantes"] && 
                          negociosPorCategoria["restaurantes"].some(t => t.nombre === nombreRestaurante);

    if (esRestaurante) {
        // Solo mostrar pestañas si es un restaurante
        tabsContainer.style.display = "block";
        tabsContainer.innerHTML = `
            <div class="subcategorias-tabs">
                <button class="tab-subcat ${subcategoriaActiva === 'menus' ? 'active' : ''}" onclick="cambiarSubcategoria('menus')">🍽️ Menús</button>
                <button class="tab-subcat ${subcategoriaActiva === 'bebidas' ? 'active' : ''}" onclick="cambiarSubcategoria('bebidas')">🥤 Bebidas</button>
                <button class="tab-subcat ${subcategoriaActiva === 'complementos' ? 'active' : ''}" onclick="cambiarSubcategoria('complementos')">🍟 Complementos</button>
            </div>
        `;
    } else {
        // En farmacias, motos, hogar, etc., ocultamos las pestañas
        tabsContainer.style.display = "none";
        tabsContainer.innerHTML = "";
    }

    // Si es restaurante, filtramos por pestaña; si es otro negocio, mostramos todos los productos directamente
    const productosFiltrados = esRestaurante 
        ? productos.filter(prod => obtenerSubcategoria(prod) === subcategoriaActiva)
        : productos;

    const contenedor = document.getElementById('lista-productos');
    contenedor.innerHTML = "";

    if (productosFiltrados.length === 0) {
        contenedor.innerHTML = `<p style="text-align:center; grid-column: 1/-1; padding: 30px; color: #666;">No hay elementos en esta sección.</p>`;
        return;
    }

    productosFiltrados.forEach((prod) => {
        const indexReal = productos.findIndex(p => p.nombre === prod.nombre && p.precio === prod.precio);

        const descHtml = prod.descripcion ? `<div class="producto-desc">${prod.descripcion}</div>` : '';
        const etiquetaProdHtml = prod.etiqueta ? `<span class="badge-pedido" style="margin-bottom: 4px; display: inline-block;">${prod.etiqueta}</span><br>` : '';
        
        let opcionesHtml = '';
        if (prod.opciones && prod.opciones.length > 0) {
            opcionesHtml = `
                <div style="margin: 6px 0;">
                    <label style="font-size: 10px; font-weight: bold; color: #555;">Elige opción:</label>
                    <select id="opcion-${indexReal}" style="width: 100%; padding: 4px; border-radius: 4px; border: 1px solid #ccc; font-size: 11px;">
                        ${prod.opciones.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                    </select>
                </div>
            `;
        }

        contenedor.innerHTML += `
            <div class="producto-card">
                <div>
                    ${etiquetaProdHtml}
                    <img src="${prod.imagen || 'img/placeholder.webp'}" alt="${prod.nombre}" class="producto-img">
                    <div class="producto-info">
                        <h4>${prod.nombre}</h4>
                        ${descHtml}${opcionesHtml}
                    </div>
                </div>
                <div class="producto-footer">
                    <p>Q${prod.precio}.00</p>
                    <button class="btn-agregar" onclick="agregarConOpcion('${prod.nombre}', ${prod.precio}, ${indexReal})">+</button>
                </div>
            </div>
        `;
    });
}

function agregarConOpcion(nombre, precio, indexProd) {
    let seleccionExtra = "";
    const selectElement = document.getElementById(`opcion-${indexProd}`);
    
    if (selectElement) {
        seleccionExtra = selectElement.value;
    }

    let nombreFinal = nombre;
    if (seleccionExtra) {
        nombreFinal = `${nombre} (${seleccionExtra})`;
    }

    agregarAlCarritoDirecto(nombreFinal, precio);
}

function agregarAlCarritoDirecto(nombre, precio) {
    if (carrito.length > 0 && carrito[0].restaurante !== restauranteActual) {
        const cambiar = confirm(`Tu carrito contiene productos de "${carrito[0].restaurante}". ¿Deseas vaciar el carrito para agregar productos de "${restauranteActual}"?`);
        if (cambiar) {
            carrito = [];
        } else {
            return;
        }
    }

    const itemExistente = carrito.find(item => item.nombre === nombre && item.restaurante === restauranteActual);
    
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({ nombre, precio, restaurante: restauranteActual, cantidad: 1 });
    }
    
    guardarCarrito();
    actualizarTotal();
}

function cambiarCantidad(index, cambio) {
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    }
    guardarCarrito();
    actualizarTotal();
    verDetalleCarrito();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarCarrito();
    actualizarTotal();
    verDetalleCarrito();
}

function actualizarTotal() {
    let total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    let cantidadTotal = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    document.getElementById('total-txt').innerText = `Q${total}.00`;
    document.getElementById('cant-txt').innerText = cantidadTotal;
}

function abrirModalCarrito() {
    cambiarVista('carrito');
}

function cerrarModalCarrito() {
    cambiarVista(vistaActual, false);
}

function verDetalleCarrito() {
    const contenedorLista = document.getElementById('carrito-lista');
    const seccionDatos = document.getElementById('seccion-datos');
    const boxEnvio = document.getElementById('info-envio-box');

    if (carrito.length === 0) {
        contenedorLista.innerHTML = '<p style="text-align:center; padding:20px; color:#777;">El carrito está vacío</p>';
        seccionDatos.style.display = 'none';
        boxEnvio.style.display = 'none';
        return;
    }

    let html = "";
    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        html += `
            <div class="cart-item">
                <div>
                    <strong>${item.nombre}</strong><br>
                    <small style="color:#666;">${item.restaurante} - Q${subtotal}.00</small>
                </div>
                <div class="cant-controles">
                    <button class="btn-cant" onclick="cambiarCantidad(${index}, -1)">-</button>
                    <span style="font-weight:bold; padding: 0 4px;">${item.cantidad}</span>
                    <button class="btn-cant" onclick="cambiarCantidad(${index}, 1)">+</button>
                    <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">🗑</button>
                </div>
            </div>
        `;
    });

    contenedorLista.innerHTML = html;
    seccionDatos.style.display = 'block';

    const restNombre = carrito[0].restaurante;
    const esGratis = infoRestaurantes[restNombre] ? infoRestaurantes[restNombre].envioGratis : false;

    if (esGratis) {
        boxEnvio.innerHTML = `<strong>Cobertura:</strong> Envíos a casco urbano y aldeas. El mínimo de consumo varía según distancia.`;
        boxEnvio.style.display = 'block';
    } else {
        boxEnvio.innerHTML = `Su pedido aplica tarifa de envío adicional, (se coordina por WhatsApp según dirección)`;
        boxEnvio.style.display = 'block';
    }
}

async function enviarAWhatsApp() {
    const nombreInput = document.getElementById('cliente-nombre');
    const direccionInput = document.getElementById('cliente-direccion');
    const referenciaInput = document.getElementById('cliente-referencia');

    const nombre = nombreInput.value.trim();
    const direccion = direccionInput.value.trim();
    const referencia = referenciaInput.value.trim();
    const formaPagoSelect = document.getElementById('forma-pago');
    const formaPago = formaPagoSelect ? formaPagoSelect.value : "Efectivo contra entrega";

    let hayError = false;

    if (!nombre) {
        nombreInput.classList.add('campo-error');
        hayError = true;
    } else {
        nombreInput.classList.remove('campo-error');
    }

    if (!direccion) {
        direccionInput.classList.add('campo-error');
        hayError = true;
    } else {
        direccionInput.classList.remove('campo-error');
    }

    if (hayError) {
        alert("Por favor completa los campos obligatorios (Nombre y Dirección).");
        return;
    }

    const restNombre = carrito[0].restaurante;
    let total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    try {
        const pedidosRef = ref(db, 'pedidos');
        await push(pedidosRef, {
            restaurante: restNombre,
            clienteNombre: nombre,
            clienteDireccion: direccion,
            clienteReferencia: referencia || "Sin referencia",
            productos: carrito,
            subtotal: total,
            fechaPedido: new Date().toISOString(),
            estado: "Pendiente"
        });
        console.log("Pedido guardado en Realtime Database con éxito");
    } catch (error) {
        console.error("Error al guardar en la base de datos: ", error);
    }

    let subtotal = typeof total !== 'undefined' ? total : carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    let descuento = typeof descuentoAplicado !== 'undefined' ? descuentoAplicado : 0;
    let totalFinal = subtotal - descuento;

    let mensaje = `*¡Nuevo Pedido en Dash Delivery 502!* \n\n`;
    mensaje += ` *Negocio:* ${restNombre}\n`;
    mensaje += ` *Cliente:* ${nombre}\n`;
    mensaje += ` *Dirección:* ${direccion}\n`;
    if (referencia) {    
        mensaje += ` *Referencia:* ${referencia}\n`;
    }
    mensaje += ` 💳 *Forma de Pago:* ${formaPago}\n`;
    mensaje += `\n*Detalle del Pedido:*\n`;

    carrito.forEach(item => {
        mensaje += `• ${item.cantidad}x ${item.nombre} (Q${(item.precio * item.cantidad).toFixed(2)})\n`;
    });

    mensaje += `\n *Subtotal Productos:* Q${subtotal}.00\n`;
    
    if (descuento > 0) {
        mensaje += ` *Descuento (Cupón):* -Q${descuento}.00\n`;
        mensaje += ` *Total Final con Descuento:* Q${totalFinal}.00\n`;
    }

    const esGratis = infoRestaurantes[restNombre] ? infoRestaurantes[restNombre].envioGratis : false;
    mensaje += esGratis ? ` *Envío:* GRATIS\n` : ` *Envío:* Pendiente de calcular según ubicación\n`;

    mensaje += `\n¡Quedo a la espera!`;
    
    carrito = [];
    localStorage.removeItem('dash_carrito_502');
    actualizarTotal();

    const urlWhatsApp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
}

window.irACategoria = irACategoria;
window.volverAPanelPrincipal = volverAPanelPrincipal;
window.volverANegocios = volverANegocios;
window.buscarRestaurante = buscarRestaurante;
window.abrirMenu = abrirMenu;
window.agregarConOpcion = agregarConOpcion;
window.agregarDesdeBusqueda = agregarDesdeBusqueda;
window.cambiarCantidad = cambiarCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;
window.abrirModalCarrito = abrirModalCarrito;
window.cerrarModalCarrito = cerrarModalCarrito;
window.enviarAWhatsApp = enviarAWhatsApp;
window.cambiarSubcategoria = cambiarSubcategoria;

window.addEventListener('DOMContentLoaded', () => {
    history.replaceState({ vista: 'panel-inicio' }, '', '#inicio');
    cargarCarritoGuardado();
});

let descuentoAplicado = 0;

async function aplicarCuponDescuento(codigoIngresado, subtotalCarrito, restauranteActual) {
    const user = auth.currentUser;

    if (!user) {
        alert("Iniciando sesión de invitado, por favor intenta de nuevo en unos segundos.");
        return 0;
    }

    const codigoLimpio = codigoIngresado.trim().toUpperCase();
    const snapshotCupon = await get(ref(db, `cupones/${codigoLimpio}`));
    
    if (!snapshotCupon.exists()) {
        alert("El código ingresado no es válido o no existe.");
        return 0;
    }

    const cupon = snapshotCupon.val();

    if (!cupon.activo) {
        alert("Este cupón ya no está activo.");
        return 0;
    }

    if (cupon.restaurante.trim().toUpperCase() !== restauranteActual.trim().toUpperCase()) {
        alert(`Este cupón solo es válido para pedidos en ${cupon.restaurante}.`);
        return 0;
    }

    const hoy = new Date();
    const fechaLimite = new Date(cupon.fechaExpiracion + "T23:59:59");
    if (hoy > fechaLimite) {
        alert("Este cupón de bienvenida ya ha expirado.");
        return 0;
    }

    if (subtotalCarrito < cupon.minimoCompra) {
        alert(`El consumo mínimo para aplicar este cupón es de Q${cupon.minimoCompra}.00`);
        return 0;
    }

    const snapshotUser = await get(ref(db, `usuarios/${user.uid}`));
    if (snapshotUser.exists() && snapshotUser.val().primerPedidoRealizado) {
        alert("Este cupón solo puede ser utilizado en tu primer pedido.");
        return 0;
    }

    alert("¡Cupón aplicado exitosamente! Se descontaron Q5.00 de tu total.");
    return cupon.descuento;
}

async function manejarAplicarCupon() {
    const inputCodigo = document.getElementById("input-cupon").value;
    let subtotalActual = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    let restauranteActual = carrito.length > 0 ? carrito[0].restaurante : ""; 

    const descuento = await aplicarCuponDescuento(inputCodigo, subtotalActual, restauranteActual);

    if (descuento > 0) {
        descuentoAplicado = descuento;
        
        document.getElementById("input-cupon").disabled = true;
        const btnAplicar = document.getElementById("btn-aplicar-cupon");
        btnAplicar.disabled = true;
        btnAplicar.innerText = "Aplicado ✓";
        btnAplicar.style.backgroundColor = "#28a745";
        btnAplicar.style.color = "#fff";

        let totalFinal = subtotalActual - descuentoAplicado;
        const cajaResumen = document.getElementById("resumen-cupon-box");
        if (cajaResumen) {
            cajaResumen.innerHTML = `Subtotal: Q${subtotalActual}.00 <br>Descuento: -Q${descuentoAplicado}.00 <br><span style="color: #28a745;">Total Final: Q${totalFinal}.00</span>`;
        }
    }
}

window.manejarAplicarCupon = manejarAplicarCupon;

document.addEventListener("DOMContentLoaded", () => {
    const btnCupon = document.getElementById("btn-aplicar-cupon");
    if (btnCupon) {
        btnCupon.addEventListener("click", manejarAplicarCupon);
    }
});