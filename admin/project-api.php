<?php
/**
 * Project Management API for SEBA Engineering
 * Handle CRUD operations for projects with secure authentication
 */

// Include authentication controller
require_once 'auth.php';

// Check if user is authenticated
if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    response(false, 'Authentication required');
}

// File paths
$dataFile = '../assets/data/projects.json';

// Ensure projects.json exists
if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([]));
}

// Helper function to read projects
function getProjects() {
    global $dataFile;
    $content = file_get_contents($dataFile);
    return json_decode($content, true) ?: [];
}

// Helper function to save projects
function saveProjects($projects) {
    global $dataFile;
    file_put_contents($dataFile, json_encode($projects, JSON_PRETTY_PRINT));
}

// GET - Retrieve projects
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $projects = getProjects();
    response(true, 'Projects retrieved successfully', $projects);
}

// POST - Add a new project or update existing one
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Verify CSRF token
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        response(false, 'Security validation failed');
    }
    
    // Get projects
    $projects = getProjects();
    
    // Check if it's an update or new project
    $projectData = json_decode($_POST['project'] ?? '{}', true);
    
    if (!$projectData) {
        response(false, 'Invalid project data');
    }
    
    // Validate required fields
    if (empty($projectData['title']) || empty($projectData['description'])) {
        response(false, 'Title and description are required');
    }
    
    // Handle project ID for update or create
    if (!empty($projectData['id'])) {
        // Update existing project
        $projectId = $projectData['id'];
        $projectIndex = -1;
        
        // Find project index
        foreach ($projects as $index => $project) {
            if ($project['id'] === $projectId) {
                $projectIndex = $index;
                break;
            }
        }
        
        if ($projectIndex === -1) {
            response(false, 'Project not found');
        }
        
        // Update project
        $projects[$projectIndex] = array_merge($projects[$projectIndex], $projectData);
        
        // Preserve creation date
        if (!isset($projectData['createdAt'])) {
            $projects[$projectIndex]['createdAt'] = $projects[$projectIndex]['createdAt'] ?? date('Y-m-d H:i:s');
        }
        
        // Add update date
        $projects[$projectIndex]['updatedAt'] = date('Y-m-d H:i:s');
        
    } else {
        // Create new project
        $projectData['id'] = uniqid('prj_');
        $projectData['createdAt'] = date('Y-m-d H:i:s');
        $projectData['updatedAt'] = date('Y-m-d H:i:s');
        
        // Add project to array
        $projects[] = $projectData;
    }
    
    // Save projects
    saveProjects($projects);
    
    response(true, 'Project saved successfully', [
        'project' => $projectData,
        'csrf_token' => $_SESSION['csrf_token']
    ]);
}

// DELETE - Remove a project
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Parse DELETE request body
    parse_str(file_get_contents('php://input'), $deleteData);
    
    // Verify CSRF token
    if (!isset($deleteData['csrf_token']) || $deleteData['csrf_token'] !== $_SESSION['csrf_token']) {
        response(false, 'Security validation failed');
    }
    
    // Get project ID
    $projectId = $deleteData['id'] ?? '';
    
    if (empty($projectId)) {
        response(false, 'Project ID is required');
    }
    
    // Get projects
    $projects = getProjects();
    $projectIndex = -1;
    
    // Find project index
    foreach ($projects as $index => $project) {
        if ($project['id'] === $projectId) {
            $projectIndex = $index;
            break;
        }
    }
    
    if ($projectIndex === -1) {
        response(false, 'Project not found');
    }
    
    // Remove project from array
    array_splice($projects, $projectIndex, 1);
    
    // Save projects
    saveProjects($projects);
    
    response(true, 'Project deleted successfully', [
        'csrf_token' => $_SESSION['csrf_token']
    ]);
}
