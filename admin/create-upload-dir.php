<?php
/**
 * Secure directory creation for uploads
 * This script creates necessary upload directories with proper permissions
 */

// Include authentication controller
require_once 'auth.php';

// Check if user is authenticated
if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    response(false, 'Authentication required');
}

// Verify CSRF token
if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    response(false, 'Security validation failed');
}

// Define allowed directories (whitelist)
$allowedDirs = [
    'projects' => '../assets/images/projects/',
    'news' => '../assets/images/news/',
    'team' => '../assets/images/team/',
    'gallery' => '../assets/images/gallery/'
];

// Get directory type from request
$dirType = $_POST['directory'] ?? '';

// Validate directory type
if (!array_key_exists($dirType, $allowedDirs)) {
    response(false, 'Invalid directory type');
}

$targetDir = $allowedDirs[$dirType];

// Create directory if it doesn't exist
if (!is_dir($targetDir)) {
    if (mkdir($targetDir, 0755, true)) {
        response(true, "Directory '{$dirType}' created successfully", [
            'csrf_token' => $_SESSION['csrf_token'],
            'path' => $targetDir
        ]);
    } else {
        response(false, "Failed to create directory '{$dirType}'");
    }
} else {
    response(true, "Directory '{$dirType}' already exists", [
        'csrf_token' => $_SESSION['csrf_token'],
        'path' => $targetDir
    ]);
}
