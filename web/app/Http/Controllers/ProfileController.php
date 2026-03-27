<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function show()
    {
        return response()->json(Auth::user());
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $rules = [
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'email'      => [
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($user),
            ],
        ];

        // Only validate password if it was provided
        if ($request->filled('password')) {
            $rules['password'] = 'min:8|confirmed';
        }

        $validated = $request->validate($rules);

        $user->first_name = $validated['first_name'];
        $user->last_name  = $validated['last_name'];
        $user->email      = $validated['email'];

        // Only update password if a new one was provided
        if ($request->filled('password')) {
            $user->password = $validated['password']; // auto-hashed by model cast
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user'    => $user,
        ]);
    }
}
