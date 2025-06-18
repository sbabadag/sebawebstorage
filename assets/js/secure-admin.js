/**
 * Enhanced and Secured Project Admin Management System
 * Uses server-side authentication and management
 */

// Main admin class
class SecureProjectAdmin {
  constructor() {
    this.projects = [];
    this.isLoading = false;
    this.csrfToken = '';
    this.authenticated = false;
    this.currentProjectId = null;
    this.setupEventListeners();
  }

  /**
   * Initial setup and event listeners
   */
  setupEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
      // Login form
      const loginForm = document.getElementById('login-form');
      if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleLogin();
        });
      }

      // Logout link
      const logoutLink = document.getElementById('logout-link');
      if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
          e.preventDefault();
          this.logout();
        });
      }

      // Password change form
      const passwordForm = document.getElementById('password-form');
      if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.changePassword();
        });
      }
      
      // Add/Edit project form
      const projectForm = document.getElementById('project-form');
      if (projectForm) {
        projectForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.saveProject();
        });
      }
      
      // Add project button
      const addProjectBtn = document.getElementById('add-project-btn');
      if (addProjectBtn) {
        addProjectBtn.addEventListener('click', () => {
          this.showAddProjectForm();
        });
      }
      
      // Refresh projects button
      const refreshBtn = document.getElementById('refresh-projects-btn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
          this.loadProjects();
        });
      }
      
      // Project image upload
      const projectImage = document.getElementById('project-image');
      if (projectImage) {
        projectImage.addEventListener('change', (e) => {
          this.handleImagePreview(e);
        });
      }

      // Change password button
      const changePasswordBtn = document.getElementById('change-password-btn');
      if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
          this.showPasswordForm();
        });
      }
      
      // Check authentication status
      this.checkAuthStatus();
    });
  }

  /**
   * Check if user is authenticated with the server
   */
  async checkAuthStatus() {
    try {
      const response = await fetch('auth.php?action=status');
      const data = await response.json();
      
      this.authenticated = data.success;
      
      if (data.success) {
        this.csrfToken = data.data.csrf_token;
        this.initializeAdminPanel();
      } else {
        this.showLoginForm();
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      this.showLoginForm();
    }
  }

  /**
   * Show login form
   */
  showLoginForm() {
    const adminSection = document.querySelector('.admin-section');
    const loginRequired = document.getElementById('login-required');
    
    if (adminSection && loginRequired) {
      adminSection.style.display = 'none';
      loginRequired.style.display = 'block';
      
      // Hide any error messages
      const loginError = document.getElementById('login-error');
      if (loginError) {
        loginError.style.display = 'none';
      }
    }
  }

  /**
   * Handle login form submission
   */
  async handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
      this.showLoginError('Username and password are required');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('action', 'login');
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await fetch('auth.php', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.authenticated = true;
        this.csrfToken = data.data.csrf_token;
        this.initializeAdminPanel();
      } else {
        this.showLoginError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showLoginError('An error occurred during login');
    }
  }
  
  /**
   * Show login error message
   */
  showLoginError(message) {
    const loginError = document.getElementById('login-error');
    if (loginError) {
      loginError.textContent = message;
      loginError.style.display = 'block';
    }
  }
  
  /**
   * Initialize admin panel after successful authentication
   */
  initializeAdminPanel() {
    const adminSection = document.querySelector('.admin-section');
    const loginRequired = document.getElementById('login-required');
    
    if (adminSection && loginRequired) {
      adminSection.style.display = 'block';
      loginRequired.style.display = 'none';
    }
    
    // Load projects
    this.loadProjects();
    
    // Setup modal close buttons
    document.querySelectorAll('.modal-close').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(modal => {
          modal.classList.remove('active');
        });
      });
    });
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      const formData = new FormData();
      formData.append('action', 'logout');
      
      await fetch('auth.php', {
        method: 'POST',
        body: formData
      });
      
      // Redirect to refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      alert('An error occurred during logout');
    }
  }

  /**
   * Show change password form
   */
  showPasswordForm() {
    const modal = document.getElementById('password-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  /**
   * Change password
   */
  async changePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('All fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('action', 'change_password');
      formData.append('current_password', currentPassword);
      formData.append('new_password', newPassword);
      formData.append('confirm_password', confirmPassword);
      formData.append('csrf_token', this.csrfToken);
      
      const response = await fetch('auth.php', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update CSRF token
        this.csrfToken = data.data.csrf_token;
        
        alert('Password changed successfully');
        document.getElementById('password-modal').classList.remove('active');
        
        // Clear form
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
      } else {
        alert(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      alert('An error occurred');
    }
  }

  /**
   * Load projects from server
   */
  async loadProjects() {
    if (!this.authenticated || this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      const response = await fetch('project-api.php');
      const data = await response.json();
      
      if (data.success) {
        this.projects = data.data || [];
        this.renderProjects();
      } else {
        console.error('Failed to load projects:', data.message);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Render projects in the table
   */
  renderProjects() {
    const container = document.getElementById('projects-table-container');
    if (!container) return;
    
    if (this.projects.length === 0) {
      container.innerHTML = '<div class="empty-state">No projects found. Click "Add New Project" to create one.</div>';
      return;
    }
    
    let html = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Category</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    this.projects.forEach(project => {
      html += `
        <tr>
          <td>
            <div class="project-thumb">
              <img src="${project.image ? '../' + project.image : '../assets/images/placeholder.jpg'}" alt="${project.title}" />
            </div>
          </td>
          <td>${project.title}</td>
          <td>${project.category || 'N/A'}</td>
          <td>${this.formatDate(project.date)}</td>
          <td class="actions">
            <button class="admin-btn edit-project-btn" data-id="${project.id}">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="admin-btn danger delete-project-btn" data-id="${project.id}">
              <i class="fas fa-trash-alt"></i> Delete
            </button>
          </td>
        </tr>
      `;
    });
    
    html += `
        </tbody>
      </table>
    `;
    
    container.innerHTML = html;
    
    // Add event listeners to buttons
    document.querySelectorAll('.edit-project-btn').forEach(button => {
      button.addEventListener('click', () => {
        const projectId = button.getAttribute('data-id');
        this.showEditProjectForm(projectId);
      });
    });
    
    document.querySelectorAll('.delete-project-btn').forEach(button => {
      button.addEventListener('click', () => {
        const projectId = button.getAttribute('data-id');
        this.confirmDeleteProject(projectId);
      });
    });
  }

  /**
   * Show add project form
   */
  showAddProjectForm() {
    // Reset form
    const form = document.getElementById('project-form');
    if (form) form.reset();
    
    // Clear current project ID
    this.currentProjectId = null;
    
    // Reset image preview
    const preview = document.getElementById('image-preview');
    if (preview) {
      preview.style.backgroundImage = '';
      preview.classList.remove('has-image');
    }
    
    // Set default date
    const today = new Date();
    document.getElementById('project-date').value = this.formatDateForInput(today);
    
    // Show modal
    const modal = document.getElementById('project-modal');
    if (modal) {
      document.getElementById('project-modal-title').textContent = 'Add New Project';
      modal.classList.add('active');
    }
  }

  /**
   * Show edit project form
   */
  showEditProjectForm(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;
    
    this.currentProjectId = projectId;
    
    // Fill form
    document.getElementById('project-title').value = project.title || '';
    document.getElementById('project-description').value = project.description || '';
    document.getElementById('project-category').value = project.category || '';
    document.getElementById('project-date').value = project.date ? this.formatDateForInput(new Date(project.date)) : '';
    document.getElementById('project-location').value = project.location || '';
    document.getElementById('project-client').value = project.client || '';
    
    // Update image preview
    const preview = document.getElementById('image-preview');
    if (preview) {
      if (project.image) {
        preview.style.backgroundImage = `url('../${project.image}')`;
        preview.classList.add('has-image');
      } else {
        preview.style.backgroundImage = '';
        preview.classList.remove('has-image');
      }
    }
    
    // Show modal
    const modal = document.getElementById('project-modal');
    if (modal) {
      document.getElementById('project-modal-title').textContent = 'Edit Project';
      modal.classList.add('active');
    }
  }

  /**
   * Handle image preview
   */
  handleImagePreview(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const preview = document.getElementById('image-preview');
    if (!preview) return;
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
      preview.style.backgroundImage = `url('${event.target.result}')`;
      preview.classList.add('has-image');
    };
    
    reader.readAsDataURL(file);
  }

  /**
   * Save project
   */
  async saveProject() {
    if (!this.authenticated) return;
    
    const form = document.getElementById('project-form');
    if (!form) return;
    
    const title = document.getElementById('project-title').value;
    const description = document.getElementById('project-description').value;
    
    if (!title || !description) {
      alert('Title and description are required');
      return;
    }
    
    // Prepare project data
    const projectData = {
      title,
      description,
      category: document.getElementById('project-category').value,
      date: document.getElementById('project-date').value,
      location: document.getElementById('project-location').value,
      client: document.getElementById('project-client').value
    };
    
    // Add ID if editing
    if (this.currentProjectId) {
      projectData.id = this.currentProjectId;
    }
    
    // Get image file
    const imageFile = document.getElementById('project-image').files[0];
    
    try {
      let imagePath = null;
      
      // Upload image if selected
      if (imageFile) {
        imagePath = await this.uploadImage(imageFile);
        if (!imagePath) {
          return; // Upload failed
        }
        projectData.image = imagePath;
      } else if (this.currentProjectId) {
        // Keep existing image for edit
        const existingProject = this.projects.find(p => p.id === this.currentProjectId);
        if (existingProject && existingProject.image) {
          projectData.image = existingProject.image;
        }
      }
      
      // Save project
      const formData = new FormData();
      formData.append('project', JSON.stringify(projectData));
      formData.append('csrf_token', this.csrfToken);
      
      const response = await fetch('project-api.php', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update CSRF token
        this.csrfToken = data.data.csrf_token;
        
        // Close modal
        document.getElementById('project-modal').classList.remove('active');
        
        // Reload projects
        this.loadProjects();
      } else {
        alert(data.message || 'Failed to save project');
      }
    } catch (error) {
      console.error('Save project error:', error);
      alert('An error occurred while saving the project');
    }
  }

  /**
   * Upload image
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('projectImage', file);
    formData.append('csrf_token', this.csrfToken);
    
    try {
      const response = await fetch('upload.php', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update CSRF token
        this.csrfToken = data.csrf_token;
        return data.filePath;
      } else {
        alert(data.message || 'Failed to upload image');
        return null;
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred while uploading the image');
      return null;
    }
  }

  /**
   * Confirm delete project
   */
  confirmDeleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.deleteProject(projectId);
    }
  }

  /**
   * Delete project
   */
  async deleteProject(projectId) {
    if (!this.authenticated) return;
    
    try {
      const response = await fetch(`project-api.php?id=${projectId}&csrf_token=${encodeURIComponent(this.csrfToken)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `id=${encodeURIComponent(projectId)}&csrf_token=${encodeURIComponent(this.csrfToken)}`
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update CSRF token
        this.csrfToken = data.data.csrf_token;
        
        // Reload projects
        this.loadProjects();
      } else {
        alert(data.message || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Delete project error:', error);
      alert('An error occurred while deleting the project');
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format date for input field
   */
  formatDateForInput(date) {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
}

// Initialize the admin system
const secureAdmin = new SecureProjectAdmin();
