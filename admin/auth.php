<?php
/**
 * Authentication controller for SEBA Engineering admin area
 * Implements secure server-side authentication with session management
 */

// Start session
session_start();

// Define the auth response format
function response($success, $message = '', $data = null) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Settings file path (outside web root would be better in production)
$settingsFile = __DIR__ . '/settings.php';

// Create settings file if it doesn't exist (first run)
if (!file_exists($settingsFile)) {
    // Generate a secure random salt
    $salt = bin2hex(random_bytes(16));
    
    // Default credentials - should be changed immediately after first login
    $defaultUsername = 'admin';
    $defaultPassword = password_hash('seba2025' . $salt, PASSWORD_DEFAULT);
    
    // Generate a secure random API key for CSRF protection
    $apiKey = bin2hex(random_bytes(32));
    
    // Create settings content
    $settingsContent = "<?php
// Security settings - DO NOT EDIT DIRECTLY
return [
    'salt' => '$salt',
    'username' => '$defaultUsername',
    'password' => '$defaultPassword',
    'api_key' => '$apiKey',
    'last_changed' => '" . date('Y-m-d H:i:s') . "'
];
";
    // Write settings to file
    file_put_contents($settingsFile, $settingsContent);
}

// Load settings
$settings = include($settingsFile);

// Handle login request
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    // Validate CSRF token if not first login
    if (isset($_SESSION['login_attempts']) && $_SESSION['login_attempts'] > 0) {
        if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
            response(false, 'Security validation failed');
        }
    }
    
    // Rate limiting
    if (isset($_SESSION['login_attempts']) && $_SESSION['login_attempts'] >= 5 && 
        (time() - $_SESSION['last_attempt']) < 300) {
        response(false, 'Too many login attempts. Please try again later.');
    }
    
    // Initialize login attempts counter
    if (!isset($_SESSION['login_attempts'])) {
        $_SESSION['login_attempts'] = 0;
    }
    
    // Record this attempt
    $_SESSION['login_attempts']++;
    $_SESSION['last_attempt'] = time();
    
    // Validate credentials
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if ($username === $settings['username'] && 
        password_verify($password . $settings['salt'], $settings['password'])) {
        // Successful login
        $_SESSION['authenticated'] = true;
        $_SESSION['user'] = $username;
        $_SESSION['login_time'] = time();
        $_SESSION['login_attempts'] = 0;
        
        // Generate CSRF token for future requests
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        
        response(true, 'Login successful', [
            'csrf_token' => $_SESSION['csrf_token']
        ]);
    } else {
        // Failed login
        response(false, 'Invalid username or password');
    }
}

// Handle password change
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'change_password') {
    // Verify user is authenticated
    if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
        response(false, 'Authentication required');
    }
    
    // Verify CSRF token
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        response(false, 'Security validation failed');
    }
    
    $currentPassword = $_POST['current_password'] ?? '';
    $newPassword = $_POST['new_password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    
    // Validate current password
    if (!password_verify($currentPassword . $settings['salt'], $settings['password'])) {
        response(false, 'Current password is incorrect');
    }
    
    // Validate new password
    if (strlen($newPassword) < 12) {
        response(false, 'New password must be at least 12 characters');
    }
    
    if ($newPassword !== $confirmPassword) {
        response(false, 'New passwords do not match');
    }
    
    // Update password
    $settings['password'] = password_hash($newPassword . $settings['salt'], PASSWORD_DEFAULT);
    $settings['last_changed'] = date('Y-m-d H:i:s');
    
    // Write updated settings
    $settingsContent = "<?php
// Security settings - DO NOT EDIT DIRECTLY
return [
    'salt' => '{$settings['salt']}',
    'username' => '{$settings['username']}',
    'password' => '{$settings['password']}',
    'api_key' => '{$settings['api_key']}',
    'last_changed' => '{$settings['last_changed']}'
];
";
    file_put_contents($settingsFile, $settingsContent);
    
    // Generate new CSRF token
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    
    response(true, 'Password changed successfully', [
        'csrf_token' => $_SESSION['csrf_token']
    ]);
}

// Check authentication status
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'status') {
    $authenticated = isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true;
    
    // Auto-logout after 30 minutes of inactivity
    if ($authenticated && (time() - $_SESSION['login_time']) > 1800) {
        session_unset();
        session_destroy();
        response(false, 'Session expired');
    }
    
    if ($authenticated) {
        // Update login time
        $_SESSION['login_time'] = time();
        
        response(true, 'Authenticated', [
            'user' => $_SESSION['user'],
            'csrf_token' => $_SESSION['csrf_token']
        ]);
    } else {
        response(false, 'Not authenticated');
    }
}

// Logout
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'logout') {
    session_unset();
    session_destroy();
    response(true, 'Logged out successfully');
}
