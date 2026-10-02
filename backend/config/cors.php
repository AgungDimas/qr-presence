<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Daftar origin FE yang diizinkan (lengkap: localhost & 127.0.0.1, port 5173-5174)
    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
    ],

    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],

    'max_age' => 0,

    // Aktifkan credentials agar cookie/session bisa lewat (untuk SPA hybrid mode),
    // Tetap aman karena allowed_origins spesifik (bukan wildcard '*').
    'supports_credentials' => true,
];
