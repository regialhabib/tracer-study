<?php

namespace Tests\Feature\Services\Support;

use App\Services\Support\WhatsAppLinkService;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class WhatsAppLinkServiceTest extends TestCase
{
    /**
     * @return array<string, array{?string, ?string}>
     */
    public static function phoneNumberProvider(): array
    {
        return [
            'lokal 08' => ['081234567890', '6281234567890'],
            'lokal dengan spasi & strip' => ['0812-3456 7890', '6281234567890'],
            'internasional +62' => ['+62 812 3456 7890', '6281234567890'],
            'tanpa plus 62' => ['6281234567890', '6281234567890'],
            'tanpa nol depan' => ['81234567890', '6281234567890'],
            'awalan 00' => ['006281234567890', '6281234567890'],
            'negara lain dengan +' => ['+60123456789', '60123456789'],
            'kosong' => ['', null],
            'null' => [null, null],
            'terlalu pendek' => ['0812', null],
            'terlalu panjang' => ['0812345678901234567', null],
        ];
    }

    #[DataProvider('phoneNumberProvider')]
    public function test_normalizes_indonesian_phone_numbers(?string $rawPhoneNumber, ?string $expected): void
    {
        $normalized = app(WhatsAppLinkService::class)->normalizePhoneNumber($rawPhoneNumber);

        $this->assertSame($expected, $normalized);
    }

    public function test_builds_wa_me_url_with_encoded_message(): void
    {
        $url = app(WhatsAppLinkService::class)->buildUrl('081234567890', 'Halo & salam');

        $this->assertSame('https://wa.me/6281234567890?text=Halo%20%26%20salam', $url);
    }

    public function test_builds_url_without_text_when_message_is_empty(): void
    {
        $url = app(WhatsAppLinkService::class)->buildUrl('081234567890');

        $this->assertSame('https://wa.me/6281234567890', $url);
    }

    public function test_returns_null_url_for_invalid_number(): void
    {
        $url = app(WhatsAppLinkService::class)->buildTemplateUrl(null, 'akun_disetujui', ['nama' => 'Ahmad']);

        $this->assertNull($url);
    }

    public function test_fills_template_placeholders(): void
    {
        config(['tracer.whatsapp_templates.reset_password' => 'Halo :nama, sandi :password_hint di :url']);

        $url = app(WhatsAppLinkService::class)->buildTemplateUrl('081234567890', 'reset_password', [
            'nama' => 'Ahmad',
            'password_hint' => 'tanggal lahir',
            'url' => 'https://tracer.test/login',
        ]);

        $this->assertSame(
            'https://wa.me/6281234567890?text='.rawurlencode('Halo Ahmad, sandi tanggal lahir di https://tracer.test/login'),
            $url,
        );
    }

    public function test_every_configured_template_renders_without_leftover_placeholders(): void
    {
        $service = app(WhatsAppLinkService::class);

        foreach (['akun_disetujui', 'reset_password', 'pengingat_kuesioner'] as $templateKey) {
            $message = $service->renderTemplate($templateKey, [
                'nama' => 'Ahmad',
                'password_hint' => 'tanggal lahir',
                'url' => 'https://tracer.test',
            ]);

            $this->assertStringContainsString('Ahmad', $message, $templateKey);
            $this->assertDoesNotMatchRegularExpression('/:[a-z_]+/', $message, $templateKey);
        }
    }

    public function test_rejects_unknown_template_key(): void
    {
        $this->expectException(InvalidArgumentException::class);

        app(WhatsAppLinkService::class)->renderTemplate('tidak_ada');
    }
}
