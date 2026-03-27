<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        $clients = [
            [
                'company_name'   => 'XYZ Corporation',
                'contact_person' => 'Juan Dela Cruz',
                'contact_number' => '+63 917 123 4567',
                'email'          => 'juan@xyzcorp.ph',
                'address'        => '123 Quezon Ave, Quezon City',
            ],
            [
                'company_name'   => 'Aluminum Works Inc.',
                'contact_person' => 'Maria Santos',
                'contact_number' => '+63 918 234 5678',
                'email'          => 'maria@aluminumworks.ph',
                'address'        => '456 Ortigas Ave, Pasig City',
            ],
            [
                'company_name'   => 'Glassworks Philippines',
                'contact_person' => 'Pedro Reyes',
                'contact_number' => '+63 919 345 6789',
                'email'          => 'pedro@glassworksph.com',
                'address'        => '789 EDSA, Makati City',
            ],
            [
                'company_name'   => 'Metro Steel Corp',
                'contact_person' => 'Ana Garcia',
                'contact_number' => '+63 920 456 7890',
                'email'          => 'ana@metrosteel.ph',
                'address'        => '321 Shaw Blvd, Mandaluyong City',
            ],
        ];

        foreach ($clients as $client) {
            Client::firstOrCreate(
                ['company_name' => $client['company_name']],
                $client
            );
        }
    }
}
