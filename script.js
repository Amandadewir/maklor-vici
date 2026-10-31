
/* ==================================
   MAKLOR VICI! — SCRIPT.JS
================================== */
console.log("SCRIPT BARU BERHASIL DIMUAT");

const PRODUCTS = [
  {
    id: "ori",
    name: "Maklor Ori",
    image: "assets/maklor-ori.jpg",
    sizes: { Small: 7000, Medium: 9000, Large: 12000 },
    category: "all",
  },
  {
    id: "nori",
    name: "Maklor Nori",
    image: "assets/maklor-nori.jpg",
    sizes: { Small: 9000, Medium: 11000, Large: 14000 },
    category: "best-seller"
  },
  {
    id: "sosis",
    name: "Maklor Sosis",
    image: "assets/maklor-sosis.jpg",
    sizes: { Small: 9000, Medium: 11000, Large: 14000 },
    category: "all"
  },
  {
    id: "mentai",
    name: "Maklor Mentai",
    image: "assets/maklor-mentai.jpg",
    sizes: { Regular: 16000 },
    category: "best-seller"
  }
];

const FLAVORS = [
  "Original",
  "Balado",
  "Pedas",
  "BBQ",
  "Keju",
  "Nori"
];

const ADD_ONS = [
  { id: "extra-sosis", name: "Extra Sosis", price: 2000 },
  { id: "extra-nori", name: "Extra Nori", price: 2000 }
];

const WHATSAPP_NUMBER = "6285257936686";
const cart = new Map();

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}

function getProduct(productId) {
  return PRODUCTS.find(product => product.id === productId);
}

function getAddOnTotal(addons = []) {
  return addons.reduce((total, addonId) => {
    const addon = ADD_ONS.find(item => item.id === addonId);
    return total + (addon ? addon.price : 0);
  }, 0);
}


function getItemTotal(item) {
  if (item.addonProduct) {
    const addon = ADD_ONS.find(value => value.id === item.addonId);
    return (addon ? addon.price : 0) * item.qty;
  }

  const product = getProduct(item.productId);
  if (!product) return 0;

  const basePrice = product.sizes[item.size] || 0;
  const addonPrice = getAddOnTotal(item.addons);

  return (basePrice + addonPrice) * item.qty;
}


function getCartTotal() {
  return [...cart.values()].reduce((total, item) => {
    return total + getItemTotal(item);
  }, 0);
}

function getCartCount() {
  let count = 0;

  cart.forEach(item => {
    count += item.qty;
  });

  return count;
}

/* ==================================
   TAMBAH PRODUK
================================== */

function addToCart(productId) {
  const product = getProduct(productId);
  if (!product) return;

  const defaultSize = productId === "mentai" ? "Regular" : "Medium";
  const itemId = `${productId}-${defaultSize}`;

  if (cart.has(itemId)) {
    cart.get(itemId).qty += 1;
  } else {
    cart.set(itemId, {
      id: itemId,
      productId,
      size: defaultSize,
      qty: 1,
      flavors: [],
      addons: []
    });
  }

  renderCart();
}

/* ==================================
   UBAH PRODUK DALAM KERANJANG
================================== */

function changeSize(itemId, newSize) {
  const item = cart.get(itemId);
  if (!item || item.productId === "mentai") return;

  const product = getProduct(item.productId);
  if (!product || !(newSize in product.sizes)) return;

  const oldQty = item.qty;
  cart.delete(itemId);

  const newItemId = `${item.productId}-${newSize}`;

  if (cart.has(newItemId)) {
    const existingItem = cart.get(newItemId);
    existingItem.qty += oldQty;

    item.flavors.forEach(flavor => {
      if (!existingItem.flavors.includes(flavor)) {
        existingItem.flavors.push(flavor);
      }
    });

    item.addons.forEach(addon => {
      if (!existingItem.addons.includes(addon)) {
        existingItem.addons.push(addon);
      }
    });
  } else {
    item.id = newItemId;
    item.size = newSize;
    cart.set(newItemId, item);
  }

  renderCart();
}

function changeQty(itemId, change) {
  const item = cart.get(itemId);
  if (!item) return;

  item.qty += change;

  if (item.qty <= 0) {
    cart.delete(itemId);
  }

  renderCart();
}

function removeFromCart(itemId) {
  cart.delete(itemId);
  renderCart();
}

function toggleFlavor(itemId, flavor, checked) {
  const item = cart.get(itemId);
  if (!item) return;

  if (checked && !item.flavors.includes(flavor)) {
    item.flavors.push(flavor);
  } else if (!checked) {
    item.flavors = item.flavors.filter(value => value !== flavor);
  }

  renderCart();
}

function toggleAddon(itemId, addonId, checked) {
  const item = cart.get(itemId);
  if (!item) return;

  if (checked && !item.addons.includes(addonId)) {
    item.addons.push(addonId);
  } else if (!checked) {
    item.addons = item.addons.filter(value => value !== addonId);
  }

  renderCart();
}

/* ==================================
   TAMPILKAN MENU
================================== */

function renderProducts(filter = "all") {
  const menuGrid = document.getElementById("menu-grid");
  if (!menuGrid) return;

  let filteredProducts = PRODUCTS;

  if (filter === "best-seller") {
    filteredProducts = PRODUCTS.filter(
      product => product.category === "best-seller"
    );
  }

  if (filter === "add-on") {
    menuGrid.innerHTML = ADD_ONS.map(addon => `
      <article class="menu-card">
        <div class="menu-photo">
          <img
            src="assets/${addon.id}.jpg"
            alt="${addon.name}"
            loading="lazy"
            onerror="this.style.display='none'"
          >
        </div>

        <h3>${addon.name}</h3>
        <p class="menu-description">Tambahan untuk menu favoritmu.</p>

        <div class="menu-bottom">
          <span class="price">${formatRupiah(addon.price)}</span>
          <button
            class="add-button"
            type="button"
            onclick="addAddonToCart('${addon.id}')"
            aria-label="Tambah ${addon.name}"
          >+</button>
        </div>
      </article>
    `).join("");

    return;
  }

  menuGrid.innerHTML = filteredProducts.map(product => {
    const prices = Object.values(product.sizes);
    const lowestPrice = Math.min(...prices);

    return `
      <article class="menu-card">
        <div class="menu-photo">
          <img
            src="${product.image}"
            alt="${product.name}"
            loading="lazy"
            onerror="this.style.display='none'"
          >
          ${
            product.category === "best-seller"
              ? '<span class="menu-tag">Best Seller ♡</span>'
              : ""
          }
        </div>

        <h3>${product.name}</h3>
        <p class="menu-description">
          ${product.id === "mentai"
            ? "Creamy mentai dengan rasa gurih."
            : "Macaroni gurih dengan pilihan ukuran."}
        </p>

        <div class="menu-bottom">
          <span class="price">Mulai ${formatRupiah(lowestPrice)}</span>
          <button
            class="add-button"
            type="button"
            onclick="addToCart('${product.id}')"
            aria-label="Tambah ${product.name} ke keranjang"
          >+</button>
        </div>
      </article>
    `;
  }).join("");
}

/* Tambah add-on sebagai item keranjang */

function addAddonToCart(addonId) {
  const addon = ADD_ONS.find(item => item.id === addonId);
  if (!addon) return;

  const itemId = `addon-${addon.id}`;

  if (cart.has(itemId)) {
    cart.get(itemId).qty += 1;
  } else {
    cart.set(itemId, {
      id: itemId,
      productId: itemId,
      addonProduct: true,
      addonId: addon.id,
      size: "Regular",
      qty: 1,
      flavors: [],
      addons: []
    });
  }

  renderCart();
}

/* ==================================
   TAMPILKAN KERANJANG
================================== */

function renderCart() {
  const cartContainer = document.getElementById("cart-items");
  const cartCountElement = document.getElementById("cart-count");
  const subtotalElement = document.getElementById("subtotal");
  const emptyCartElement = document.getElementById("empty-cart");
  const cartSummaryElement = document.getElementById("cart-summary");

  if (!cartContainer) return;

  const isEmpty = cart.size === 0;

  if (emptyCartElement) emptyCartElement.hidden = !isEmpty;
  if (cartSummaryElement) cartSummaryElement.hidden = isEmpty;
  cartContainer.hidden = isEmpty;

  if (isEmpty) {
    cartContainer.innerHTML = "";
  } else {
    cartContainer.innerHTML = [...cart.values()].map(item => {
      const isAddonProduct = item.addonProduct === true;
      const product = isAddonProduct ? null : getProduct(item.productId);
      const addonProduct = isAddonProduct
        ? ADD_ONS.find(addon => addon.id === item.addonId)
        : null;

      const productName = isAddonProduct
        ? addonProduct?.name
        : product?.name;

      if (!productName) return "";

      const itemTotal = isAddonProduct
        ? (addonProduct?.price || 0) * item.qty
        : getItemTotal(item);

      return `
        <article class="cart-item" data-id="${item.id}">
          <div class="cart-item-header">
            <h3>${productName}</h3>
            <button
              type="button"
              class="remove-item-btn"
              onclick="removeFromCart('${item.id}')"
              aria-label="Hapus ${productName}"
            >✕</button>
          </div>

          ${
            isAddonProduct
              ? '<p class="option-title">Add-on</p>'
              : `
                <div class="cart-option-group">
                  <label for="size-${item.id}">Ukuran</label>
                  <select
                    id="size-${item.id}"
                    onchange="changeSize('${item.id}', this.value)"
                    ${item.productId === "mentai" ? "disabled" : ""}
                  >
                    ${Object.entries(product.sizes).map(([size, price]) => `
                      <option value="${size}" ${item.size === size ? "selected" : ""}>
                        ${size} — ${formatRupiah(price)}
                      </option>
                    `).join("")}
                  </select>
                </div>

                <div class="cart-option-group">
                  <p class="option-title">Pilih Rasa</p>
                  <div class="flavor-options">
                    ${FLAVORS.map(flavor => `
                      <label class="option-label">
                        <input
                          type="checkbox"
                          ${item.flavors.includes(flavor) ? "checked" : ""}
                          onchange="toggleFlavor('${item.id}', '${flavor}', this.checked)"
                        >
                        <span>${flavor}</span>
                      </label>
                    `).join("")}
                  </div>
                  <small>Boleh pilih lebih dari satu rasa.</small>
                </div>

                <div class="cart-option-group">
                  <p class="option-title">Add-on</p>
                  <div class="addon-options">
                    ${ADD_ONS.map(addon => `
                      <label class="option-label">
                        <input
                          type="checkbox"
                          ${item.addons.includes(addon.id) ? "checked" : ""}
                          onchange="toggleAddon('${item.id}', '${addon.id}', this.checked)"
                        >
                        <span>${addon.name} (+${formatRupiah(addon.price)})</span>
                      </label>
                    `).join("")}
                  </div>
                </div>
              `
          }

          <div class="cart-item-footer">
            <div class="quantity-control">
              <button
                type="button"
                onclick="changeQty('${item.id}', -1)"
                aria-label="Kurangi jumlah"
              >−</button>

              <span>${item.qty}</span>

              <button
                type="button"
                onclick="changeQty('${item.id}', 1)"
                aria-label="Tambah jumlah"
              >+</button>
            </div>

            <div class="item-price">
              <strong>${formatRupiah(itemTotal)}</strong>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  if (cartCountElement) {
    cartCountElement.textContent = getCartCount();
  }

  if (subtotalElement) {
    subtotalElement.textContent = formatRupiah(getCartTotal());
  }

  document.querySelectorAll("[data-cart-count]").forEach(element => {
    element.textContent = getCartCount();
  });
}

/* ==================================
   CHECKOUT WHATSAPP
================================== */

function checkoutWhatsApp() {
  if (cart.size === 0) {
    alert("Keranjang kamu masih kosong!");
    return;
  }

  const nameInput = document.getElementById("customer-name");
  const orderType = document.getElementById("order-type");
  const noteInput = document.getElementById("customer-note");

  const customerName = nameInput?.value.trim() || "";
  const orderMethod = orderType?.value || "Pickup";
  const customerNote = noteInput?.value.trim() || "";

  if (!customerName) {
    alert("Isi nama kamu terlebih dahulu ya!");
    nameInput?.focus();
    return;
  }

  let message = "Halo, Maklor Vici! 🍝\n";
  message += "Aku mau pesan ya!\n\n";
  message += "*DETAIL PESANAN*\n";

  let number = 1;

  cart.forEach(item => {
    const isAddonProduct = item.addonProduct === true;
    const product = isAddonProduct ? null : getProduct(item.productId);
    const addonProduct = isAddonProduct
      ? ADD_ONS.find(addon => addon.id === item.addonId)
      : null;

    const productName = isAddonProduct
      ? addonProduct?.name
      : product?.name;

    if (!productName) return;

    const itemTotal = isAddonProduct
      ? (addonProduct?.price || 0) * item.qty
      : getItemTotal(item);

    message += `\n${number}. ${productName}\n`;

    if (!isAddonProduct) {
      message += `Ukuran: ${item.size}\n`;
      message += `Rasa: ${item.flavors.length ? item.flavors.join(", ") : "Belum dipilih"}\n`;

      const addonNames = item.addons.map(addonId => {
        return ADD_ONS.find(addon => addon.id === addonId)?.name;
      }).filter(Boolean);

      message += `Add-on: ${addonNames.length ? addonNames.join(", ") : "Tidak ada"}\n`;
    }

    message += `Jumlah: ${item.qty}\n`;
    message += `Subtotal: ${formatRupiah(itemTotal)}\n`;

    number++;
  });

  message += `\n*TOTAL: ${formatRupiah(getCartTotal())}*\n`;
  message += `Nama: ${customerName}\n`;
  message += `Metode pesanan: ${orderMethod}\n`;

  if (customerNote) {
    message += `Catatan: ${customerNote}\n`;
  }

  message += "\nTerima kasih! 💗";

  const whatsappURL =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  window.open(whatsappURL, "_blank", "noopener,noreferrer");
}


/* ==================================
   INISIALISASI KERANJANG
================================== */

function initWebsite() {
  renderProducts();
  renderCart();

  const openCartButton = document.getElementById("open-cart");
  const closeCartButton = document.getElementById("close-cart");
  const cartDrawer = document.getElementById("cart-drawer");
  const cartBackdrop = document.getElementById("cart-backdrop");

  // Pastikan semua elemen keranjang ditemukan
  if (!openCartButton || !closeCartButton || !cartDrawer || !cartBackdrop) {
    console.error("Elemen keranjang tidak ditemukan. Periksa ID HTML.");
    return;
  }

  // BUKA KERANJANG
  function openCart() {
    cartDrawer.classList.add("open");
    cartBackdrop.classList.add("show");

    cartDrawer.setAttribute("aria-hidden", "false");
    cartBackdrop.setAttribute("aria-hidden", "false");
    openCartButton.setAttribute("aria-expanded", "true");

    document.body.classList.add("cart-open");
  }

  // TUTUP KERANJANG
  function closeCart() {
    cartDrawer.classList.remove("open");
    cartBackdrop.classList.remove("show");

    cartDrawer.setAttribute("aria-hidden", "true");
    cartBackdrop.setAttribute("aria-hidden", "true");
    openCartButton.setAttribute("aria-expanded", "false");

    document.body.classList.remove("cart-open");
  }

  // Event tombol My Cart
  openCartButton.addEventListener("click", openCart);

  // Event tombol X
  closeCartButton.addEventListener("click", closeCart);

  // Klik area luar popup
  cartBackdrop.addEventListener("click", closeCart);

  // Tutup menggunakan Escape
  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && cartDrawer.classList.contains("open")) {
      closeCart();
    }
  });

  // Tombol Explore Menu
  document.getElementById("browse-menu")?.addEventListener("click", function() {
    closeCart();

    document.getElementById("menu")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  // Checkout WhatsApp
  document.getElementById("checkout-form")?.addEventListener("submit", function(event) {
    event.preventDefault();
    checkoutWhatsApp();
  });

  // Filter menu
  document.querySelectorAll(".filter-chip").forEach(button => {
    button.addEventListener("click", function() {
      document.querySelectorAll(".filter-chip").forEach(chip => {
        chip.classList.remove("active");
      });

      button.classList.add("active");
      renderProducts(button.dataset.filter || "all");
    });
  });

  // Tahun otomatis
  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  console.log("Maklor Vici berhasil diinisialisasi!");
}

// Jalankan setelah HTML siap
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWebsite);
} else {
  initWebsite();
}
