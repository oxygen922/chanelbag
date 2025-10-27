// LADYBAGS Album JavaScript - Simplified for All Albums
// Features search functionality, pagination, and optimized image viewing

document.addEventListener('DOMContentLoaded', function() {
    // Show loading screen initially
    showLoadingScreen();

    // Initialize gallery with delay to allow UI to render
    setTimeout(() => {
        initializeGallery();
    }, 100);
});

// Global variables
let albumsData = [];
let filteredAlbums = [];
let currentPage = 1;
let currentAlbum = null;
let currentImageIndex = 0;
let searchQuery = '';
const ALBUMS_PER_PAGE = 12;
let isLoading = false;

// Initialize gallery
function initializeGallery() {
    try {
        // Load album data
        albumsData = generateCompleteChanelAlbums();
        filteredAlbums = [...albumsData];

        console.log(`📚 Loaded ${albumsData.length} albums with ${albumsData.reduce((sum, album) => sum + album.totalImages, 0)} images`);

        // Hide loading screen
        hideLoadingScreen();

        // Update statistics
        updateStatistics();

        // Setup event listeners
        setupEventListeners();

        // Render initial gallery
        renderGallery();

    } catch (error) {
        console.error('Error initializing gallery:', error);
        showError('Failed to load gallery. Please refresh the page.');
    }
}

// Loading screen functions
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 300);
    }
}

// Update statistics (simplified)
function updateStatistics() {
    console.log(`Loaded ${albumsData.length} albums with ${albumsData.reduce((sum, album) => sum + album.totalImages, 0)} images`);
}

// Animate numbers with easing
function animateNumber(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const range = end - start;
    const startTime = Date.now();

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + range * easeOutQuart);

        element.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    update();
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    // Back to top button
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', throttle(() => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }, 100));

        backToTopBtn.addEventListener('click', scrollToTop);
    }

    // Image viewer keyboard navigation
    document.addEventListener('keydown', handleKeyPress);

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', handleSmoothScroll);
    });

    // Close image viewer on background click
    const imageViewer = document.getElementById('imageViewer');
    if (imageViewer) {
        imageViewer.addEventListener('click', (e) => {
            if (e.target === imageViewer) {
                closeImageViewer();
            }
        });
    }
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Handle search
function handleSearch() {
    if (isLoading) return;

    searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();
    currentPage = 1;

    filterAlbums();
    renderGallery();
}

// Filter albums based on search
function filterAlbums() {
    isLoading = true;
    showLoadingState();

    setTimeout(() => {
        // Apply search filter
        if (searchQuery) {
            filteredAlbums = albumsData.filter(album =>
                album.title.toLowerCase().includes(searchQuery) ||
                album.description.toLowerCase().includes(searchQuery) ||
                album.id.includes(searchQuery)
            );
        } else {
            filteredAlbums = [...albumsData];
        }

        isLoading = false;
        hideLoadingState();
    }, 100);
}

// Render gallery
function renderGallery() {
    const galleryGrid = document.getElementById('albumsGrid');
    const albumsLoading = document.getElementById('albumsLoading');

    if (!galleryGrid) return;

    if (filteredAlbums.length === 0) {
        if (albumsLoading) albumsLoading.style.display = 'none';
        galleryGrid.style.display = 'grid';
        galleryGrid.innerHTML = `
            <div class="no-results">
                <h3>No albums found</h3>
                <p>Try adjusting your search.</p>
            </div>
        `;
        renderPagination(0);
        return;
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * ALBUMS_PER_PAGE;
    const endIndex = startIndex + ALBUMS_PER_PAGE;
    const paginatedAlbums = filteredAlbums.slice(startIndex, endIndex);

    // Show loading state
    if (albumsLoading) {
        albumsLoading.style.display = 'block';
        galleryGrid.style.display = 'none';
    }

    // Simulate loading for better UX
    setTimeout(() => {
        if (albumsLoading) albumsLoading.style.display = 'none';
        galleryGrid.style.display = 'grid';

        // Clear and render albums
        galleryGrid.innerHTML = '';

        paginatedAlbums.forEach((album, index) => {
            const albumCard = createAlbumCard(album);
            galleryGrid.appendChild(albumCard);
        });

        // Render pagination
        renderPagination(filteredAlbums.length);

        // Animate in cards
        setTimeout(() => {
            galleryGrid.querySelectorAll('.album-card').forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 50);
            });
        }, 100);

    }, 300);
}

// Show/hide loading states
function showLoadingState() {
    const albumsLoading = document.getElementById('albumsLoading');
    const galleryGrid = document.getElementById('albumsGrid');

    if (albumsLoading) albumsLoading.style.display = 'block';
    if (galleryGrid) galleryGrid.style.display = 'none';
}

function hideLoadingState() {
    const albumsLoading = document.getElementById('albumsLoading');
    if (albumsLoading) albumsLoading.style.display = 'none';
}

// Create album card with lazy loading
function createAlbumCard(album) {
    const card = document.createElement('div');
    card.className = 'album-card';
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.5s ease';

    const coverImage = album.images[album.coverImage];

    card.innerHTML = `
        <div class="album-cover">
            <img src="${coverImage.url}" alt="${album.title}" loading="lazy"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5ZmFmYiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2QjQ2QzEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBMb2FkaW5nLi4uPC90ZXh0Pgo8L3N2Zz4K';">
            <div class="album-overlay">
                <h3 class="album-title-overlay">${album.title}</h3>
                <p class="album-count">${album.totalImages} Images</p>
            </div>
        </div>
        <div class="album-info">
            <h3 class="album-title">${album.title}</h3>
            <p class="album-description">${album.description}</p>
            <div class="album-meta">
                <span class="album-images-count">${album.totalImages} images</span>
                <button class="view-album-btn" onclick="openAlbum('${album.id}')">View Album →</button>
            </div>
        </div>
    `;

    // Add click handler for entire card
    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('view-album-btn')) {
            openAlbum(album.id);
        }
    });

    return card;
}

// Open album
function openAlbum(albumId) {
    currentAlbum = albumsData.find(album => album.id === albumId);
    if (!currentAlbum) return;

    currentImageIndex = 0;
    showImageViewer();
}

// Show image viewer
function showImageViewer() {
    const viewer = document.getElementById('imageViewer');
    if (!viewer || !currentAlbum) return;

    const viewerImage = document.getElementById('viewerImage');
    const imageTitle = document.getElementById('imageTitle');
    const imageCounter = document.getElementById('imageCounter');

    viewer.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    updateImageViewer();
}

// Update image viewer
function updateImageViewer() {
    if (!currentAlbum) return;

    const viewerImage = document.getElementById('viewerImage');
    const imageTitle = document.getElementById('imageTitle');
    const imageCounter = document.getElementById('imageCounter');

    const currentImage = currentAlbum.images[currentImageIndex];

    viewerImage.src = currentImage.url;
    imageTitle.textContent = currentAlbum.title;
    imageCounter.textContent = `${currentImageIndex + 1} / ${currentAlbum.totalImages}`;
}

// Close image viewer
function closeImageViewer() {
    const viewer = document.getElementById('imageViewer');
    if (viewer) {
        viewer.style.display = 'none';
        document.body.style.overflow = '';
    }
    currentAlbum = null;
    currentImageIndex = 0;
}

// Navigate images
function prevImage() {
    if (!currentAlbum) return;
    currentImageIndex = (currentImageIndex - 1 + currentAlbum.totalImages) % currentAlbum.totalImages;
    updateImageViewer();
}

function nextImage() {
    if (!currentAlbum) return;
    currentImageIndex = (currentImageIndex + 1) % currentAlbum.totalImages;
    updateImageViewer();
}

// Handle keyboard navigation
function handleKeyPress(e) {
    const viewer = document.getElementById('imageViewer');
    if (viewer && viewer.style.display === 'flex') {
        switch (e.key) {
            case 'Escape':
                closeImageViewer();
                break;
            case 'ArrowLeft':
                prevImage();
                break;
            case 'ArrowRight':
                nextImage();
                break;
        }
    }
}

// Render pagination
function renderPagination(totalItems) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(totalItems / ALBUMS_PER_PAGE);

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // Previous button
    paginationHTML += `
        <button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            ‹
        </button>
    `;

    // Smart page number display
    const pageNumbers = generatePageNumbers(currentPage, totalPages);
    pageNumbers.forEach(pageNum => {
        if (pageNum === '...') {
            paginationHTML += '<span style="padding: 0 0.5rem;">...</span>';
        } else {
            paginationHTML += `
                <button class="page-btn ${pageNum === currentPage ? 'active' : ''}" onclick="changePage(${pageNum})">
                    ${pageNum}
                </button>
            `;
        }
    });

    // Next button
    paginationHTML += `
        <button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            ›
        </button>
    `;

    pagination.innerHTML = paginationHTML;
}

// Generate smart page numbers
function generatePageNumbers(current, total) {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            range.push(i);
        }
    }

    range.forEach((i) => {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    });

    return rangeWithDots;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredAlbums.length / ALBUMS_PER_PAGE);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderGallery();
    scrollToAlbums();
}


// Error handling
function showError(message) {
    const galleryGrid = document.getElementById('albumsGrid');
    if (galleryGrid) {
        galleryGrid.innerHTML = `
            <div class="error-message" style="grid-column: 1 / -1;">
                <h3>❌ Error</h3>
                <p>${message}</p>
            </div>
        `;
    }
}

// Smooth scrolling functions
function scrollToAlbums() {
    const albumsSection = document.getElementById('albums');
    if (albumsSection) {
        albumsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleSmoothScroll(e) {
    e.preventDefault();
    const targetId = e.target.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Performance monitoring
function logPerformance() {
    if (window.performance && window.performance.timing) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
    }
}

// Log performance after page loads
window.addEventListener('load', logPerformance);

// Global functions that need to be accessible from HTML
window.openAlbum = openAlbum;
window.closeImageViewer = closeImageViewer;
window.prevImage = prevImage;
window.nextImage = nextImage;
window.changePage = changePage;
window.scrollToAlbums = scrollToAlbums;
window.scrollToTop = scrollToTop;