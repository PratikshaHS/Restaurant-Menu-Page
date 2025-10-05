document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const menuItems = document.querySelectorAll('.menu-item');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const dietaryButtons = document.querySelectorAll('.dietary-btn');
    const menuGrids = document.querySelectorAll('.menu-grid');
    const menuSections = document.querySelectorAll('.menu-category');
    const orderSidebar = document.getElementById('orderSidebar');
    const orderItemsList = document.getElementById('orderItems');
    const orderTotal = document.getElementById('orderTotal');
    const orderButton = document.querySelector('.order-button');
    const closeOrderBtn = document.querySelector('.close-order');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const clearOrderBtn = document.getElementById('clearOrderBtn');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const searchToggle = document.querySelector('.search-toggle');
    const searchBox = document.querySelector('.search-box');
    const backToTopBtn = document.getElementById('backToTop');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const modal = document.getElementById('itemModal');
    const modalContent = document.querySelector('.modal-content');
    const closeModal = document.querySelector('.close-modal');

    // State
    let order = [];
    let activeFilters = {
        category: 'all',
        dietary: []
    };

    // Initialize the application
    function init() {
        setupEventListeners();
        showLoading(true);
        // Simulate loading data
        setTimeout(() => {
            showLoading(false);
            animateMenuItems();
        }, 1000);
    }

    // Setup all event listeners
    function setupEventListeners() {
        // Search functionality - only if search elements exist
        const searchToggle = document.getElementById('searchToggle');
        const searchBox = document.getElementById('searchBox');
        const searchButton = document.querySelector('.search-button');
        
        if (searchToggle && searchBox) {
            // Toggle search box visibility
            function toggleSearch(show = null) {
                const isExpanded = show === null 
                    ? searchToggle.getAttribute('aria-expanded') === 'true'
                    : !show;
                
                searchToggle.setAttribute('aria-expanded', !isExpanded);
                
                if (!isExpanded) {
                    searchBox.style.width = '300px';
                    searchBox.style.padding = '0.5rem 1rem';
                    searchBox.style.opacity = '1';
                    searchBox.style.transform = 'translateY(0) scale(1)';
                    
                    // Focus on input when search is opened
                    setTimeout(() => {
                        if (searchInput) searchInput.focus();
                    }, 100);
                } else {
                    searchBox.style.width = '0';
                    searchBox.style.padding = '0';
                    searchBox.style.opacity = '0';
                    searchBox.style.transform = 'translateY(10px) scale(0.95)';
                }
            }
            
            // Toggle on search icon click
            searchToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleSearch();
            });
            
            // Close search when clicking outside
            document.addEventListener('click', function(e) {
                if (!searchBox.contains(e.target) && e.target !== searchToggle) {
                    toggleSearch(false);
                }
            });
            
            // Handle search input
            if (searchInput) {
                searchInput.addEventListener('input', handleSearch);
                
                // Close search on Escape key
                searchInput.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape') {
                        toggleSearch(false);
                        searchToggle.focus();
                    }
                });
            }
            
            // Handle search button click
            if (searchButton) {
                searchButton.addEventListener('click', () => handleSearch({ target: searchInput }));
            }
        }
        
        // Smooth scrolling for menu navigation links
        const menuNavLinks = document.querySelectorAll('.menu-navigation a[href^="#"]');
        menuNavLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Get the header height
                    const headerHeight = document.querySelector('.main-header').offsetHeight;
                    // Get the menu navigation height
                    const menuNavHeight = document.querySelector('.menu-navigation').offsetHeight;
                    // Calculate the total offset
                    const offset = headerHeight + menuNavHeight;
                    
                    // Get the target element's position
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    // Calculate the final scroll position
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    
                    // Smooth scroll to the target element
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', () => handleFilterClick(button));
        });
        
        // Dietary filter buttons
        dietaryButtons.forEach(button => {
            button.addEventListener('click', () => handleDietaryFilter(button));
        });
        
        // Add to cart buttons
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-add-to-order') || e.target.closest('.btn-add-to-order')) {
                const menuItem = e.target.closest('.menu-item');
                if (menuItem) addToOrder(menuItem);
            } else if (e.target.classList.contains('btn-view-details') || e.target.closest('.btn-view-details')) {
                const menuItem = e.target.closest('.menu-item');
                if (menuItem) showItemDetails(menuItem);
            } else if (e.target.classList.contains('quick-view') || e.target.closest('.quick-view')) {
                const menuItem = e.target.closest('.menu-item');
                if (menuItem) showItemDetails(menuItem);
            }
        });
        
        // Order sidebar
        orderButton.addEventListener('click', toggleOrderSidebar);
        closeOrderBtn.addEventListener('click', toggleOrderSidebar);
        checkoutBtn.addEventListener('click', handleCheckout);
        clearOrderBtn.addEventListener('click', clearOrder);
        
        // Mobile menu toggle
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
        
        // Search toggle for mobile
        searchToggle.addEventListener('click', () => {
            searchBox.classList.toggle('active');
            if (searchBox.classList.contains('active')) {
                searchInput.focus();
            }
        });
        
        // Back to top button
        window.addEventListener('scroll', toggleBackToTop);
        backToTopBtn.addEventListener('click', scrollToTop);
        
        // Modal close
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Handle search functionality
    function handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        // Show all menu sections to ensure we search through all items
        document.querySelectorAll('.menu-category').forEach(section => {
            section.style.display = 'block';
        });
        
        // If search is empty, show all items that match current filters
        if (searchTerm.length === 0) {
            filterMenuItems();
            return;
        }
        
        let hasMatches = false;
        
        // Search through all menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            const itemName = item.querySelector('h4').textContent.toLowerCase();
            const itemDescription = item.querySelector('.description').textContent.toLowerCase();
            const matchesSearch = itemName.includes(searchTerm) || itemDescription.includes(searchTerm);
            
            if (matchesSearch) {
                item.style.display = '';
                item.classList.add('highlight');
                // Scroll to the first matching item
                if (!hasMatches) {
                    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    hasMatches = true;
                }
                // Remove highlight after animation
                setTimeout(() => item.classList.remove('highlight'), 1500);
            } else {
                item.style.display = 'none';
            }
        });
        
        // Hide empty sections
        document.querySelectorAll('.menu-category').forEach(section => {
            const hasVisibleItems = Array.from(section.querySelectorAll('.menu-item')).some(
                item => window.getComputedStyle(item).display !== 'none'
            );
            section.style.display = hasVisibleItems ? 'block' : 'none';
        });
        
        // Show message if no results found
        const noResults = document.querySelector('.no-results');
        if (!hasMatches) {
            if (!noResults) {
                const noResultsEl = document.createElement('div');
                noResultsEl.className = 'no-results';
                noResultsEl.textContent = 'No items found. Try a different search term.';
                document.querySelector('main').appendChild(noResultsEl);
            }
        } else if (noResults) {
            noResults.remove();
        }
    }
    
    // Handle category filter click
    function handleFilterClick(button) {
        const filter = button.dataset.filter;
        
        // Update active filter
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        activeFilters.category = filter;
        filterMenuItems();
    }
    
    // Handle dietary filter click
    function handleDietaryFilter(button) {
        const diet = button.dataset.diet;
        button.classList.toggle('active');
        
        // Update active dietary filters
        if (button.classList.contains('active')) {
            activeFilters.dietary.push(diet);
        } else {
            activeFilters.dietary = activeFilters.dietary.filter(d => d !== diet);
        }
        
    }
    
    // Check if item matches current filters
    function matchesCurrentFilters(item) {
        const categories = item.dataset.categories.split(' ');
        const dietary = item.dataset.dietary ? item.dataset.dietary.split(' ') : [];
        
        // Check category filter
        const categoryMatch = activeFilters.category === 'all' || categories.includes(activeFilters.category);
        
        // Check dietary filters
        let dietaryMatch = true;
        if (activeFilters.dietary.length > 0) {
            dietaryMatch = activeFilters.dietary.every(diet => dietary.includes(diet));
        }
        
        return categoryMatch && dietaryMatch;
    }
    
    // Add item to order
    function addToOrder(menuItem) {
        const itemName = menuItem.querySelector('h4').textContent;
        const itemPrice = parseFloat(menuItem.querySelector('.price').textContent.replace(/[^0-9.-]+/g, ''));
        const itemImage = menuItem.querySelector('img') ? menuItem.querySelector('img').src : '';
        
        // Check if item already exists in order
        const existingItem = order.find(item => item.name === itemName);
        
        if (existingItem) {
            existingItem.quantity += 1;
            existingItem.total = existingItem.quantity * itemPrice;
        } else {
            order.push({
                name: itemName,
                price: itemPrice,
                quantity: 1,
                total: itemPrice,
                image: itemImage
            });
        }
        
        updateOrderSummary();
        showToast(`${itemName} added to order!`, 'success');
        
        // Animate cart icon
        const cartIcon = document.querySelector('.order-button');
        cartIcon.classList.add('animate');
        setTimeout(() => cartIcon.classList.remove('animate'), 500);
    }
    
    // Update order summary in sidebar
    function updateOrderSummary() {
        orderItemsList.innerHTML = '';
        let subtotal = 0;
        
        order.forEach((item, index) => {
            subtotal += item.total;
            
            const li = document.createElement('li');
            li.className = 'order-item';
            li.innerHTML = `
                <div class="order-item-details">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}" class="order-item-image">` : ''}
                    <div>
                        <h4>${item.name}</h4>
                        <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
                    </div>
                </div>
                <div class="order-item-controls">
                    <button class="quantity-btn" data-index="${index}" data-action="decrease">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" data-index="${index}" data-action="increase">+</button>
                    <button class="remove-item" data-index="${index}" title="Remove item">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="order-item-total">$${item.total.toFixed(2)}</div>
            `;
            orderItemsList.appendChild(li);
        });
        
        // Add event listeners to quantity buttons
        document.querySelectorAll('.quantity-btn, .remove-item').forEach(button => {
            button.addEventListener('click', handleQuantityChange);
        });
        
        // Update total
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;
        
        orderTotal.innerHTML = `
            <div class="order-subtotal">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="order-tax">
                <span>Tax (10%):</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="order-grand-total">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        `;
        
        // Update cart count
        const cartCount = order.reduce((sum, item) => sum + item.quantity, 0);
        const cartBadge = document.querySelector('.cart-count');
        
        if (cartCount > 0) {
            if (!cartBadge) {
                const badge = document.createElement('span');
                badge.className = 'cart-count';
                orderButton.appendChild(badge);
            }
            document.querySelector('.cart-count').textContent = cartCount;
        } else if (cartBadge) {
            cartBadge.remove();
        }
    }
    
    // Handle quantity changes in order
    function handleQuantityChange(e) {
        const index = parseInt(e.target.dataset.index);
        const action = e.target.dataset.action;
        const item = order[index];
        
        if (action === 'increase') {
            item.quantity += 1;
            item.total = item.quantity * item.price;
        } else if (action === 'decrease' && item.quantity > 1) {
            item.quantity -= 1;
            item.total = item.quantity * item.price;
        } else if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
            order.splice(index, 1);
            showToast(`${item.name} removed from order.`, 'info');
        }
        
        updateOrderSummary();
    }
    
    // Toggle order sidebar
    function toggleOrderSidebar() {
        document.body.classList.toggle('order-sidebar-open');
        orderSidebar.classList.toggle('open');
    }
    
    // Handle checkout
    function handleCheckout() {
        if (order.length === 0) {
            showToast('Your order is empty!', 'error');
            return;
        }
        
        // In a real app, you would handle the checkout process here
        showLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            showLoading(false);
            showToast('Order placed successfully!', 'success');
            // Clear order after successful checkout
            order = [];
            updateOrderSummary();
            toggleOrderSidebar();
        }, 1500);
    }
    
    // Clear order
    function clearOrder() {
        if (order.length === 0) return;
        
        if (confirm('Are you sure you want to clear your order?')) {
            order = [];
            updateOrderSummary();
            showToast('Order cleared', 'info');
        }
    }
    
    // Show item details in modal
    function showItemDetails(menuItem) {
        const itemName = menuItem.querySelector('h4').textContent;
        const itemPrice = menuItem.querySelector('.price').textContent;
        const itemDescription = menuItem.querySelector('p').textContent;
        const itemImage = menuItem.querySelector('img') ? menuItem.querySelector('img').src : '';
        const dietaryIcons = menuItem.querySelector('.dietary-icons') ? menuItem.querySelector('.dietary-icons').innerHTML : '';
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>${itemName}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                ${itemImage ? `<div class="modal-image"><img src="${itemImage}" alt="${itemName}"></div>` : ''}
                <div class="modal-details">
                    <div class="modal-price">${itemPrice}</div>
                    <div class="modal-dietary">${dietaryIcons}</div>
                    <p>${itemDescription}</p>
                    <div class="modal-actions">
                        <button class="btn-add-to-order">Add to Order</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listener to the add to order button in the modal
        modalContent.querySelector('.btn-add-to-order').addEventListener('click', () => {
            addToOrder(menuItem);
            // Close modal after adding to order
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
        
        // Add event listener to the close button in the modal
        modalContent.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
        
        // Show the modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    // Show toast notification
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-message">${message}</div>
            <button class="toast-close">&times;</button>
        `;
        
        document.body.appendChild(toast);
        
        // Add close button event
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Toggle back to top button
    function toggleBackToTop() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }
    
    // Scroll to top
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Show/hide loading overlay
    function showLoading(show) {
        if (show) {
            loadingOverlay.style.display = 'flex';
        } else {
            loadingOverlay.style.display = 'none';
        }
    }
    
    // Animate menu items on scroll
    function animateMenuItems() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.menu-item').forEach(item => {
            observer.observe(item);
        });
    }
    
    // Initialize the app
    init();
});