<?php

namespace Tests\Feature\Services\Support;

use App\Services\Support\InitialPasswordService;
use Illuminate\Support\Carbon;
use InvalidArgumentException;
use Tests\TestCase;

class InitialPasswordServiceTest extends TestCase
{
    public function test_uses_birth_date_formatted_as_ddmmyyyy(): void
    {
        $service = new InitialPasswordService;

        $this->assertSame('17082005', $service->generate('2005-08-17', '0051234567'));
        $this->assertSame('01012006', $service->generate(Carbon::create(2006, 1, 1), null));
    }

    public function test_falls_back_to_nisn_when_birth_date_is_empty(): void
    {
        $service = new InitialPasswordService;

        $this->assertSame('0051234567', $service->generate(null, ' 0051234567 '));
        $this->assertSame('0051234567', $service->generate('', '0051234567'));
    }

    public function test_requires_birth_date_or_nisn(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new InitialPasswordService)->generate(null, null);
    }
}
