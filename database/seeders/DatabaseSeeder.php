<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // The legacy KAP catalog/answers are historical; a full seed must not rewrite them.
        $this->call([AdminSeeder::class, ResearchInstrumentSeeder::class, ChallengeSeeder::class]);
    }
}
