<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAdminUserRequest;
use App\Http\Requests\Admin\UpdateAdminUserRequest;
use App\Models\User;
use App\Services\Admin\AdminUserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function __construct(private AdminUserService $adminUserService) {}

    public function index(Request $request): Response
    {
        $admins = $this->adminUserService->paginate();

        $admins->through(fn (User $admin): array => [
            'id' => $admin->id,
            'name' => $admin->name,
            'email' => $admin->email,
            'status' => $admin->status->value,
            'updated_at' => $admin->updated_at?->toIso8601String(),
            'is_self' => $admin->is($request->user()),
        ]);

        return Inertia::render('Admin/Pengguna/Index', ['admins' => $admins]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Pengguna/Create');
    }

    public function store(StoreAdminUserRequest $request): RedirectResponse
    {
        $admin = $this->adminUserService->create($request->validated());

        return to_route('admin.pengguna.index')
            ->with('status', "Admin {$admin->name} berhasil ditambahkan. Mereka akan diminta mengganti kata sandi saat masuk pertama kali.");
    }

    public function edit(User $adminUser): Response
    {
        $this->ensureAdmin($adminUser);

        return Inertia::render('Admin/Pengguna/Edit', [
            'adminUser' => $adminUser->only(['id', 'name', 'email']),
        ]);
    }

    public function update(UpdateAdminUserRequest $request, User $adminUser): RedirectResponse
    {
        $this->ensureAdmin($adminUser);

        $this->adminUserService->update($adminUser, $request->validated());

        return to_route('admin.pengguna.index')->with('status', 'Data admin berhasil diperbarui.');
    }

    public function deactivate(Request $request, User $adminUser): RedirectResponse
    {
        $this->ensureAdmin($adminUser);

        $this->adminUserService->deactivate($adminUser, $request->user());

        return to_route('admin.pengguna.index')->with('status', "Akun {$adminUser->name} telah dinonaktifkan.");
    }

    public function activate(User $adminUser): RedirectResponse
    {
        $this->ensureAdmin($adminUser);

        $this->adminUserService->activate($adminUser);

        return to_route('admin.pengguna.index')->with('status', "Akun {$adminUser->name} telah diaktifkan kembali.");
    }

    private function ensureAdmin(User $user): void
    {
        abort_unless($user->isAdmin(), 404);
    }
}
