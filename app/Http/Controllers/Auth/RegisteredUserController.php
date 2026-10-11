<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AlumniProfile;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nisn' => ['nullable', 'string', 'max:20', 'unique:'.User::class],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Password::defaults()],
            'gender' => ['nullable', 'in:L,P'],
            'major' => ['nullable', 'string', 'max:100'],
            'graduation_year' => ['nullable', 'integer', 'min:2000', 'max:'.(date('Y') + 1)],
            'phone_number' => ['nullable', 'string', 'max:25'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'nisn' => $validated['nisn'] ?? null,
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'alumni',
            'status' => 'active',
            'first_login' => false,
        ]);

        $graduationYear = (int) ($validated['graduation_year'] ?? date('Y'));
        $entryYear = max(2000, $graduationYear - 3);

        AlumniProfile::create([
            'user_id' => $user->id,
            'gender' => $validated['gender'] ?? 'L',
            'major' => $validated['major'] ?? 'Keagamaan (PK)',
            'entry_year' => $entryYear,
            'graduation_year' => $graduationYear,
            'phone_number' => $validated['phone_number'] ?? null,
            'current_status' => 'mencari_kerja',
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
