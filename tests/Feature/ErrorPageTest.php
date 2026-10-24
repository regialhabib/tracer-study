<?php

namespace Tests\Feature;

use App\Models\AlumniProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ErrorPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_unknown_url_renders_the_not_found_error_page(): void
    {
        $response = $this->get('/halaman-yang-tidak-ada');

        $response->assertNotFound();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Error')
            ->where('status', 404)
        );
    }

    public function test_forbidden_access_renders_the_forbidden_error_page(): void
    {
        $alumni = User::factory()->alumni()->create(['first_login' => false]);
        AlumniProfile::factory()->create(['user_id' => $alumni->id]);

        $response = $this->actingAs($alumni)->get(route('admin.dashboard'));

        $response->assertForbidden();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Error')
            ->where('status', 403)
        );
    }

    public function test_json_requests_keep_the_json_error_response(): void
    {
        $response = $this->getJson('/halaman-yang-tidak-ada');

        $response->assertNotFound();
        $response->assertJsonStructure(['message']);
    }

    public function test_expired_session_redirects_back_with_an_error_flash(): void
    {
        Route::middleware('web')->post('/_test/sesi-berakhir', fn () => abort(419));

        $response = $this->from(route('login'))->post('/_test/sesi-berakhir');

        $response->assertRedirect(route('login'));
        $response->assertSessionHas('error');
    }

    public function test_server_error_keeps_the_default_response_in_the_testing_environment(): void
    {
        Route::middleware('web')->get('/_test/galat-server', fn () => abort(500));

        $response = $this->get('/_test/galat-server');

        $response->assertInternalServerError();
        $this->assertStringNotContainsString('data-page', (string) $response->getContent());
    }

    public function test_server_error_renders_the_error_page_in_production(): void
    {
        $this->app->detectEnvironment(fn () => 'production');
        Route::middleware('web')->get('/_test/galat-server', fn () => abort(500));

        $response = $this->get('/_test/galat-server');

        $response->assertInternalServerError();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Error')
            ->where('status', 500)
        );
    }
}
