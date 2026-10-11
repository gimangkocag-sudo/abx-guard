<?php

namespace App\Services;

use RuntimeException;

class EmailJsDeliveryException extends RuntimeException
{
    public function __construct(
        public readonly int $statusCode,
        public readonly string $providerMessage,
    ) {
        parent::__construct('EmailJS returned HTTP '.$statusCode.': '.$providerMessage);
    }
}
