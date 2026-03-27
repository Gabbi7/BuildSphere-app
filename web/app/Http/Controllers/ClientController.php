<?php

namespace App\Http\Controllers;

use App\Http\Resources\ClientResource;
use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    /**
     * GET /clients — list all clients.
     */
    public function index()
    {
        return ClientResource::collection(Client::orderBy('company_name')->get());
    }

    /**
     * POST /clients — create a new client.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name'   => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:50',
            'email'          => 'nullable|email|max:255',
            'address'        => 'nullable|string|max:1000',
        ]);

        $client = Client::create($validated);

        return new ClientResource($client);
    }
}
