<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'login' => ['required_without:email', 'string'],
            'email' => ['nullable', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $identifier = trim((string) ($this->input('login') ?: $this->input('email')));
        $fieldType = filter_var($identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'nisn';

        if (! Auth::attempt([$fieldType => $identifier, 'password' => $this->input('password')], $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            $errorField = $this->filled('login') ? 'login' : 'email';

            throw ValidationException::withMessages([
                $errorField => trans('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());

        $this->ensureAccountIsNotDeactivated();
    }

    /**
     * Tolak akun nonaktif setelah kredensial benar, sambil menampilkan alasan penolakan (AUTH-04).
     *
     * Akun `pending` tetap boleh masuk; pengalihannya ke halaman tunggu diatur controller & middleware.
     *
     * @throws ValidationException
     */
    private function ensureAccountIsNotDeactivated(): void
    {
        $user = Auth::user();

        if (! $user instanceof User || ! $user->isInactive()) {
            return;
        }

        Auth::guard('web')->logout();

        throw ValidationException::withMessages([
            $this->filled('login') ? 'login' : 'email' => $user->deactivatedAccountMessage(),
        ]);
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());
        $errorField = $this->filled('login') ? 'login' : 'email';

        throw ValidationException::withMessages([
            $errorField => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        $identifier = trim((string) ($this->input('login') ?: $this->input('email')));

        return Str::transliterate(Str::lower($identifier).'|'.$this->ip());
    }
}
