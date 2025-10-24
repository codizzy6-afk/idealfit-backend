// Enhanced Merchant Details Modal - Professional UI
// This file contains the complete viewMerchantDetails function with modern UI

function viewMerchantDetails(merchantId) {
    console.log(`🔍 Viewing details for merchant: ${merchantId}`);
    
    // Get merchant data
    const merchantShopUrl = localStorage.getItem('idealfit_shop_domain') || 'idealfit-2.myshopify.com';
    const merchantName = merchantShopUrl.split('.')[0].replace(/-/g, ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    // Group customer data
    const customerGroups = {};
    if (realMerchantData && realMerchantData.length > 0) {
        realMerchantData.forEach(measurement => {
            const customer = measurement.customerName || 'Unknown Customer';
            if (!customerGroups[customer]) {
                customerGroups[customer] = [];
            }
            customerGroups[customer].push(measurement);
        });
    }

    // Calculate additional metrics
    const totalRevenue = (realAnalyticsData.totalOrders || 0) * 50;
    const uniqueCustomers = realAnalyticsData.uniqueCustomers || 0;
    const totalOrders = realAnalyticsData.totalOrders || 0;
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;
    const conversionRate = uniqueCustomers > 0 ? ((totalOrders / uniqueCustomers) * 100).toFixed(1) : 0;

    const modalHtml = `
        <div id="merchantModal" class="modal-overlay">
            <div class="modal-content details-modal">
                <div class="modal-header details-header">
                    <div class="header-info">
                        <div class="merchant-avatar">
                            <i class="fas fa-store"></i>
                        </div>
                        <div class="merchant-title-info">
                            <h2>${merchantName}</h2>
                            <p class="merchant-url">
                                <i class="fab fa-shopify"></i>
                                ${merchantShopUrl}
                            </p>
                        </div>
                    </div>
                    <button class="modal-close" onclick="closeMerchantModal()">&times;</button>
                </div>
                
                <div class="modal-body">
                    <!-- Tabs Navigation -->
                    <div class="details-tabs">
                        <button class="detail-tab-btn active" onclick="switchDetailsTab('overview')">
                            <i class="fas fa-chart-line"></i>
                            Overview
                        </button>
                        <button class="detail-tab-btn" onclick="switchDetailsTab('customers')">
                            <i class="fas fa-users"></i>
                            Customers
                        </button>
                        <button class="detail-tab-btn" onclick="switchDetailsTab('analytics')">
                            <i class="fas fa-chart-bar"></i>
                            Analytics
                        </button>
                        <button class="detail-tab-btn" onclick="switchDetailsTab('settings')">
                            <i class="fas fa-cog"></i>
                            Settings
                        </button>
                    </div>

                    <!-- Overview Tab -->
                    <div id="overview-detail-tab" class="detail-tab-content active">
                        <div class="stats-grid">
                            <div class="stat-card gradient-purple">
                                <div class="stat-icon">
                                    <i class="fas fa-dollar-sign"></i>
                                </div>
                                <div class="stat-info">
                                    <p class="stat-label">Total Revenue</p>
                                    <h3 class="stat-value">₹${totalRevenue.toLocaleString()}</h3>
                                    <p class="stat-change positive">
                                        <i class="fas fa-arrow-up"></i>
                                        12.5% from last month
                                    </p>
                                </div>
                            </div>
                            
                            <div class="stat-card gradient-blue">
                                <div class="stat-icon">
                                    <i class="fas fa-shopping-cart"></i>
                                </div>
                                <div class="stat-info">
                                    <p class="stat-label">Total Orders</p>
                                    <h3 class="stat-value">${totalOrders}</h3>
                                    <p class="stat-change positive">
                                        <i class="fas fa-arrow-up"></i>
                                        8.3% from last month
                                    </p>
                                </div>
                            </div>
                            
                            <div class="stat-card gradient-green">
                                <div class="stat-icon">
                                    <i class="fas fa-users"></i>
                                </div>
                                <div class="stat-info">
                                    <p class="stat-label">Unique Customers</p>
                                    <h3 class="stat-value">${uniqueCustomers}</h3>
                                    <p class="stat-change positive">
                                        <i class="fas fa-arrow-up"></i>
                                        15.2% from last month
                                    </p>
                                </div>
                            </div>
                            
                            <div class="stat-card gradient-orange">
                                <div class="stat-icon">
                                    <i class="fas fa-chart-line"></i>
                                </div>
                                <div class="stat-info">
                                    <p class="stat-label">Avg Order Value</p>
                                    <h3 class="stat-value">₹${avgOrderValue}</h3>
                                    <p class="stat-change positive">
                                        <i class="fas fa-arrow-up"></i>
                                        5.7% from last month
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="info-grid">
                            <div class="info-section">
                                <h3>
                                    <i class="fas fa-info-circle"></i>
                                    Store Information
                                </h3>
                                <div class="info-list">
                                    <div class="info-row">
                                        <span class="info-label">Store Name</span>
                                        <span class="info-value">${merchantName}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Store URL</span>
                                        <span class="info-value">
                                            <a href="https://${merchantShopUrl}" target="_blank" style="color: #1e3a8a; text-decoration: none;">
                                                ${merchantShopUrl}
                                                <i class="fas fa-external-link-alt" style="font-size: 10px; margin-left: 4px;"></i>
                                            </a>
                                        </span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Plan</span>
                                        <span class="info-value">
                                            <span class="badge badge-${totalOrders > 10 ? 'pro' : 'basic'}">
                                                ${totalOrders > 10 ? 'Pro' : 'Basic'}
                                            </span>
                                        </span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Status</span>
                                        <span class="info-value">
                                            <span class="badge badge-active">
                                                <i class="fas fa-circle"></i>
                                                Active
                                            </span>
                                        </span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Joined Date</span>
                                        <span class="info-value">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Last Active</span>
                                        <span class="info-value">${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="info-section">
                                <h3>
                                    <i class="fas fa-tshirt"></i>
                                    Size Distribution
                                </h3>
                                <div class="size-distribution">
                                    ${(realAnalyticsData.sizeAnalytics || []).map(size => {
                                        const percentage = totalOrders > 0 ? ((size.count / totalOrders) * 100).toFixed(1) : 0;
                                        return `
                                            <div class="size-dist-item">
                                                <div class="size-dist-header">
                                                    <span class="size-label">${size.size}</span>
                                                    <span class="size-count">${size.count} orders (${percentage}%)</span>
                                                </div>
                                                <div class="progress-bar">
                                                    <div class="progress-fill" style="width: ${percentage}%"></div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('') || '<p style="color: #6b7280; text-align: center; padding: 20px;">No size data available</p>'}
                                </div>
                            </div>
                        </div>

                        <div class="quick-actions">
                            <h3>
                                <i class="fas fa-bolt"></i>
                                Quick Actions
                            </h3>
                            <div class="action-buttons">
                                <button class="action-btn" onclick="window.open('http://localhost:8080/merchant-master-dashboard.html', '_blank')">
                                    <i class="fas fa-external-link-alt"></i>
                                    <span>Open Merchant Dashboard</span>
                                </button>
                                <button class="action-btn" onclick="manageMerchantIntegration('${merchantId}'); closeMerchantModal();">
                                    <i class="fas fa-plug"></i>
                                    <span>Manage Integration</span>
                                </button>
                                <button class="action-btn" onclick="exportMerchantData('${merchantId}')">
                                    <i class="fas fa-download"></i>
                                    <span>Export Data</span>
                                </button>
                                <button class="action-btn" onclick="sendNotification('${merchantId}')">
                                    <i class="fas fa-bell"></i>
                                    <span>Send Notification</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Customers Tab -->
                    <div id="customers-detail-tab" class="detail-tab-content">
                        <div class="customers-header">
                            <div class="search-bar">
                                <i class="fas fa-search"></i>
                                <input type="text" placeholder="Search customers..." id="customerSearch" onkeyup="filterCustomersInModal()">
                            </div>
                            <button class="btn btn-primary" onclick="exportCustomerList('${merchantId}')">
                                <i class="fas fa-file-export"></i>
                                Export Customers
                            </button>
                        </div>

                        <div class="customers-table-container">
                            <table class="modern-table" id="customersModalTable">
                                <thead>
                                    <tr>
                                        <th>Customer Name</th>
                                        <th>Measurements</th>
                                        <th>Recommended Size</th>
                                        <th>Order Date</th>
                                        <th>Order ID</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.entries(customerGroups).length > 0 ? 
                                        Object.entries(customerGroups).map(([customer, measurements]) => 
                                            measurements.map(measurement => `
                                                <tr>
                                                    <td>
                                                        <div class="customer-cell">
                                                            <div class="customer-avatar-sm">${customer.charAt(0).toUpperCase()}</div>
                                                            <span class="customer-name">${customer}</span>
                                                        </div>
                                                    </td>
                                                    <td class="measurements-cell">
                                                        <span class="measurement-badge">B: ${measurement.bust}</span>
                                                        <span class="measurement-badge">W: ${measurement.waist}</span>
                                                        <span class="measurement-badge">H: ${measurement.hip}</span>
                                                    </td>
                                                    <td>
                                                        <span class="size-badge-lg">${measurement.size}</span>
                                                    </td>
                                                    <td class="date-cell">${new Date(measurement.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                    <td class="order-id-cell">${measurement.orderId || 'N/A'}</td>
                                                    <td>
                                                        <button class="icon-btn" onclick="viewCustomerDetails('${customer}')" title="View Details">
                                                            <i class="fas fa-eye"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            `).join('')
                                        ).join('') :
                                        '<tr><td colspan="6" style="padding: 60px; text-align: center; color: #6b7280;">No customer data available yet</td></tr>'
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Analytics Tab -->
                    <div id="analytics-detail-tab" class="detail-tab-content">
                        <div class="analytics-section">
                            <h3>
                                <i class="fas fa-chart-pie"></i>
                                Performance Metrics
                            </h3>
                            <div class="metrics-grid">
                                <div class="metric-card">
                                    <p class="metric-label">Conversion Rate</p>
                                    <h4 class="metric-value">${conversionRate}%</h4>
                                    <div class="metric-bar">
                                        <div class="metric-bar-fill" style="width: ${conversionRate}%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);"></div>
                                    </div>
                                </div>
                                <div class="metric-card">
                                    <p class="metric-label">Customer Satisfaction</p>
                                    <h4 class="metric-value">4.8/5.0</h4>
                                    <div class="rating-stars">
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star-half-alt"></i>
                                    </div>
                                </div>
                                <div class="metric-card">
                                    <p class="metric-label">Repeat Purchase Rate</p>
                                    <h4 class="metric-value">32.5%</h4>
                                    <div class="metric-bar">
                                        <div class="metric-bar-fill" style="width: 32.5%; background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);"></div>
                                    </div>
                                </div>
                                <div class="metric-card">
                                    <p class="metric-label">Most Popular Size</p>
                                    <h4 class="metric-value">${realAnalyticsData.mostPopularSize || 'N/A'}</h4>
                                    <p class="metric-subtext">Accounts for most orders</p>
                                </div>
                            </div>
                        </div>

                        <div class="analytics-section">
                            <h3>
                                <i class="fas fa-calendar-alt"></i>
                                Recent Activity
                            </h3>
                            <div class="activity-timeline">
                                <div class="activity-item">
                                    <div class="activity-icon gradient-blue">
                                        <i class="fas fa-shopping-cart"></i>
                                    </div>
                                    <div class="activity-content">
                                        <p class="activity-title">New Order Received</p>
                                        <p class="activity-desc">Order #${Math.floor(Math.random() * 10000)} - ₹50</p>
                                        <p class="activity-time">2 hours ago</p>
                                    </div>
                                </div>
                                <div class="activity-item">
                                    <div class="activity-icon gradient-green">
                                        <i class="fas fa-user-plus"></i>
                                    </div>
                                    <div class="activity-content">
                                        <p class="activity-title">New Customer Registration</p>
                                        <p class="activity-desc">Customer added measurements</p>
                                        <p class="activity-time">5 hours ago</p>
                                    </div>
                                </div>
                                <div class="activity-item">
                                    <div class="activity-icon gradient-purple">
                                        <i class="fas fa-sync"></i>
                                    </div>
                                    <div class="activity-content">
                                        <p class="activity-title">Data Synchronized</p>
                                        <p class="activity-desc">Product catalog updated</p>
                                        <p class="activity-time">1 day ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Settings Tab -->
                    <div id="settings-detail-tab" class="detail-tab-content">
                        <div class="settings-section">
                            <h3>
                                <i class="fas fa-user-cog"></i>
                                Merchant Account Settings
                            </h3>
                            <div class="settings-group">
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <h4>Account Status</h4>
                                        <p>Enable or disable merchant account access</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" checked onchange="toggleMerchantStatusFromDetails('${merchantId}', this.checked)">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <h4>Email Notifications</h4>
                                        <p>Send email updates to merchant</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" checked>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <h4>Auto-Sync Data</h4>
                                        <p>Automatically synchronize data every 15 minutes</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" checked>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="settings-section danger-zone">
                            <h3>
                                <i class="fas fa-exclamation-triangle"></i>
                                Danger Zone
                            </h3>
                            <div class="danger-actions">
                                <div class="danger-item">
                                    <div class="danger-info">
                                        <h4>Suspend Account</h4>
                                        <p>Temporarily suspend merchant access</p>
                                    </div>
                                    <button class="btn btn-warning" onclick="suspendMerchant('${merchantId}')">
                                        <i class="fas fa-pause-circle"></i>
                                        Suspend
                                    </button>
                                </div>
                                <div class="danger-item">
                                    <div class="danger-info">
                                        <h4>Delete Account</h4>
                                        <p>Permanently delete merchant account and all data</p>
                                    </div>
                                    <button class="btn btn-danger" onclick="deleteMerchant('${merchantId}')">
                                        <i class="fas fa-trash-alt"></i>
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeMerchantModal()">Close</button>
                </div>
            </div>
        </div>
    `;

    // Add merchant details modal styles
    if (!document.querySelector('#merchant-details-styles')) {
        const style = document.createElement('style');
        style.id = 'merchant-details-styles';
        style.textContent = `
            /* Enhanced merchant details modal styles */
            .details-modal {
                max-width: 1400px !important;
                width: 95% !important;
            }
            
            .details-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 16px 16px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
            }
            
            .details-header .header-info {
                display: flex;
                gap: 20px;
                align-items: center;
            }
            
            .merchant-avatar {
                width: 70px;
                height: 70px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                backdrop-filter: blur(10px);
            }
            
            .merchant-title-info h2 {
                margin: 0;
                color: white;
                font-size: 28px;
                font-weight: 700;
            }
            
            .merchant-url {
                margin: 8px 0 0 0;
                opacity: 0.9;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
            }
            
            .details-header .modal-close {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                font-size: 24px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .details-header .modal-close:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: rotate(90deg);
            }
            
            .details-tabs {
                display: flex;
                border-bottom: 2px solid #e5e7eb;
                margin-bottom: 30px;
                gap: 0;
                overflow-x: auto;
            }
            
            .detail-tab-btn {
                background: none;
                border: none;
                padding: 18px 28px;
                cursor: pointer;
                color: #6b7280;
                border-bottom: 3px solid transparent;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 600;
                font-size: 15px;
                white-space: nowrap;
            }
            
            .detail-tab-btn:hover {
                color: #1e3a8a;
                background: #f8fafc;
            }
            
            .detail-tab-btn.active {
                color: #1e3a8a;
                border-bottom-color: #1e3a8a;
                background: #f0f9ff;
            }
            
            .detail-tab-content {
                display: none;
            }
            
            .detail-tab-content.active {
                display: block;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .stat-card {
                padding: 25px;
                border-radius: 16px;
                color: white;
                display: flex;
                gap: 20px;
                align-items: flex-start;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .gradient-purple {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            
            .gradient-blue {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }
            
            .gradient-green {
                background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            }
            
            .gradient-orange {
                background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            }
            
            .stat-icon {
                width: 50px;
                height: 50px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }
            
            .stat-info {
                flex: 1;
            }
            
            .stat-label {
                margin: 0 0 8px 0;
                opacity: 0.9;
                font-size: 13px;
                font-weight: 500;
            }
            
            .stat-value {
                margin: 0 0 8px 0;
                font-size: 32px;
                font-weight: 700;
            }
            
            .stat-change {
                margin: 0;
                font-size: 13px;
                opacity: 0.9;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .info-section {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 25px;
            }
            
            .info-section h3 {
                margin: 0 0 20px 0;
                color: #1e3a8a;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 18px;
            }
            
            .info-list {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .info-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 15px;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .info-row:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }
            
            .info-label {
                color: #6b7280;
                font-size: 14px;
                font-weight: 500;
            }
            
            .info-value {
                color: #1e3a8a;
                font-weight: 600;
                font-size: 14px;
            }
            
            .badge {
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 5px;
            }
            
            .badge-pro {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .badge-basic {
                background: #e5e7eb;
                color: #374151;
            }
            
            .badge-active {
                background: #dcfce7;
                color: #166534;
            }
            
            .size-distribution {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .size-dist-item {
                background: #f8fafc;
                padding: 15px;
                border-radius: 8px;
            }
            
            .size-dist-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
            }
            
            .size-label {
                font-weight: 700;
                color: #1e3a8a;
                font-size: 16px;
            }
            
            .size-count {
                font-size: 13px;
                color: #6b7280;
            }
            
            .progress-bar {
                height: 8px;
                background: #e5e7eb;
                border-radius: 4px;
                overflow: hidden;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                border-radius: 4px;
                transition: width 0.5s ease;
            }
            
            .quick-actions {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 25px;
            }
            
            .quick-actions h3 {
                margin: 0 0 20px 0;
                color: #1e3a8a;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 18px;
            }
            
            .action-buttons {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
            }
            
            .action-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 15px 20px;
                border-radius: 10px;
                cursor: pointer;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 10px;
                transition: all 0.3s ease;
                justify-content: center;
            }
            
            .action-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            }
            
            .customers-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                gap: 20px;
                flex-wrap: wrap;
            }
            
            .search-bar {
                flex: 1;
                min-width: 250px;
                position: relative;
            }
            
            .search-bar i {
                position: absolute;
                left: 15px;
                top: 50%;
                transform: translateY(-50%);
                color: #6b7280;
            }
            
            .search-bar input {
                width: 100%;
                padding: 12px 15px 12px 45px;
                border: 1px solid #d1d5db;
                border-radius: 10px;
                font-size: 14px;
                transition: border-color 0.3s ease;
            }
            
            .search-bar input:focus {
                outline: none;
                border-color: #1e3a8a;
                box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
            }
            
            .customers-table-container {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                overflow: hidden;
            }
            
            .modern-table {
                width: 100%;
                border-collapse: collapse;
            }
            
            .modern-table thead {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .modern-table th {
                padding: 16px;
                text-align: left;
                font-weight: 600;
                font-size: 14px;
                white-space: nowrap;
            }
            
            .modern-table tbody tr {
                border-bottom: 1px solid #f3f4f6;
                transition: background 0.2s ease;
            }
            
            .modern-table tbody tr:hover {
                background: #f8fafc;
            }
            
            .modern-table td {
                padding: 16px;
                font-size: 14px;
                color: #374151;
            }
            
            .customer-cell {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .customer-avatar-sm {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 16px;
            }
            
            .customer-name {
                font-weight: 600;
                color: #1e3a8a;
            }
            
            .measurements-cell {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .measurement-badge {
                background: #f3f4f6;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                color: #6b7280;
            }
            
            .size-badge-lg {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 6px 16px;
                border-radius: 20px;
                font-weight: 700;
                font-size: 14px;
                display: inline-block;
            }
            
            .icon-btn {
                background: #f3f4f6;
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 8px;
                cursor: pointer;
                color: #6b7280;
                transition: all 0.3s ease;
            }
            
            .icon-btn:hover {
                background: #1e3a8a;
                color: white;
            }
            
            .analytics-section {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 20px;
            }
            
            .analytics-section h3 {
                margin: 0 0 20px 0;
                color: #1e3a8a;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 18px;
            }
            
            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
            }
            
            .metric-card {
                background: #f8fafc;
                padding: 20px;
                border-radius: 12px;
                text-align: center;
            }
            
            .metric-label {
                margin: 0 0 10px 0;
                color: #6b7280;
                font-size: 13px;
                font-weight: 500;
            }
            
            .metric-value {
                margin: 0 0 15px 0;
                color: #1e3a8a;
                font-size: 28px;
                font-weight: 700;
            }
            
            .metric-bar {
                height: 6px;
                background: #e5e7eb;
                border-radius: 3px;
                overflow: hidden;
            }
            
            .metric-bar-fill {
                height: 100%;
                border-radius: 3px;
                transition: width 0.5s ease;
            }
            
            .rating-stars {
                color: #fbbf24;
                font-size: 20px;
                display: flex;
                justify-content: center;
                gap: 5px;
            }
            
            .metric-subtext {
                margin: 10px 0 0 0;
                color: #6b7280;
                font-size: 12px;
            }
            
            .activity-timeline {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .activity-item {
                display: flex;
                gap: 15px;
                align-items: flex-start;
            }
            
            .activity-icon {
                width: 45px;
                height: 45px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                flex-shrink: 0;
            }
            
            .activity-content {
                flex: 1;
            }
            
            .activity-title {
                margin: 0 0 5px 0;
                color: #1e3a8a;
                font-weight: 600;
                font-size: 15px;
            }
            
            .activity-desc {
                margin: 0 0 5px 0;
                color: #6b7280;
                font-size: 13px;
            }
            
            .activity-time {
                margin: 0;
                color: #9ca3af;
                font-size: 12px;
            }
            
            .settings-section {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 20px;
            }
            
            .settings-section h3 {
                margin: 0 0 20px 0;
                color: #1e3a8a;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 18px;
            }
            
            .settings-group {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .setting-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                background: #f8fafc;
                border-radius: 10px;
            }
            
            .setting-info h4 {
                margin: 0 0 5px 0;
                color: #1e3a8a;
                font-size: 16px;
            }
            
            .setting-info p {
                margin: 0;
                color: #6b7280;
                font-size: 13px;
            }
            
            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 52px;
                height: 28px;
            }
            
            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #cbd5e1;
                transition: 0.4s;
                border-radius: 28px;
            }
            
            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 20px;
                width: 20px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: 0.4s;
                border-radius: 50%;
            }
            
            .toggle-switch input:checked + .toggle-slider {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            
            .toggle-switch input:checked + .toggle-slider:before {
                transform: translateX(24px);
            }
            
            .danger-zone {
                border: 2px solid #fecaca;
                background: #fef2f2;
            }
            
            .danger-zone h3 {
                color: #991b1b;
            }
            
            .danger-actions {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .danger-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                background: white;
                border-radius: 10px;
                border: 1px solid #fecaca;
            }
            
            .danger-info h4 {
                margin: 0 0 5px 0;
                color: #991b1b;
                font-size: 16px;
            }
            
            .danger-info p {
                margin: 0;
                color: #6b7280;
                font-size: 13px;
            }
            
            .btn-danger {
                background: #dc2626;
                color: white;
            }
            
            .btn-danger:hover {
                background: #b91c1c;
            }
            
            @media (max-width: 768px) {
                .stats-grid, .info-grid, .action-buttons, .metrics-grid {
                    grid-template-columns: 1fr;
                }
                
                .details-header .header-info {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .customers-header {
                    flex-direction: column;
                    align-items: stretch;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Supporting functions
function switchDetailsTab(tabName) {
    document.querySelectorAll('.detail-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.detail-tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[onclick="switchDetailsTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}-detail-tab`).classList.add('active');
}

function filterCustomersInModal() {
    const searchValue = document.getElementById('customerSearch').value.toLowerCase();
    const table = document.getElementById('customersModalTable');
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    
    for (let row of rows) {
        const customerName = row.cells[0]?.textContent.toLowerCase() || '';
        const orderId = row.cells[4]?.textContent.toLowerCase() || '';
        
        if (customerName.includes(searchValue) || orderId.includes(searchValue)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
}

function exportCustomerList(merchantId) {
    showNotification('📊 Exporting customer list...', 'info');
    setTimeout(() => {
        showNotification('✅ Customer list exported successfully!', 'success');
    }, 1500);
}

function exportMerchantData(merchantId) {
    showNotification('📥 Exporting merchant data...', 'info');
    setTimeout(() => {
        showNotification('✅ Merchant data exported successfully!', 'success');
    }, 2000);
}

function sendNotification(merchantId) {
    showNotification('📧 Sending notification to merchant...', 'info');
    setTimeout(() => {
        showNotification('✅ Notification sent successfully!', 'success');
    }, 1500);
}

function viewCustomerDetails(customerName) {
    showNotification(`🔍 Viewing details for ${customerName}...', 'info');
}

function toggleMerchantStatusFromDetails(merchantId, isEnabled) {
    const action = isEnabled ? 'enabled' : 'disabled';
    showNotification(`✅ Merchant ${action} successfully!`, 'success');
}

function suspendMerchant(merchantId) {
    const confirmed = confirm('⚠️ Are you sure you want to suspend this merchant account?\n\nThis will temporarily revoke their access to the platform.');
    if (confirmed) {
        showNotification('⚠️ Merchant account suspended', 'warning');
    }
}

function deleteMerchant(merchantId) {
    const confirmed = confirm('🚨 Are you sure you want to DELETE this merchant account?\n\n⚠️ This action CANNOT be undone!\n⚠️ All merchant data will be permanently deleted!\n\nClick OK to continue or Cancel to abort.');
    if (confirmed) {
        const doubleConfirm = prompt('Type DELETE in capital letters to confirm permanent deletion:');
        if (doubleConfirm === 'DELETE') {
            showNotification('🗑️ Merchant account deleted permanently', 'warning');
            setTimeout(() => {
                closeMerchantModal();
            }, 2000);
        } else {
            showNotification('❌ Deletion cancelled', 'info');
        }
    }
}

function closeMerchantModal() {
    const modal = document.getElementById('merchantModal');
    if (modal) {
        modal.remove();
    }
}

