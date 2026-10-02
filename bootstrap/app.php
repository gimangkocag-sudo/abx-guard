<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (HttpResponse $response, Throwable $exception, Request $request): HttpResponse {
            $status = $response->getStatusCode();
            if ($request->expectsJson() || ! in_array($status, [403, 404, 419, 500, 503], true)) {
                return $response;
            }

            return Inertia::render('Errors/Status', ['status' => $status])
                ->toResponse($request)
                ->setStatusCode($status);
        });
    })->create();
