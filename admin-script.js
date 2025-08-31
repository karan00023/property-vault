// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();
        this.updateAnalytics();
    }

    bindEvents() {
        // Property Management
        document.getElementById('bulk-import-btn')?.addEventListener('click', () => this.showBulkImport());
        document.getElementById('export-all-btn')?.addEventListener('click', () => this.exportAllData());
        document.getElementById('clean-data-btn')?.addEventListener('click', () => this.cleanDuplicateData());

        // Site Configuration
        document.getElementById('save-config-btn')?.addEventListener('click', () => this.saveConfiguration());
        
        // Display Settings
        document.getElementById('save-display-btn')?.addEventListener('click', () => this.saveDisplaySettings());
        
        // Analytics
        document.getElementById('refresh-analytics-btn')?.addEventListener('click', () => this.updateAnalytics());
        
        // Custom URL Management
        document.getElementById('add-custom-url-btn')?.addEventListener('click', () => this.addCustomURL());
        
        // System Maintenance
        document.getElementById('clear-cache-btn')?.addEventListener('click', () => this.clearCache());
        document.getElementById('rebuild-index-btn')?.addEventListener('click', () => this.rebuildIndex());
        document.getElementById('backup-data-btn')?.addEventListener('click', () => this.backupData());
        document.getElementById('reset-all-btn')?.addEventListener('click', () => this.resetAllData());
        
        // Quick actions
        document.getElementById('quick-backup')?.addEventListener('click', () => this.backupData());
    }

    loadSettings() {
        // Load saved settings from localStorage
        const savedSettings = this.getStoredSettings();
        
        // Load extraction source settings
        document.getElementById('enable-journal').checked = savedSettings.enableJournal !== false;
        document.getElementById('enable-newport').checked = savedSettings.enableNewport !== false;
        document.getElementById('enable-portside').checked = savedSettings.enablePortside !== false;
        document.getElementById('enable-equity').checked = savedSettings.enableEquity !== false;
        
        // Load display settings
        document.getElementById('per-page-select').value = savedSettings.perPage || '50';
        document.getElementById('sort-column-select').value = savedSettings.sortColumn || 'rent';
        document.getElementById('enable-animations').checked = savedSettings.enableAnimations !== false;
        
        this.loadCustomURLs();
    }

    getStoredSettings() {
        try {
            return JSON.parse(localStorage.getItem('adminSettings')) || {};
        } catch (error) {
            console.error('Error loading settings:', error);
            return {};
        }
    }

    saveStoredSettings(settings) {
        try {
            localStorage.setItem('adminSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    showBulkImport() {
        // Create a modal for bulk import
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content large-modal">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <div class="modal-header">
                    <h2><i class="fas fa-upload"></i> Bulk Import Properties</h2>
                    <p>Import multiple property URLs at once</p>
                </div>
                <div class="modal-body">
                    <div class="import-section">
                        <label>Paste URLs (one per line):</label>
                        <textarea id="bulk-urls" rows="10" placeholder="https://www.journaljc.com/availability
https://www.newportrentals.com/apartments-jersey-city-for-rent/
https://www.equityapartments.com/new-york-city/jersey-city/portside-towers-apartments"></textarea>
                    </div>
                    <div class="import-options">
                        <label class="checkbox-item">
                            <input type="checkbox" id="import-reviews" checked>
                            <span class="checkmark"></span>
                            Extract reviews and ratings
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" id="import-amenities" checked>
                            <span class="checkmark"></span>
                            Get detailed amenities
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" id="import-availability" checked>
                            <span class="checkmark"></span>
                            Check real-time availability
                        </label>
                    </div>
                    <div class="modal-actions">
                        <button id="start-import-btn" class="btn-primary">
                            <i class="fas fa-play"></i> Start Import
                        </button>
                        <button onclick="this.closest('.modal').remove()" class="btn-secondary">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle import
        modal.querySelector('#start-import-btn').addEventListener('click', () => {
            this.processBulkImport();
            modal.remove();
        });
    }

    processBulkImport() {
        const urls = document.getElementById('bulk-urls')?.value.split('\n').filter(url => url.trim());
        if (!urls || urls.length === 0) {
            this.showMessage('Please enter at least one URL', 'error');
            return;
        }
        
        this.showMessage(`Starting bulk import of ${urls.length} URLs...`, 'info');
        
        // Simulate processing (in a real app, this would call your extraction API)
        setTimeout(() => {
            this.showMessage(`Successfully imported ${urls.length} property sources`, 'success');
            this.updateAnalytics();
        }, 2000);
    }

    exportAllData() {
        // Get all properties from localStorage or current session
        const properties = JSON.parse(localStorage.getItem('properties')) || [];
        
        if (properties.length === 0) {
            this.showMessage('No data available to export', 'warning');
            return;
        }

        // Create CSV content
        const headers = ['Building Name', 'Unit', 'Bedrooms', 'Bathrooms', 'Sq Ft', 'Rent', 'Available Date', 'Rating', 'URL'];
        const csvContent = [
            headers.join(','),
            ...properties.map(property => [
                `"${property.buildingName || ''}"`,
                `"${property.unit || ''}"`,
                property.bedrooms || 0,
                property.bathrooms || 0,
                property.sqft || 0,
                property.rent || 0,
                `"${property.availableDate || ''}"`,
                property.rating || 0,
                `"${property.originalURL || ''}"`
            ].join(','))
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `luxury-rentals-export-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showMessage('Data exported successfully', 'success');
    }

    cleanDuplicateData() {
        if (!confirm('This will remove duplicate properties. Continue?')) return;
        
        const properties = JSON.parse(localStorage.getItem('properties')) || [];
        const cleaned = [];
        const seen = new Set();
        
        for (const property of properties) {
            const key = `${property.buildingName}-${property.unit}-${property.rent}`;
            if (!seen.has(key)) {
                seen.add(key);
                cleaned.push(property);
            }
        }
        
        const removed = properties.length - cleaned.length;
        if (removed > 0) {
            localStorage.setItem('properties', JSON.stringify(cleaned));
            this.showMessage(`Removed ${removed} duplicate properties`, 'success');
            this.updateAnalytics();
        } else {
            this.showMessage('No duplicates found', 'info');
        }
    }

    saveConfiguration() {
        const settings = this.getStoredSettings();
        
        settings.enableJournal = document.getElementById('enable-journal').checked;
        settings.enableNewport = document.getElementById('enable-newport').checked;
        settings.enablePortside = document.getElementById('enable-portside').checked;
        settings.enableEquity = document.getElementById('enable-equity').checked;
        
        this.saveStoredSettings(settings);
        this.showMessage('Configuration saved successfully', 'success');
    }

    saveDisplaySettings() {
        const settings = this.getStoredSettings();
        
        settings.perPage = document.getElementById('per-page-select').value;
        settings.sortColumn = document.getElementById('sort-column-select').value;
        settings.enableAnimations = document.getElementById('enable-animations').checked;
        
        this.saveStoredSettings(settings);
        this.showMessage('Display settings saved successfully', 'success');
    }

    updateAnalytics() {
        const properties = JSON.parse(localStorage.getItem('properties')) || [];
        const lastUpdated = localStorage.getItem('lastUpdated');
        
        // Update analytics display
        document.getElementById('total-properties').textContent = properties.length;
        document.getElementById('last-updated').textContent = lastUpdated ? 
            new Date(lastUpdated).toLocaleDateString() : 'Never';
        
        if (properties.length > 0) {
            const avgRent = properties.reduce((sum, p) => sum + (p.rent || 0), 0) / properties.length;
            document.getElementById('avg-rent').textContent = '$' + Math.round(avgRent).toLocaleString();
        } else {
            document.getElementById('avg-rent').textContent = '$0';
        }
        
        // Count active sources
        const settings = this.getStoredSettings();
        const activeSources = [
            settings.enableJournal !== false,
            settings.enableNewport !== false,
            settings.enablePortside !== false,
            settings.enableEquity !== false
        ].filter(Boolean).length;
        
        document.getElementById('data-sources').textContent = activeSources;
    }

    addCustomURL() {
        const urlInput = document.getElementById('custom-url-input');
        const url = urlInput.value.trim();
        
        if (!url) {
            this.showMessage('Please enter a URL', 'warning');
            return;
        }
        
        if (!this.isValidURL(url)) {
            this.showMessage('Please enter a valid URL', 'error');
            return;
        }
        
        const customUrls = JSON.parse(localStorage.getItem('customURLs')) || [];
        
        if (customUrls.includes(url)) {
            this.showMessage('URL already exists', 'warning');
            return;
        }
        
        customUrls.push(url);
        localStorage.setItem('customURLs', JSON.stringify(customUrls));
        
        urlInput.value = '';
        this.loadCustomURLs();
        this.showMessage('Custom URL added successfully', 'success');
    }

    loadCustomURLs() {
        const customUrls = JSON.parse(localStorage.getItem('customURLs')) || [];
        const container = document.getElementById('custom-urls-list');
        
        if (customUrls.length === 0) {
            container.innerHTML = '<p class="no-urls">No custom URLs added yet</p>';
            return;
        }
        
        container.innerHTML = customUrls.map((url, index) => `
            <div class="url-item">
                <span class="url-text">${url}</span>
                <button class="btn-remove" onclick="adminPanel.removeCustomURL(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    removeCustomURL(index) {
        const customUrls = JSON.parse(localStorage.getItem('customURLs')) || [];
        customUrls.splice(index, 1);
        localStorage.setItem('customURLs', JSON.stringify(customUrls));
        this.loadCustomURLs();
        this.showMessage('Custom URL removed', 'success');
    }

    isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    clearCache() {
        if (!confirm('This will clear all cached data. Continue?')) return;
        
        // Clear specific cache items but preserve settings
        const settings = this.getStoredSettings();
        const customUrls = JSON.parse(localStorage.getItem('customURLs')) || [];
        
        localStorage.clear();
        
        // Restore important data
        this.saveStoredSettings(settings);
        localStorage.setItem('customURLs', JSON.stringify(customUrls));
        
        this.showMessage('Cache cleared successfully', 'success');
        this.updateAnalytics();
    }

    rebuildIndex() {
        this.showMessage('Rebuilding search index...', 'info');
        
        // Simulate index rebuilding
        setTimeout(() => {
            this.showMessage('Search index rebuilt successfully', 'success');
        }, 1500);
    }

    backupData() {
        const backupData = {
            properties: JSON.parse(localStorage.getItem('properties')) || [],
            settings: this.getStoredSettings(),
            customUrls: JSON.parse(localStorage.getItem('customURLs')) || [],
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `luxury-rentals-backup-${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showMessage('Backup created successfully', 'success');
    }

    resetAllData() {
        if (!confirm('This will delete ALL data including properties, settings, and custom URLs. This cannot be undone. Continue?')) {
            return;
        }
        
        if (!confirm('Are you absolutely sure? This will reset everything to default state.')) {
            return;
        }
        
        localStorage.clear();
        this.loadSettings();
        this.updateAnalytics();
        this.loadCustomURLs();
        
        this.showMessage('All data has been reset', 'success');
    }

    showMessage(text, type = 'info') {
        const messagesDiv = document.getElementById('admin-messages');
        const messageText = document.getElementById('message-text');
        
        if (!messagesDiv || !messageText) return;
        
        messageText.textContent = text;
        messagesDiv.className = `admin-messages ${type}`;
        messagesDiv.style.display = 'block';
        
        setTimeout(() => {
            messagesDiv.style.display = 'none';
        }, 5000);
    }
}

// Initialize admin panel when page loads
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});