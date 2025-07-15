<?php

namespace App\Http\Controllers;

use App\Models\Village;
use App\Models\UserVillage;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Http\Controllers\RegionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;


class VillageController extends Controller
{
    public function index()
{
    $villages = Village::orderBy('province')->get();

    $provinces = Http::get('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
                    ->json();

    return Inertia::render('Villages/Index', [
        'villages' => $villages,
        'provinces' => $provinces,
    ]);
}

    public function create()
    {
        $regionController = new RegionController();
        $provinces = $regionController->getProvinces();

        return Inertia::render('new-village', [
            'provinces' => $provinces
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'province' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'district' => 'required|string|max:100',
            'village' => 'required|string|max:255',
            'postal_code' => [
                'required',
                Rule::unique('villages')->where(function ($query) use ($request) {
                    return $query->where('village', $request->village);
                })->where('postal_code', $request->postal_code),
            ],
            'longitude' => 'nullable|string',
            'latitude' => 'nullable|string',
            'email_village' => 'nullable|email|unique:villages,email_village',
        ]);

        $village = Village::create($request->all());

        UserVillage::create([
            'user_id' => Auth::id(),
            'village_id' => $village->id,
            'role' => 'admin', 
        ]);

        return redirect()->route('dashboard')->with('success', 'Desa berhasil ditambahkan.');
    }

    public function userVillages(Request $request)
    {
        $userId = Auth::id();
        $userVillages = UserVillage::where('user_id', $userId)
                                    ->where('is_pending', false)
                                    ->with('village')
                                    ->get();

        return response()->json($userVillages, 200);
    }

    public function getVillageUsers(Request $request)
    {
        $villageId = $request->cookie('village_id');

        if (!$villageId) {
            return Inertia::render('resident', [
                'villagers' => [],
            ]);        
        }

        $search = $request->query('search');
        $limit = $request->query('limit', 20);
        $limit = min(max(1, (int)$limit), 100);

        $query = UserVillage::where('village_id', $villageId)
                            ->with('user:id,name');

        if ($search) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        $userVillages = $query->paginate($limit);

        return Inertia::render('resident', [
            'villagers' => $userVillages,
            'query' => [
                'search' => $search,
            ]
        ]);
    }

    public function exploreVillages(Request $request)
    {
        $search = $request->query('search');
        $limit = $request->query('limit', 20);
        $limit = min(max(1, (int)$limit), 100);

        $query = Village::query()
                        ->whereDoesntHave('users', function ($q) {
                            $q->where('user_id', Auth::id())
                              ->where('is_pending', false); 
                        });

        if ($search) {
            $query->where('district', 'like', '%' . $search . '%')
                  ->orWhere('village', 'like', '%' . $search . '%');
        }

        $villages = $query->orderBy('created_at', 'desc')->paginate($limit);

        return Inertia::render('explore-villages', [
            'villages' => $villages,
            'query' => [
                'search' => $search,
            ]
        ]);
    }

    public function joinVillage(Request $request)
    {
        $userId = Auth::id();
        $villageId = $request->input('village_id'); 

        $existingUserVillage = UserVillage::where('user_id', $userId)
                                          ->where('village_id', $villageId)
                                          ->first();

        if ($existingUserVillage) {
            return Redirect::back()->with('error', 'Anda sudah mengajukan permintaan gabung atau sudah menjadi anggota desa ini.');
        }

        try {
            $request->validate([
                'village_id' => [
                    'required',
                    'integer',
                    'exists:villages,id',
                ],
            ]);

            UserVillage::create([
                'user_id' => $userId,
                'village_id' => $villageId,
                'role' => 'member', 
                'is_pending' => true,
            ]);

            return Redirect::back()->with('success', 'Permintaan bergabung ke desa berhasil dikirim. Menunggu persetujuan admin.');

        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Terjadi kesalahan saat bergabung ke desa. Silakan coba lagi.');
        }
    }

    public function acceptUserVillage(Request $request) 
    {
        $request->validate([
            'user_village_id' => 'required|integer|exists:user_villages,id',
        ]);

        $userVillageId = $request->input('user_village_id');
        $userVillageToAccept = UserVillage::with('village')->find($userVillageId);

        if (!$userVillageToAccept) {
            return Redirect::back()->with('error', 'Pengguna tidak ditemukan.');
        }

        try {
            $userVillageToAccept->is_pending = false;
            $userVillageToAccept->save();

            return Redirect::back()->with('success', 'Pengguna ' . $userVillageToAccept->user->name . ' berhasil disetujui untuk bergabung dengan desa ' . $userVillageToAccept->village->village . '.');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Terjadi kesalahan saat menyetujui pengguna. Silakan coba lagi.');
        }
    }

    public function changeUserVillageRole(Request $request) 
    {
        $request->validate([
            'user_village_id' => 'required|integer|exists:user_villages,id',
            'role' => 'required|string|in:admin,editor,member',
        ]);

        $userVillageId = $request->input('user_village_id');
        $role = $request->input('role');
        $userVillage = UserVillage::with('village')->find($userVillageId);

        if (!$userVillage) {
            return Redirect::back()->with('error', 'Pengguna tidak ditemukan.');
        }

        try {
            $userVillage->role = $role;
            $userVillage->save();

            return Redirect::back()->with('success', 'Peran ' . $userVillage->user->name . ' berhasil diubah menjadi ' . $role . '.');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Terjadi kesalahan saat mengubah peran pengguna. Silakan coba lagi.');
        }
    }
    public function search(Request $request)
{
    $q = trim($request->get('q', ''));

    // Kalau query kosong – kembalikan array kosong
    if ($q === '') {
        return response()->json([]);
    }

    /*  ───── contoh struktur tabel ─────
        id | province | city | district | village | …
       ----------------------------------------------
    */

    $villages = Village::query()
        ->where('village',  'like', "%{$q}%")          // nama desa
        ->orWhere('district','like', "%{$q}%")         // atau kecamatan
        ->selectRaw('id, village as name')             // **alias jadi "name"**
        ->limit(10)
        ->get();

    return response()->json($villages);
}

}
