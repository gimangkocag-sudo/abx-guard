<?php

namespace App\Console\Commands;

use App\Models\PharmacistStaff;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ManagePharmacistStaff extends Command
{
    protected $signature = 'pharmacist:staff {email : Exact email address of the staff account} {--revoke : Disable inbox access instead of granting it}';

    protected $description = 'Grant or revoke explicit Pharmacist Connect inbox access';

    public function handle(): int
    {
        $user = User::where('email', $this->argument('email'))->first();

        if (! $user) {
            $this->error('User account not found.');

            return self::FAILURE;
        }

        $active = ! $this->option('revoke');
        DB::transaction(function () use ($user, $active): void {
            PharmacistStaff::updateOrCreate(['user_id' => $user->id], ['active' => $active]);

            if (! $active) {
                // Return their assigned threads to the authorized staff queue; message history is retained.
                $user->assignedPharmacistConversations()->update(['assigned_staff_id' => null]);
            }
        });

        $this->info($active ? 'Pharmacist Connect inbox permission enabled.' : 'Pharmacist Connect inbox permission disabled.');

        return self::SUCCESS;
    }
}
