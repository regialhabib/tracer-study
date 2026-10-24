<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterAlumniRequest;
use App\Services\Auth\AlumniRegistrationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Injeksi dependensi AlumniRegistrationService.
     */
    public function __construct(
        private AlumniRegistrationService $registrationService
    ) {}

    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'consent' => config('tracer.consent_text'),
        ]);
    }

    /**
     * Mendaftarkan alumni secara mandiri lalu mengarahkannya ke halaman "Menunggu Verifikasi".
     */
    public function store(RegisterAlumniRequest $request): RedirectResponse
    {
        $user = $this->registrationService->register($request->validated());

        Auth::login($user);

        return redirect()->route('verification.pending');
    }
}
