<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'name' => 'Ada Lovelace',
            'email' => 'ada@test.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token']);

        $this->assertDatabaseCount('users', 1);
    }

    public function test_user_can_login_and_logout(): void
    {
        $user = User::factory()->create(['password' => 'secret123']);

        $login = $this->postJson('/api/v1/login', [
            'email' => $user->email,
            'password' => 'secret123',
        ]);

        $login->assertOk()->assertJsonStructure(['token']);

        $token = $login->json('token');

        $this->withToken($token)->getJson('/api/v1/user')->assertOk();

        $this->withToken($token)->postJson('/api/v1/logout')->assertNoContent();

        // Token revogado: não autentica mais.
        $this->withToken($token)->getJson('/api/v1/user')->assertUnauthorized();
    }

    public function test_login_with_wrong_password_fails(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/v1/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])->assertUnprocessable();
    }

    public function test_forgot_password_returns_generic_message_for_unknown_email(): void
    {
        // Não vaza se o e-mail existe ou não (anti-enumeration).
        $this->postJson('/api/v1/forgot-password', ['email' => 'nao-existe@test.com'])
            ->assertOk()
            ->assertJsonStructure(['message']);
    }
}
