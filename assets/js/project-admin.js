/**
 * Project Admin Management System
 * Handles admin functionality for managing projects
 */

// Authentication and security settings
const AUTH_KEY = 'seba_admin_auth';
const DEFAULT_USERNAME = 'admin'; // Change this in production
const DEFAULT_PASSWORD = 'seba2025'; // Change this in production

class ProjectAdmin {
  constructor() {
    this.projects = [];
    this.dataPath = '../assets/data/projects.json';
    this.authToken = localStorage.getItem(AUTH_KEY);
    this.currentProjectId = null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.authToken;
  }

  /**
   * Login user
   */
  login(username, password) {
    // In a real application, this would be a server request
    if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      const token = btoa(username + ':' + new Date().getTime());
      localStorage.setItem(AUTH_KEY, token);
      this.authToken = token;
      return true;
    }
    return false;
  }

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem(AUTH_KEY);
    this.authToken = null;
    window.location.reload();
  }

  /**
   * Load projects from JSON file
   */
  async loadProjects() {
    try {
      const response = await fetch(this.dataPath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.projects = data.projects || [];
      return this.projects;
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  /**
   * Save projects to JSON file
   * In a real application, this would be a server request
   */
  async saveProjects() {
    try {
      const data = { projects: this.projects };
      
      // This is a simulation of saving to server
      // In a real app, you would make an API request here
      console.log('Projects saved:', data);
      
      // For demo purposes only
      localStorage.setItem('projects_backup', JSON.stringify(data));
      
      alert('Projects saved successfully! (Note: In this demo, changes are stored in browser only)');
      return true;
    } catch (error) {
      console.error('Error saving projects:', error);
      alert('Error saving projects. See console for details.');
      return false;
    }
  }

  /**
   * Add a new project
   */
  addProject(projectData) {
    const newId = this.generateProjectId(projectData.title);
    
    const newProject = {
      id: newId,
      title: projectData.title,
      location: projectData.location,
      category: projectData.category,
      description: projectData.description,
      image: projectData.image,
      featured: projectData.featured || false,
      date: projectData.date
    };
    
    this.projects.push(newProject);
    return this.saveProjects();
  }

  /**
   * Update an existing project
   */
  updateProject(projectId, projectData) {
    const index = this.projects.findIndex(p => p.id === projectId);
    if (index === -1) return false;
    
    this.projects[index] = {
      ...this.projects[index],
      title: projectData.title,
      location: projectData.location,
      category: projectData.category,
      description: projectData.description,
      image: projectData.image,
      featured: projectData.featured || false,
      date: projectData.date
    };
    
    return this.saveProjects();
  }

  /**
   * Delete a project
   */
  deleteProject(projectId) {
    const index = this.projects.findIndex(p => p.id === projectId);
    if (index === -1) return false;
    
    this.projects.splice(index, 1);
    return this.saveProjects();
  }

  /**
   * Generate a project ID from the title
   */
  generateProjectId(title) {
    const base = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    // Add a timestamp to ensure uniqueness
    return `${base}-${Date.now().toString().substring(8)}`;
  }

  /**
   * Format date for input fields (YYYY-MM-DD)
   */
  formatDateForInput(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
}

// Initialize the admin system
const projectAdmin = new ProjectAdmin();

// DOM elements
let projectsTableBody;
let projectFormModal;
let confirmDeleteModal;
let loginRequired;

// Initialize the admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
  // Get DOM elements
  projectsTableBody = document.getElementById('projects-table-body');
  projectFormModal = document.getElementById('project-form-modal');
  confirmDeleteModal = document.getElementById('confirm-delete-modal');
  loginRequired = document.getElementById('login-required');
  
  // Check authentication
  if (!projectAdmin.isAuthenticated()) {
    // Show login form
    document.querySelector('.admin-section').style.display = 'none';
    loginRequired.style.display = 'block';
    
    // Handle login form submission
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      if (projectAdmin.login(username, password)) {
        window.location.reload();
      } else {
        document.getElementById('login-error').style.display = 'block';
      }
    });
    
    return;
  }
  
  // Load projects
  await projectAdmin.loadProjects();
  
  // Render projects table
  renderProjectsTable();
    // Set up event listeners
  setupEventListeners();
  
  // Initialize image upload functionality
  initImageUpload();
});

/**
 * Render the projects table
 */
function renderProjectsTable() {
  const projects = projectAdmin.projects;
  
  projectsTableBody.innerHTML = '';
  
  if (projects.length === 0) {
    projectsTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-message">No projects found. Add your first project!</td>
      </tr>
    `;
    return;
  }
  
  projects.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(project => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>
        <img src="../${project.image}" alt="${project.title}" class="img-preview">
      </td>
      <td>${project.title}</td>
      <td>${project.category}</td>
      <td>${project.location}</td>
      <td>${project.featured ? 'Yes' : 'No'}</td>
      <td>${new Date(project.date).toLocaleDateString()}</td>
      <td>
        <button class="admin-btn edit-project-btn" data-id="${project.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="admin-btn danger delete-project-btn" data-id="${project.id}">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    
    projectsTableBody.appendChild(row);
  });
  
  // Add event listeners to buttons
  document.querySelectorAll('.edit-project-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const projectId = this.getAttribute('data-id');
      openEditProjectModal(projectId);
    });
  });
  
  document.querySelectorAll('.delete-project-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const projectId = this.getAttribute('data-id');
      openDeleteConfirmModal(projectId);
    });
  });
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Add project button
  document.getElementById('add-project-btn').addEventListener('click', function() {
    openAddProjectModal();
  });
  
  // Refresh projects button
  document.getElementById('refresh-projects-btn').addEventListener('click', async function() {
    await projectAdmin.loadProjects();
    renderProjectsTable();
  });
  
  // Logout link
  document.getElementById('logout-link').addEventListener('click', function(e) {
    e.preventDefault();
    projectAdmin.logout();
  });
  
  // Project form submission
  document.getElementById('project-form').addEventListener('submit', function(e) {
    e.preventDefault();
    saveProject();
  });
  
  // Cancel project button
  document.getElementById('cancel-project-btn').addEventListener('click', function() {
    closeProjectFormModal();
  });
  
  // Close project form modal
  document.querySelector('#project-form-modal .close-modal').addEventListener('click', function() {
    closeProjectFormModal();
  });
  
  // Cancel delete button
  document.getElementById('cancel-delete-btn').addEventListener('click', function() {
    closeDeleteConfirmModal();
  });
  
  // Confirm delete button
  document.getElementById('confirm-delete-btn').addEventListener('click', function() {
    deleteProject();
  });
}

/**
 * Open the modal to add a new project
 */
function openAddProjectModal() {
  // Reset form
  document.getElementById('project-form').reset();
  document.getElementById('project-id').value = '';
  document.getElementById('modal-title').textContent = 'Add New Project';
  
  // Reset image upload elements
  const imagePreview = document.getElementById('image-preview');
  const uploadInstructions = document.querySelector('.upload-instructions');
  const imagePathDisplay = document.getElementById('image-path-display');
  const uploadProgress = document.querySelector('.upload-progress');
  
  imagePreview.style.display = 'none';
  uploadInstructions.style.display = 'block';
  imagePathDisplay.textContent = '';
  uploadProgress.style.display = 'none';
  document.getElementById('project-image').value = '';
  
  // Set today's date as default
  const today = new Date();
  document.getElementById('project-date').value = projectAdmin.formatDateForInput(today);
  
  // Show modal
  projectFormModal.style.display = 'block';
}

/**
 * Open the modal to edit an existing project
 */
function openEditProjectModal(projectId) {
  const project = projectAdmin.projects.find(p => p.id === projectId);
  if (!project) return;
  
  // Set form values
  document.getElementById('project-id').value = project.id;
  document.getElementById('project-title').value = project.title;
  document.getElementById('project-location').value = project.location;
  document.getElementById('project-category').value = project.category;
  document.getElementById('project-description').value = project.description;
  document.getElementById('project-date').value = projectAdmin.formatDateForInput(project.date);
  document.getElementById('project-image').value = project.image;
  document.getElementById('project-featured').checked = project.featured;
  
  // Display current image
  const imagePreview = document.getElementById('image-preview');
  const uploadInstructions = document.querySelector('.upload-instructions');
  const imagePathDisplay = document.getElementById('image-path-display');
  
  if (project.image) {
    imagePreview.src = '../' + project.image;
    imagePreview.style.display = 'block';
    uploadInstructions.style.display = 'none';
    imagePathDisplay.textContent = `Current image: ${project.image}`;
  } else {
    imagePreview.style.display = 'none';
    uploadInstructions.style.display = 'block';
    imagePathDisplay.textContent = '';
  }
  
  // Update modal title
  document.getElementById('modal-title').textContent = 'Edit Project';
  
  // Show modal
  projectFormModal.style.display = 'block';
}

/**
 * Close the project form modal
 */
function closeProjectFormModal() {
  projectFormModal.style.display = 'none';
}

/**
 * Save the project (add new or update existing)
 */
async function saveProject() {
  const projectId = document.getElementById('project-id').value;
  const projectData = {
    title: document.getElementById('project-title').value,
    location: document.getElementById('project-location').value,
    category: document.getElementById('project-category').value,
    description: document.getElementById('project-description').value,
    date: document.getElementById('project-date').value,
    image: document.getElementById('project-image').value,
    featured: document.getElementById('project-featured').checked
  };
  
  let success;
  
  if (projectId) {
    // Update existing project
    success = await projectAdmin.updateProject(projectId, projectData);
  } else {
    // Add new project
    success = await projectAdmin.addProject(projectData);
  }
  
  if (success) {
    closeProjectFormModal();
    renderProjectsTable();
  }
}

/**
 * Open the delete confirmation modal
 */
function openDeleteConfirmModal(projectId) {
  projectAdmin.currentProjectId = projectId;
  confirmDeleteModal.style.display = 'block';
}

/**
 * Close the delete confirmation modal
 */
function closeDeleteConfirmModal() {
  confirmDeleteModal.style.display = 'none';
  projectAdmin.currentProjectId = null;
}

/**
 * Delete the project
 */
async function deleteProject() {
  if (!projectAdmin.currentProjectId) return;
  
  const success = await projectAdmin.deleteProject(projectAdmin.currentProjectId);
  
  if (success) {
    closeDeleteConfirmModal();
    renderProjectsTable();
  }
}

/**
 * Initialize image upload functionality
 */
function initImageUpload() {
  const fileInput = document.getElementById('project-image-upload');
  const imagePreview = document.getElementById('image-preview');
  const uploadContainer = document.querySelector('.image-upload-container');
  const uploadInstructions = document.querySelector('.upload-instructions');
  const uploadProgress = document.querySelector('.upload-progress');
  const progressBar = document.querySelector('.progress-bar');
  const progressText = document.querySelector('.progress-text');
  const imagePathDisplay = document.getElementById('image-path-display');
  const hiddenInput = document.getElementById('project-image');

  // Handle file selection
  fileInput.addEventListener('change', function(e) {
    handleFileSelection(this.files);
  });

  // Handle drag and drop
  uploadContainer.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadContainer.classList.add('drag-over');
  });

  uploadContainer.addEventListener('dragleave', function(e) {
    e.preventDefault();
    uploadContainer.classList.remove('drag-over');
  });

  uploadContainer.addEventListener('drop', function(e) {
    e.preventDefault();
    uploadContainer.classList.remove('drag-over');
    handleFileSelection(e.dataTransfer.files);
  });

  // Function to handle file selection
  function handleFileSelection(files) {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Please select an image less than 5MB.');
      return;
    }

    // Display preview
    const reader = new FileReader();
    reader.onload = function(e) {
      imagePreview.src = e.target.result;
      imagePreview.style.display = 'block';
      uploadInstructions.style.display = 'none';
    };
    reader.readAsDataURL(file);

    // Upload the file
    uploadFile(file);
  }
  // Function to upload file
  async function uploadFile(file) {
    const formData = new FormData();
    formData.append('projectImage', file);

    // Show progress bar
    uploadProgress.style.display = 'block';
    progressBar.style.width = '0%';
    progressText.textContent = 'Uploading... 0%';

    try {
      const xhr = new XMLHttpRequest();
      
      // Progress handling
      xhr.upload.addEventListener('progress', function(e) {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          progressBar.style.width = percentComplete + '%';
          progressText.textContent = `Uploading... ${percentComplete}%`;
        }
      });

      // Setup completion handler
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            
            if (response.success) {
              // Update hidden input with the file path
              hiddenInput.value = response.filePath;
              imagePathDisplay.textContent = `File uploaded: ${response.filePath}`;
              
              // Hide progress bar after a delay
              setTimeout(() => {
                uploadProgress.style.display = 'none';
              }, 1500);
            } else {
              handleUploadFallback(file);
            }
          } catch (e) {
            handleUploadFallback(file);
          }
        } else {
          handleUploadFallback(file);
        }
      };

      // Setup error handler
      xhr.onerror = function() {
        handleUploadFallback(file);
      };

      // Set a timeout to detect if the PHP upload is taking too long or not responding
      const timeoutId = setTimeout(() => {
        xhr.abort();
        handleUploadFallback(file);
      }, 5000); // 5 second timeout

      // Send the request
      xhr.open('POST', 'upload.php', true);
      xhr.send(formData);

      // Clear the timeout if the request completes normally
      xhr.onloadend = function() {
        clearTimeout(timeoutId);
      };

    } catch (error) {
      handleUploadFallback(file);
    }
  }
  
  // Fallback for when server upload is not available
  function handleUploadFallback(file) {
    // Generate a client-side path for the file
    const fileName = `image_${new Date().getTime()}_${file.name}`;
    const clientPath = `assets/images/projects/${fileName}`;
    
    // Update hidden input with the file path
    hiddenInput.value = clientPath;
    
    // Update the UI
    uploadProgress.style.display = 'none';
    imagePathDisplay.textContent = `Note: Server upload unavailable. Please manually move this file to: ${clientPath}`;
    imagePathDisplay.style.color = '#ff6600';
    
    // Create a downloadable version of the file
    const reader = new FileReader();
    reader.onload = function(e) {
      const downloadLink = document.createElement('a');
      downloadLink.href = e.target.result;
      downloadLink.download = fileName;
      downloadLink.textContent = 'Download image file';
      downloadLink.className = 'download-link';
      downloadLink.style.display = 'block';
      downloadLink.style.marginTop = '10px';
      downloadLink.style.color = '#0066cc';
      
      // Remove any existing download link
      const existingLink = imagePathDisplay.nextElementSibling;
      if (existingLink && existingLink.className === 'download-link') {
        existingLink.remove();
      }
      
      imagePathDisplay.parentNode.insertBefore(downloadLink, imagePathDisplay.nextSibling);
    };
    reader.readAsDataURL(file);
  }
}
