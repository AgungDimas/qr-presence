<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Ini bagian paling penting: Izinkan URL React kita!
    'allowed_origins' => ['http://localhost:5173', 'http://127.0.0.1:5173'],

    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],

    'max_age' => 0,

    // Wajib di-true kan agar Token/Cookie bisa lewat
    'supports_credentials' => true,
];
