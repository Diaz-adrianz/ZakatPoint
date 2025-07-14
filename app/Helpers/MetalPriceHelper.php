<?php

namespace App\Helpers;

use App\Models\GoldPrice;
use App\Models\SilverPrice;
use Illuminate\Support\Facades\Http;

class MetalPriceHelper
{
    public static function updateTodayPrices(): void
    {
        $today = now()->toDateString();

        $goldExists   = GoldPrice::whereDate('date', $today)->where('price', '>', 0)->exists();
        $silverExists = SilverPrice::whereDate('date', $today)->where('price', '>', 0)->exists();

        // Sudah ada semua ➜ tidak perlu update
        if ($goldExists && $silverExists) return;

        $resp = Http::timeout(10)->get('https://api.metalpriceapi.com/v1/latest', [
            'api_key'    => config('services.metalprice.key'),
            'base'       => 'IDR',
            'currencies' => 'XAU,XAG',
        ]);

        if (!$resp->successful()) {
            // fallback per‑gram
            $goldPerGram   = 54_459_429 / 31.1035;
            $silverPerGram =   623_549 / 31.1035;
        } else {
            $rates         = $resp->json('rates');
            $goldPerGram   = ($rates['IDRXAU'] ?? 54_459_429) / 31.1035;
            $silverPerGram = ($rates['IDRXAG'] ??   623_549) / 31.1035;
        }

        if (!$goldExists) {
            GoldPrice::updateOrCreate(
                ['date' => $today],
                ['price' => $goldPerGram]
            );
        }

        if (!$silverExists) {
            SilverPrice::updateOrCreate(
                ['date' => $today],
                ['price' => $silverPerGram]
            );
        }
    }

    public static function getGoldToday(): float
    {
        self::updateTodayPrices();

        return GoldPrice::whereDate('date', now()->toDateString())->value('price') ?? 54_000_000 / 31.1035;
    }

    public static function getSilverToday(): float
    {
        self::updateTodayPrices();

        return SilverPrice::whereDate('date', now()->toDateString())->value('price') ?? 600_000 / 31.1035;
    }
}
