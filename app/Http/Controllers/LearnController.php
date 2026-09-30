<?php

namespace App\Http\Controllers;

use App\Services\LearningProgressService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LearnController extends Controller
{
    public function show(Request $request, LearningProgressService $progress, string $module): Response
    {
        $config = config('abx.modules')[$module] ?? null;
        abort_if($config === null, 404);

        if ($request->user()) {
            $progress->record($request->user(), $module);
        }

        return Inertia::render($config['component']);
    }
}
