<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class AdminSeeder extends Seeder
{
    /** Default HANYA untuk environment local/testing. Ditolak di environment lain. */
    private const DEV_PASSWORD = 'ChangeMe-Dev-123!';

    private const DEV_EMAIL = 'admin@abxguard.test';

    public function run(): void
    {
        $isDev = app()->environment(['local', 'testing']);
        $password = config('abx.admin.password');
        $email = config('abx.admin.email');

        if (! $isDev) {
            if (! $email) {
                throw new RuntimeException('ADMIN_EMAIL wajib diisi di environment selain local/testing. Seeder admin dibatalkan.');
            }
            if (strcasecmp($email, self::DEV_EMAIL) === 0) {
                throw new RuntimeException('ADMIN_EMAIL tidak boleh memakai email development bawaan. Seeder admin dibatalkan.');
            }
            if (! $password) {
                throw new RuntimeException('ADMIN_PASSWORD wajib diisi di environment selain local/testing. Seeder admin dibatalkan.');
            }
            if ($password === self::DEV_PASSWORD) {
                throw new RuntimeException('ADMIN_PASSWORD tidak boleh memakai password development bawaan. Seeder admin dibatalkan.');
            }
        }

        if (User::where('role', 'admin')->exists()) {
            return;
        }

        $user = User::firstOrNew(['email' => $email ?: self::DEV_EMAIL]);
        if (! $user->exists) {
            $user->name = 'Admin ABX Guard';
            $user->password = Hash::make($password ?: self::DEV_PASSWORD);
            $user->email_verified_at = now();
        }

        $user->role = 'admin';
        $user->save();
    }
}