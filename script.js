// Luxury Rentals Aggregator - Main Application
class LuxuryRentalsApp {
    constructor() {
        this.properties = [];
        this.filteredProperties = [];
        this.currentView = 'grid';
        this.filters = {
            search: '',
            bedrooms: '',
            priceRange: '',
            building: '',
            availability: ''
        };
        
        this.init();
    }

    init() {
        this.loadSampleData();
        this.bindEvents();
        this.renderProperties();
        this.updateStats();
        this.updateLastUpdated();
    }

    bindEvents() {
        // View controls
        document.getElementById('grid-view').addEventListener('click', () => this.setView('grid'));
        document.getElementById('list-view').addEventListener('click', () => this.setView('list'));

        // Filters
        document.getElementById('search-input').addEventListener('input', (e) => this.updateFilter('search', e.target.value));
        document.getElementById('bedrooms-filter').addEventListener('change', (e) => this.updateFilter('bedrooms', e.target.value));
        document.getElementById('price-range').addEventListener('change', (e) => this.updateFilter('priceRange', e.target.value));
        document.getElementById('building-filter').addEventListener('change', (e) => this.updateFilter('building', e.target.value));
        document.getElementById('availability-filter').addEventListener('change', (e) => this.updateFilter('availability', e.target.value));
        
        // Clear filters
        document.getElementById('clear-filters').addEventListener('click', () => this.clearAllFilters());
        document.getElementById('reset-search')?.addEventListener('click', () => this.clearAllFilters());

        // Export functionality
        document.getElementById('export-btn').addEventListener('click', () => this.exportData());

        // Add property modal
        document.getElementById('add-property-btn').addEventListener('click', () => this.openAddPropertyModal());
        document.getElementById('extract-btn').addEventListener('click', () => this.extractPropertyInfo());
        document.getElementById('save-property-btn')?.addEventListener('click', () => this.saveExtractedProperty());

        // Modal controls
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modalId = e.target.getAttribute('data-modal');
                if (modalId) {
                    this.closeModal(modalId);
                } else {
                    // Close any open modal
                    document.querySelectorAll('.modal').forEach(modal => {
                        modal.style.display = 'none';
                    });
                }
            });
        });

        document.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.getAttribute('data-close-modal');
                this.closeModal(modalId);
            });
        });

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    loadSampleData() {
        // Sample properties to demonstrate the interface
        this.properties = [
            {
                id: 1,
                title: "Luxury Waterfront Studio",
                address: "121 Town Square Place, Jersey City, NJ",
                building: "newport",
                buildingName: "Newport Rentals",
                price: 2800,
                bedrooms: "Studio",
                bathrooms: 1,
                sqft: 650,
                availability: "available",
                availableDate: "2025-02-01",
                features: ["Doorman", "Fitness Center", "River Views", "Pet Friendly"],
                contact: {
                    phone: "877-408-2349",
                    email: "leasing@newportrentals.com"
                },
                images: [],
                description: "Stunning waterfront studio with Hudson River views",
                source: "https://www.newportrentals.com/apartments-jersey-city-for-rent/",
                dateAdded: new Date().toISOString()
            },
            {
                id: 2,
                title: "Modern 1BR at Journal Squared",
                address: "36 Journal Square Plaza, Jersey City, NJ",
                building: "journal",
                buildingName: "Journal Squared",
                price: 3200,
                bedrooms: "1",
                bathrooms: 1,
                sqft: 750,
                availability: "available",
                availableDate: "2025-01-15",
                features: ["Transit Hub", "Rooftop Deck", "High-Speed WiFi", "Gym"],
                contact: {
                    phone: "551-209-2121",
                    email: "info@JournalJC.com"
                },
                images: [],
                description: "Modern 1-bedroom apartment in the heart of Journal Square",
                source: "https://www.journaljc.com/availability",
                dateAdded: new Date().toISOString()
            },
            {
                id: 3,
                title: "Spacious 2BR Penthouse",
                address: "121 Town Square Place, Jersey City, NJ",
                building: "newport",
                buildingName: "Newport Rentals",
                price: 4500,
                bedrooms: "2",
                bathrooms: 2,
                sqft: 1200,
                availability: "coming-soon",
                availableDate: "2025-03-01",
                features: ["Penthouse", "Private Balcony", "Concierge", "Pool Access"],
                contact: {
                    phone: "877-408-2349",
                    email: "leasing@newportrentals.com"
                },
                images: [],
                description: "Luxury penthouse with panoramic city and river views",
                source: "https://www.newportrentals.com/apartments-jersey-city-for-rent/",
                dateAdded: new Date().toISOString()
            }
        ];

        this.filteredProperties = [...this.properties];
    }

    updateFilter(filterType, value) {
        this.filters[filterType] = value.toLowerCase();
        this.applyFilters();
    }

    applyFilters() {
        this.filteredProperties = this.properties.filter(property => {
            // Search filter
            if (this.filters.search && 
                !property.title.toLowerCase().includes(this.filters.search) &&
                !property.address.toLowerCase().includes(this.filters.search) &&
                !property.buildingName.toLowerCase().includes(this.filters.search)) {
                return false;
            }

            // Bedrooms filter
            if (this.filters.bedrooms && 
                property.bedrooms.toLowerCase() !== this.filters.bedrooms) {
                return false;
            }

            // Price range filter
            if (this.filters.priceRange) {
                const [min, max] = this.filters.priceRange.split('-');
                if (max && max !== '+') {
                    if (property.price < parseInt(min) || property.price > parseInt(max)) {
                        return false;
                    }
                } else if (max === '+') {
                    if (property.price < parseInt(min)) {
                        return false;
                    }
                }
            }

            // Building filter
            if (this.filters.building && property.building !== this.filters.building) {
                return false;
            }

            // Availability filter
            if (this.filters.availability && property.availability !== this.filters.availability) {
                return false;
            }

            return true;
        });

        this.renderProperties();
        this.updateResultsCount();
    }

    clearAllFilters() {
        this.filters = {
            search: '',
            bedrooms: '',
            priceRange: '',
            building: '',
            availability: ''
        };

        // Reset form elements
        document.getElementById('search-input').value = '';
        document.getElementById('bedrooms-filter').value = '';
        document.getElementById('price-range').value = '';
        document.getElementById('building-filter').value = '';
        document.getElementById('availability-filter').value = '';

        this.applyFilters();
    }

    setView(viewType) {
        this.currentView = viewType;
        
        // Update button states
        document.getElementById('grid-view').classList.toggle('active', viewType === 'grid');
        document.getElementById('list-view').classList.toggle('active', viewType === 'list');
        
        // Update container class
        const container = document.getElementById('properties-container');
        container.classList.toggle('list-view', viewType === 'list');
        
        this.renderProperties();
    }

    renderProperties() {
        const container = document.getElementById('properties-container');
        const loading = document.getElementById('loading');
        const noResults = document.getElementById('no-results');

        // Hide loading
        loading.style.display = 'none';

        if (this.filteredProperties.length === 0) {
            container.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';
        
        container.innerHTML = this.filteredProperties.map(property => 
            this.createPropertyCard(property)
        ).join('');

        // Bind property card events
        this.bindPropertyEvents();
    }

    createPropertyCard(property) {
        const availabilityBadge = property.availability === 'available' ? 
            '<span class="feature-tag" style="background: #dcfce7; color: #166534;">Available Now</span>' :
            '<span class="feature-tag" style="background: #fef3c7; color: #92400e;">Coming Soon</span>';

        const formattedPrice = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(property.price);

        return `
            <div class="property-card" data-property-id="${property.id}">
                <div class="property-image">
                    <i class="fas fa-building"></i>
                    <div class="building-badge">${property.buildingName}</div>
                </div>
                <div class="property-info">
                    <div class="property-header">
                        <div>
                            <h3 class="property-title">${property.title}</h3>
                            <p class="property-address">${property.address}</p>
                        </div>
                        <div class="property-price">
                            <div class="price-amount">${formattedPrice}</div>
                            <div class="price-period">/month</div>
                        </div>
                    </div>
                    
                    <div class="property-details">
                        <div class="detail-item">
                            <i class="fas fa-bed"></i>
                            <span>${property.bedrooms} ${property.bedrooms === 'Studio' ? '' : property.bedrooms === '1' ? 'Bed' : 'Beds'}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-bath"></i>
                            <span>${property.bathrooms} Bath${property.bathrooms > 1 ? 's' : ''}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-expand-arrows-alt"></i>
                            <span>${property.sqft} sq ft</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-calendar"></i>
                            <span>Available ${new Date(property.availableDate).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div class="property-features">
                        ${availabilityBadge}
                        ${property.features.slice(0, 3).map(feature => 
                            `<span class="feature-tag">${feature}</span>`
                        ).join('')}
                        ${property.features.length > 3 ? `<span class="feature-tag">+${property.features.length - 3} more</span>` : ''}
                    </div>

                    <div class="property-actions">
                        <button class="btn-primary view-details-btn">View Details</button>
                        <a href="tel:${property.contact.phone}" class="btn-secondary">
                            <i class="fas fa-phone"></i>
                        </a>
                        <a href="mailto:${property.contact.email}" class="btn-secondary">
                            <i class="fas fa-envelope"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    bindPropertyEvents() {
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.property-card');
                const propertyId = parseInt(card.dataset.propertyId);
                this.showPropertyDetails(propertyId);
            });
        });
    }

    showPropertyDetails(propertyId) {
        const property = this.properties.find(p => p.id === propertyId);
        if (!property) return;

        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <div class="property-detail-header">
                <h2>${property.title}</h2>
                <p class="address"><i class="fas fa-map-marker-alt"></i> ${property.address}</p>
            </div>
            
            <div class="property-detail-content">
                <div class="detail-section">
                    <h3>Property Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="label">Price:</span>
                            <span class="value">$${property.price.toLocaleString()}/month</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Bedrooms:</span>
                            <span class="value">${property.bedrooms}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Bathrooms:</span>
                            <span class="value">${property.bathrooms}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Square Feet:</span>
                            <span class="value">${property.sqft}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Available:</span>
                            <span class="value">${new Date(property.availableDate).toLocaleDateString()}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Building:</span>
                            <span class="value">${property.buildingName}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Description</h3>
                    <p>${property.description}</p>
                </div>

                <div class="detail-section">
                    <h3>Amenities & Features</h3>
                    <div class="features-grid">
                        ${property.features.map(feature => `<span class="feature-badge">${feature}</span>`).join('')}
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Contact Information</h3>
                    <div class="contact-grid">
                        <a href="tel:${property.contact.phone}" class="contact-item">
                            <i class="fas fa-phone"></i>
                            <span>${property.contact.phone}</span>
                        </a>
                        <a href="mailto:${property.contact.email}" class="contact-item">
                            <i class="fas fa-envelope"></i>
                            <span>${property.contact.email}</span>
                        </a>
                        <a href="${property.source}" target="_blank" class="contact-item">
                            <i class="fas fa-external-link-alt"></i>
                            <span>View Original Listing</span>
                        </a>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('property-modal').style.display = 'flex';
    }

    updateStats() {
        document.getElementById('total-properties').textContent = this.properties.length;
    }

    updateResultsCount() {
        const count = this.filteredProperties.length;
        const resultsCount = document.getElementById('results-count');
        resultsCount.textContent = `Showing ${count} of ${this.properties.length} properties`;
    }

    updateLastUpdated() {
        const lastUpdated = document.getElementById('last-updated');
        if (lastUpdated) {
            lastUpdated.textContent = new Date().toLocaleString();
        }
    }

    // Add Property Modal Functions
    openAddPropertyModal() {
        document.getElementById('add-property-modal').style.display = 'flex';
        document.getElementById('property-url').value = '';
        document.getElementById('extraction-status').style.display = 'none';
        document.getElementById('extracted-property').style.display = 'none';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    async extractPropertyInfo() {
        const url = document.getElementById('property-url').value.trim();
        
        if (!url) {
            alert('Please enter a property URL');
            return;
        }

        if (!this.isValidPropertyUrl(url)) {
            alert('Please enter a valid property URL from supported sites (Newport Rentals, Journal Squared, etc.)');
            return;
        }

        // Show loading state
        document.getElementById('extraction-status').style.display = 'block';
        document.getElementById('extracted-property').style.display = 'none';
        document.getElementById('extract-btn').disabled = true;

        try {
            // Simulate property extraction (in a real app, this would call a backend service)
            const extractedData = await this.simulatePropertyExtraction(url);
            
            // Display extracted data
            this.displayExtractedProperty(extractedData);
            
        } catch (error) {
            console.error('Property extraction failed:', error);
            alert('Failed to extract property information. Please try again or enter the details manually.');
        } finally {
            document.getElementById('extraction-status').style.display = 'none';
            document.getElementById('extract-btn').disabled = false;
        }
    }

    isValidPropertyUrl(url) {
        const supportedDomains = [
            'newportrentals.com',
            'journaljc.com',
            'equityapartments.com',
            'avaloncommunities.com',
            'cortland.com'
        ];
        
        return supportedDomains.some(domain => url.includes(domain));
    }

    async simulatePropertyExtraction(url) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock extracted data based on URL patterns
        if (url.includes('newportrentals.com')) {
            return {
                title: "Newport Waterfront Apartment",
                address: "121 Town Square Place, Jersey City, NJ 07310",
                building: "newport",
                buildingName: "Newport Rentals",
                price: Math.floor(Math.random() * 2000) + 2500,
                bedrooms: ['Studio', '1', '2'][Math.floor(Math.random() * 3)],
                bathrooms: Math.floor(Math.random() * 2) + 1,
                sqft: Math.floor(Math.random() * 500) + 600,
                features: ["Doorman", "Fitness Center", "River Views", "Pet Friendly", "Pool"],
                contact: { phone: "877-408-2349", email: "leasing@newportrentals.com" },
                description: "Luxury waterfront apartment with stunning Hudson River views and premium amenities.",
                availability: "available",
                availableDate: "2025-02-15"
            };
        } else if (url.includes('journaljc.com')) {
            return {
                title: "Journal Squared Modern Unit",
                address: "36 Journal Square Plaza, Jersey City, NJ",
                building: "journal", 
                buildingName: "Journal Squared",
                price: Math.floor(Math.random() * 1500) + 3000,
                bedrooms: ['1', '2', '3'][Math.floor(Math.random() * 3)],
                bathrooms: Math.floor(Math.random() * 2) + 1,
                sqft: Math.floor(Math.random() * 400) + 700,
                features: ["Transit Hub", "Rooftop Deck", "High-Speed WiFi", "Gym", "Concierge"],
                contact: { phone: "551-209-2121", email: "info@JournalJC.com" },
                description: "Modern apartment in the heart of Journal Square with excellent transit connections.",
                availability: "available",
                availableDate: "2025-01-20"
            };
        } else {
            // Generic extraction for other supported sites
            return {
                title: "Luxury Apartment Unit",
                address: "Jersey City, NJ",
                building: "equity",
                buildingName: "Premium Residences",
                price: Math.floor(Math.random() * 3000) + 2000,
                bedrooms: ['Studio', '1', '2', '3'][Math.floor(Math.random() * 4)],
                bathrooms: Math.floor(Math.random() * 2) + 1,
                sqft: Math.floor(Math.random() * 600) + 500,
                features: ["Modern Finishes", "In-Unit Laundry", "Parking", "Pet Friendly"],
                contact: { phone: "555-0123", email: "leasing@example.com" },
                description: "Beautiful apartment with modern amenities and convenient location.",
                availability: "available",
                availableDate: "2025-02-01"
            };
        }
    }

    displayExtractedProperty(data) {
        const previewDiv = document.querySelector('.property-preview');
        previewDiv.innerHTML = `
            <div class="preview-field">
                <span class="preview-label">Title:</span>
                <span class="preview-value">${data.title}</span>
            </div>
            <div class="preview-field">
                <span class="preview-label">Address:</span>
                <span class="preview-value">${data.address}</span>
            </div>
            <div class="preview-field">
                <span class="preview-label">Building:</span>
                <span class="preview-value">${data.buildingName}</span>
            </div>
            <div class="preview-field">
                <span class="preview-label">Price:</span>
                <span class="preview-value">$${data.price.toLocaleString()}/month</span>
            </div>
            <div class="preview-field">
                <span class="preview-label">Bedrooms:</span>
                <span class="preview-value">${data.bedrooms}</span>
            </div>
            <div class="preview-field">
                <span class="preview-label">Bathrooms:</span>
                <span class="preview-value">${data.bathrooms}</span>
            </div>
            <div class="preview-field">
                <span class="preview-label">Square Feet:</span>
                <span class="preview-value">${data.sqft}</span>
            </div>
            <div class="preview-field">
                <span class="preview-label">Available Date:</span>
                <span class="preview-value">${new Date(data.availableDate).toLocaleDateString()}</span>
            </div>
            <div class="preview-field">
                <span class="preview-label">Features:</span>
                <span class="preview-value">${data.features.join(', ')}</span>
            </div>
            <div class="preview-field">
                <span class="preview-label">Contact:</span>
                <span class="preview-value">${data.contact.phone}</span>
            </div>
        `;

        // Store extracted data for saving
        this.currentExtractedProperty = {
            ...data,
            id: Date.now(), // Simple ID generation
            images: [],
            source: document.getElementById('property-url').value,
            dateAdded: new Date().toISOString()
        };

        document.getElementById('extracted-property').style.display = 'block';
    }

    saveExtractedProperty() {
        if (!this.currentExtractedProperty) {
            alert('No property data to save');
            return;
        }

        // Add to properties array
        this.properties.push(this.currentExtractedProperty);
        this.applyFilters(); // This will re-render with new property
        this.updateStats();
        
        // Close modal and show success
        this.closeModal('add-property-modal');
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'success-toast';
        successMsg.innerHTML = `
            <i class="fas fa-check-circle"></i>
            Property "${this.currentExtractedProperty.title}" added successfully!
        `;
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 300;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(successMsg);
        
        // Remove success message after 3 seconds
        setTimeout(() => {
            successMsg.remove();
        }, 3000);
        
        // Clear current extracted property
        this.currentExtractedProperty = null;
    }

    exportData() {
        const dataToExport = this.filteredProperties.map(property => ({
            Title: property.title,
            Address: property.address,
            Building: property.buildingName,
            Price: property.price,
            Bedrooms: property.bedrooms,
            Bathrooms: property.bathrooms,
            'Square Feet': property.sqft,
            'Available Date': property.availableDate,
            Features: property.features.join('; '),
            Phone: property.contact.phone,
            Email: property.contact.email,
            Source: property.source
        }));

        // Convert to CSV
        if (dataToExport.length === 0) {
            alert('No properties to export');
            return;
        }

        const csv = this.convertToCSV(dataToExport);
        this.downloadCSV(csv, 'luxury_rentals_export.csv');
    }

    convertToCSV(objArray) {
        const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
        let str = '';

        // Add headers
        const headers = Object.keys(array[0]);
        str += headers.join(',') + '\r\n';

        // Add data rows
        for (let i = 0; i < array.length; i++) {
            let line = '';
            for (const header of headers) {
                if (line !== '') line += ',';
                
                const value = array[i][header] || '';
                // Escape commas and quotes in CSV
                line += '"' + String(value).replace(/"/g, '""') + '"';
            }
            str += line + '\r\n';
        }

        return str;
    }

    downloadCSV(csvContent, fileName) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LuxuryRentalsApp();
});

// Add CSS for success toast animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);