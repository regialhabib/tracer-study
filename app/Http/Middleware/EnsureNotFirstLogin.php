<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureNotFirstLogin
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->first_login && ! $request->routeIs('first-login.*') && ! $request->routeIs('logout')) {
            return redirect()->route('first-login.prompt');
        }

        return $next($request);
    }
}
