/**
 * Project Management System
 * Handles loading, displaying, and filtering projects from a JSON data source
 */

class ProjectManager {
  constructor() {
    this.projects = [];
    this.loaded = false;
    this.dataPath = 'assets/data/projects.json';
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
      this.loaded = true;
      return this.projects;
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  /**
   * Get all projects
   */
  async getAllProjects() {
    if (!this.loaded) {
      await this.loadProjects();
    }
    return this.projects;
  }

  /**
   * Get projects by category
   */
  async getProjectsByCategory(category) {
    if (!this.loaded) {
      await this.loadProjects();
    }
    
    if (category === 'all') {
      return this.projects;
    }
    
    return this.projects.filter(project => project.category === category);
  }

  /**
   * Get featured projects
   */
  async getFeaturedProjects() {
    if (!this.loaded) {
      await this.loadProjects();
    }
    
    return this.projects.filter(project => project.featured);
  }

  /**
   * Search projects by term
   */
  async searchProjects(term) {
    if (!this.loaded) {
      await this.loadProjects();
    }
    
    const searchTerm = term.toLowerCase();
    return this.projects.filter(project => {
      return (
        project.title.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm) ||
        project.location.toLowerCase().includes(searchTerm) ||
        project.category.toLowerCase().includes(searchTerm)
      );
    });
  }

  /**
   * Get a project by ID
   */
  async getProjectById(id) {
    if (!this.loaded) {
      await this.loadProjects();
    }
    
    return this.projects.find(project => project.id === id);
  }
}

// Initialize the project manager
const projectManager = new ProjectManager();

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
  // Check if we're on the projects page
  if (document.querySelector('.projects-grid') || document.querySelector('.projects-list')) {
    initProjectsPage();
  }
});

/**
 * Initialize the projects page
 */
async function initProjectsPage() {
  // Load projects
  await projectManager.loadProjects();
  
  // Render featured projects
  const featuredProjectsContainer = document.querySelector('.projects-grid');
  if (featuredProjectsContainer) {
    const featuredProjects = await projectManager.getFeaturedProjects();
    renderFeaturedProjects(featuredProjects, featuredProjectsContainer);
  }
  
  // Render category projects
  renderCategoryProjects('industrial');
  renderCategoryProjects('commercial');
  renderCategoryProjects('infrastructure');
  renderCategoryProjects('special');
  
  // Set up event listeners for filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', async function() {
      const filterValue = this.getAttribute('data-filter');
      const filteredProjects = await projectManager.getProjectsByCategory(filterValue);
      
      // Get all category sections
      const categorySections = document.querySelectorAll('.project-category-section');
      
      if (filterValue === 'all') {
        // Show all category sections
        categorySections.forEach(section => {
          section.style.display = 'block';
        });
      } else {
        // Show only the selected category section
        categorySections.forEach(section => {
          if (section.id === filterValue) {
            section.style.display = 'block';
          } else {
            section.style.display = 'none';
          }
        });
      }
    });
  });
  
  // Set up search functionality
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('project-search');
  
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', async function() {
      const searchTerm = searchInput.value.trim();
      if (searchTerm === '') {
        return;
      }
      
      const searchResults = await projectManager.searchProjects(searchTerm);
      showSearchResults(searchResults);
    });
    
    // Allow search on Enter key press
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchBtn.click();
      }
    });
  }
}

/**
 * Render featured projects
 */
function renderFeaturedProjects(projects, container) {
  container.innerHTML = '';
  
  projects.forEach(project => {
    const projectElement = document.createElement('div');
    projectElement.className = 'project-item';
    projectElement.innerHTML = `
      <div class="project-image">
        <img src="${project.image}" alt="${project.title}" loading="lazy">
      </div>
      <div class="project-content">
        <h3>${project.title}</h3>
        <p class="project-location">${project.location}</p>
        <p class="project-description">${project.description}</p>
        <a href="#" class="project-link" data-project-id="${project.id}">View Project <i class="fas fa-arrow-right"></i></a>
      </div>
    `;
    
    container.appendChild(projectElement);
  });
  
  // Add event listeners to project links
  const projectLinks = container.querySelectorAll('.project-link');
  projectLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const projectId = this.getAttribute('data-project-id');
      showProjectDetails(projectId);
    });
  });
}

/**
 * Render projects for a specific category
 */
async function renderCategoryProjects(category) {
  const categoryContainer = document.querySelector(`#${category} .projects-list`);
  if (!categoryContainer) return;
  
  const categoryProjects = await projectManager.getProjectsByCategory(category);
  
  categoryContainer.innerHTML = '';
  
  categoryProjects.forEach(project => {
    const projectElement = document.createElement('div');
    projectElement.className = 'project-card';
    projectElement.innerHTML = `
      <img src="${project.image}" alt="${project.title}">
      <div class="project-card-content">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <a href="#" class="btn-outline" data-project-id="${project.id}">View details</a>
      </div>
    `;
    
    categoryContainer.appendChild(projectElement);
  });
  
  // Add event listeners to project links
  const projectLinks = categoryContainer.querySelectorAll('.btn-outline');
  projectLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const projectId = this.getAttribute('data-project-id');
      showProjectDetails(projectId);
    });
  });
}

/**
 * Show search results
 */
function showSearchResults(projects) {
  // Hide all category sections
  const categorySections = document.querySelectorAll('.project-category-section');
  categorySections.forEach(section => {
    section.style.display = 'none';
  });
  
  // Create and show a search results section
  let searchResultsSection = document.getElementById('search-results');
  if (!searchResultsSection) {
    searchResultsSection = document.createElement('section');
    searchResultsSection.id = 'search-results';
    searchResultsSection.className = 'project-category-section';
    
    // Insert after the filter section
    const filterSection = document.querySelector('.project-filter');
    filterSection.parentNode.insertBefore(searchResultsSection, filterSection.nextSibling);
  }
  
  searchResultsSection.innerHTML = `
    <div class="container">
      <h2 class="section-header">Search Results</h2>
      <p class="section-desc">Found ${projects.length} result(s)</p>
      <div class="projects-list" id="search-results-list"></div>
    </div>
  `;
  
  // Show the search results section
  searchResultsSection.style.display = 'block';
  
  // Render the search results
  const searchResultsList = document.getElementById('search-results-list');
  
  if (projects.length === 0) {
    searchResultsList.innerHTML = `
      <div class="no-results">
        <p>No projects found matching your search.</p>
      </div>
    `;
    return;
  }
  
  projects.forEach(project => {
    const projectElement = document.createElement('div');
    projectElement.className = 'project-card';
    projectElement.innerHTML = `
      <img src="${project.image}" alt="${project.title}">
      <div class="project-card-content">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <a href="#" class="btn-outline" data-project-id="${project.id}">View details</a>
      </div>
    `;
    
    searchResultsList.appendChild(projectElement);
  });
  
  // Add event listeners to project links
  const projectLinks = searchResultsList.querySelectorAll('.btn-outline');
  projectLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const projectId = this.getAttribute('data-project-id');
      showProjectDetails(projectId);
    });
  });
}

/**
 * Show project details in a modal
 */
async function showProjectDetails(projectId) {
  const project = await projectManager.getProjectById(projectId);
  if (!project) return;
  
  // Create modal if it doesn't exist
  let modal = document.getElementById('project-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'project-modal';
    modal.className = 'project-modal';
    document.body.appendChild(modal);
  }
  
  // Set modal content
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <div class="modal-header">
        <h2>${project.title}</h2>
        <p class="project-location">${project.location}</p>
      </div>
      <div class="modal-body">
        <div class="modal-image">
          <img src="${project.image}" alt="${project.title}">
        </div>
        <div class="modal-details">
          <p>${project.description}</p>
          <div class="project-metadata">
            <p><strong>Category:</strong> ${project.category.charAt(0).toUpperCase() + project.category.slice(1)}</p>
            <p><strong>Completed:</strong> ${formatDate(project.date)}</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Show the modal
  modal.style.display = 'block';
  
  // Add event listener to close button
  const closeBtn = modal.querySelector('.close-modal');
  closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
}

/**
 * Format date from ISO format to display format
 */
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}
