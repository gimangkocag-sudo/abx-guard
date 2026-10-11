<?php

namespace App\Services;

use RuntimeException;

class EmailJsRequestException extends RuntimeException
{
    public function __construct(public readonly string $sourceExceptionClass)
    {
        parent::__construct('EmailJS HTTP client failed before returning a response.');
    }
}
