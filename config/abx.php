<?php

return [
    'survey_slug' => 'kap',

    // Modul belajar (dipakai routing, pelacakan progres, dan dashboard). Urutan = urutan progres.
    'modules' => [
        'bijak-antibiotik' => ['title' => 'Bijak Antibiotik', 'component' => 'Abx/Bijak'],
        'amr' => ['title' => 'AMR Education', 'component' => 'Abx/Amr'],
        'mikrobioma' => ['title' => 'Microbiome Care', 'component' => 'Abx/Microbiome'],
        'pangan-fungsional' => ['title' => 'Functional Food', 'component' => 'Abx/FunctionalFood'],
        'pharmacist-connect' => ['title' => 'Pharmacist Connect', 'component' => 'Abx/Pharmacist'],
        'myth-or-fact' => ['title' => 'Myth or Fact', 'component' => 'Abx/MythOrFact'],
    ],

    // Dibaca lewat config() (bukan env() di seeder) supaya tetap bekerja setelah `php artisan config:cache`.
    'admin' => [
        'email' => env('ADMIN_EMAIL'),
        'password' => env('ADMIN_PASSWORD'),
    ],
    'scales' => [
        'knowledge' => [
            ['value' => 'benar', 'label' => 'Benar'],
            ['value' => 'salah', 'label' => 'Salah'],
            ['value' => 'tidak_tahu', 'label' => 'Tidak tahu'],
        ],
        'agreement' => [
            ['value' => '1', 'label' => 'Sangat Tidak Setuju'],
            ['value' => '2', 'label' => 'Tidak Setuju'],
            ['value' => '3', 'label' => 'Netral'],
            ['value' => '4', 'label' => 'Setuju'],
            ['value' => '5', 'label' => 'Sangat Setuju'],
        ],
        'frequency' => [
            ['value' => '1', 'label' => 'Tidak Pernah'],
            ['value' => '2', 'label' => 'Jarang'],
            ['value' => '3', 'label' => 'Kadang-kadang'],
            ['value' => '4', 'label' => 'Sering'],
            ['value' => '5', 'label' => 'Selalu'],
        ],
    ],
];
