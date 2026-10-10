<?php

namespace App\Http\Middleware;

use App\Services\PharmacistConnectService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureBroadcastingConfigured
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless(app(PharmacistConnectService::class)->realtimeAvailable(), 503, 'WebSocket authorization is unavailable.');

        return $next($request);
    }
}
