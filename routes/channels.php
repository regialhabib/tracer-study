<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Hanya dua peserta percakapan — admin pun tidak bisa menyimak percakapan orang lain (PRD MSG-04).
Broadcast::channel('percakapan.{conversation}', function ($user, Conversation $conversation) {
    return $conversation->hasParticipant($user);
});
