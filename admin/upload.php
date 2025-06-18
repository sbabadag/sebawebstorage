<?php
/**
 * Secure file upload handler for the SEBA Engineering project management system
 * Includes authentication and security checks
 */

// Include authentication controller
require_once 'auth.php';

// Check if user is authenticated
if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Authentication required'
    ]);
    exit;
}

// Verify CSRF token
if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Security validation failed'
    ]);
    exit;
}

// Define allowed file types and max size
$allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
$max_size = 5 * 1024 * 1024; // 5MB

// Create response array
$response = [
    'success' => false,
    'message' => '',
    'filePath' => '',
    'csrf_token' => $_SESSION['csrf_token']
];

// Check if file was uploaded
if (!isset($_FILES['projectImage']) || !$_FILES['projectImage']['tmp_name']) {
    $response['message'] = 'No file uploaded';
    echo json_encode($response);
    exit;
}

$file = $_FILES['projectImage'];

// Check for upload errors
if ($file['error'] !== 0) {
    $response['message'] = 'Upload error: ' . $file['error'];
    echo json_encode($response);
    exit;
}

// Validate file type
$file_type = mime_content_type($file['tmp_name']);
if (!in_array($file_type, $allowed_types)) {
    $response['message'] = 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images only.';
    echo json_encode($response);
    exit;
}

// Validate file size
if ($file['size'] > $max_size) {
    $response['message'] = 'File is too large. Maximum size is 5MB.';
    echo json_encode($response);
    exit;
}

// Generate a unique filename to prevent overwrites
$file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$unique_name = uniqid() . '.' . $file_extension;

// Define upload directory (relative to the current script)
$upload_dir = '../assets/images/projects/';

// Create directory if it doesn't exist
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

$upload_path = $upload_dir . $unique_name;

// Move the file
if (move_uploaded_file($file['tmp_name'], $upload_path)) {
    $response['success'] = true;
    $response['message'] = 'File uploaded successfully';
    $response['filePath'] = 'assets/images/projects/' . $unique_name; // Return path relative to site root
    echo json_encode($response);
} else {
    $response['message'] = 'Failed to move uploaded file';
    echo json_encode($response);
}
