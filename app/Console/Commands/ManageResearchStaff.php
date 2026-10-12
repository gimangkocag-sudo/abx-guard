<?php

namespace App\Console\Commands;

use App\Models\ResearchStaffMembership;
use App\Models\User;
use Illuminate\Console\Command;

class ManageResearchStaff extends Command
{
    protected $signature = 'research:staff {email : Exact email address of the research staff account} {--revoke : Disable research report access instead of granting it}';

    protected $description = 'Grant or revoke access to ABX Guard research reports without changing global roles';

    public function handle(): int
    {
        $user = User::where('email', $this->argument('email'))->first();

        if (! $user) {
            $this->error('User account not found.');

            return self::FAILURE;
        }

        ResearchStaffMembership::updateOrCreate(
            ['user_id' => $user->id],
            ['active' => ! $this->option('revoke'), 'granted_by' => null],
        );

        $this->info($this->option('revoke') ? 'Research report access disabled.' : 'Research report access enabled.');

        return self::SUCCESS;
    }
}
