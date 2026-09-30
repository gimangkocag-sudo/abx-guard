<?php

namespace App\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class Pagination
{
    /** Metadata ringkas untuk komponen Pagination di frontend. */
    public static function meta(LengthAwarePaginator $p): array
    {
        return [
            'current' => $p->currentPage(),
            'last' => $p->lastPage(),
            'total' => $p->total(),
            'from' => $p->firstItem(),
            'to' => $p->lastItem(),
            'prevUrl' => $p->previousPageUrl(),
            'nextUrl' => $p->nextPageUrl(),
        ];
    }
}
