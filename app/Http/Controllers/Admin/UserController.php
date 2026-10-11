<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ManagePharmacistStaffRequest;
use App\Models\ChallengeAttempt;
use App\Models\PharmacistStaff;
use App\Models\PharmacistStaffAudit;
use App\Models\ResearchSubmission;
use App\Models\ResearchInstrument;
use App\Models\User;
use App\Services\PharmacistConnectService;
use App\Support\Pagination;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $data = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'role' => ['nullable', Rule::in(['user', 'admin'])],
            'staff' => ['nullable', Rule::in(['active', 'inactive', 'none'])],
        ]);
        $instrument = ResearchInstrument::where('key', 'abx-guard-research')->where('is_active', true)->orderByDesc('version')->first();

        // Kolom dipilih eksplisit: password/remember_token tidak pernah dimuat. Hitungan memakai subquery (tanpa N+1).
        $users = User::query()
            ->select(['users.id', 'users.name', 'users.email', 'users.role', 'users.created_at'])
            ->with('pharmacistStaffMembership:id,user_id,active')
            ->addSelect([
                'attempts' => ChallengeAttempt::query()->selectRaw('COUNT(*)')
                    ->whereColumn('challenge_attempts.user_id', 'users.id')->whereNotNull('completed_at'),
                'research_initial_at' => ResearchSubmission::query()->select('submitted_at')
                    ->whereColumn('research_submissions.user_id', 'users.id')->where('instrument_id', $instrument?->id)
                    ->where('instrument_version', $instrument?->version)->where('stage', 'initial')->where('status', 'submitted')->limit(1),
            ])
            ->when($data['role'] ?? null, fn ($q, $r) => $q->where('users.role', $r))
            ->when(($data['staff'] ?? null) === 'active', fn ($q) => $q->whereHas('pharmacistStaffMembership', fn ($membership) => $membership->where('active', true)))
            ->when(($data['staff'] ?? null) === 'inactive', fn ($q) => $q->whereHas('pharmacistStaffMembership', fn ($membership) => $membership->where('active', false)))
            ->when(($data['staff'] ?? null) === 'none', fn ($q) => $q->whereDoesntHave('pharmacistStaffMembership'))
            ->when($data['q'] ?? null, fn ($q, $t) => $q->where(fn ($w) => $w->where('users.name', 'like', "%{$t}%")->orWhere('users.email', 'like', "%{$t}%")))
            ->orderByDesc('users.created_at')->orderByDesc('users.id')
            ->paginate(15)->withQueryString();

        return Inertia::render('Admin/Users', [
            'users' => $users->getCollection()->map(fn ($u) => [
                'id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'role' => $u->role,
                'registeredAt' => $u->created_at?->toIso8601String(),
                'researchInitialDone' => $u->research_initial_at !== null,
                'attempts' => (int) $u->attempts,
                'pharmacistStaffStatus' => $u->pharmacistStaffMembership?->active ? 'active' : ($u->pharmacistStaffMembership ? 'inactive' : 'none'),
            ])->values(),
            'pagination' => Pagination::meta($users),
            'filters' => ['q' => $data['q'] ?? '', 'role' => $data['role'] ?? '', 'staff' => $data['staff'] ?? ''],
            'instrumentVersion' => $instrument?->version,
            'activePharmacistStaffCount' => PharmacistStaff::where('active', true)->count(),
            'consultationOperational' => app(PharmacistConnectService::class)->isOperational(),
            'consultationGateConfigured' => (bool) config('abx.pharmacist_connect.operational'),
        ]);
    }

    public function grantPharmacistStaff(ManagePharmacistStaffRequest $request, User $user)
    {
        return $this->setPharmacistStaff($request, $user, true);
    }

    public function revokePharmacistStaff(ManagePharmacistStaffRequest $request, User $user)
    {
        return $this->setPharmacistStaff($request, $user, false);
    }

    private function setPharmacistStaff(ManagePharmacistStaffRequest $request, User $user, bool $active)
    {
        $result = DB::transaction(function () use ($request, $user, $active): array {
            $target = User::query()->lockForUpdate()->findOrFail($user->id);

            $membership = PharmacistStaff::query()->where('user_id', $target->id)->lockForUpdate()->first();
            $wasActive = (bool) $membership?->active;
            if ($wasActive === $active) {
                return ['changed' => false, 'active_count' => PharmacistStaff::where('active', true)->count()];
            }

            if ($active) {
                PharmacistStaff::updateOrCreate(['user_id' => $target->id], ['active' => true]);
            } else {
                $membership?->update(['active' => false]);
                // Requeue assigned conversations without deleting their history.
                $target->assignedPharmacistConversations()->update(['assigned_staff_id' => null]);
            }

            PharmacistStaffAudit::create([
                'actor_user_id' => $request->user()->id,
                'target_user_id' => $target->id,
                'action' => $active ? PharmacistStaffAudit::ACTION_GRANTED : PharmacistStaffAudit::ACTION_REVOKED,
                'was_active' => $wasActive,
                'is_active' => $active,
            ]);

            return ['changed' => true, 'active_count' => PharmacistStaff::where('active', true)->count()];
        });

        if (! $result['changed']) {
            return back()->with('success', $active ? 'Akses staf sudah aktif.' : 'Akses staf sudah nonaktif.');
        }

        if (! $active && $result['active_count'] === 0 && config('abx.pharmacist_connect.operational')) {
            return back()
                ->with('warning', 'Akses petugas terakhir dinonaktifkan. Penerimaan konsultasi kini tidak operasional karena tidak ada staf aktif; aktifkan petugas yang disetujui atau matikan gate layanan di konfigurasi Railway.')
                ->with('success', 'Akses staf dinonaktifkan. Riwayat percakapan tetap tersimpan.');
        }

        return back()->with('success', $active
            ? 'Akses inbox Pharmacist Connect diberikan. Pastikan penugasan dan kualifikasi petugas telah diverifikasi.'
            : 'Akses staf dinonaktifkan. Riwayat percakapan tetap tersimpan.');
    }
}
