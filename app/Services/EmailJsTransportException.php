<?php

namespace App\Services;

use RuntimeException;

class EmailJsTransportException extends RuntimeException
{
    public function __construct(
        public readonly string $failureCategory,
        public readonly string $sourceExceptionClass,
    ) {
        parent::__construct('EmailJS transport failed: '.$failureCategory);
    }
}
