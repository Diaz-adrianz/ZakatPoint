<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\Donatur;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Redirect;

class DonationController extends Controller
{
    public function list(Request $request)
    {
        $search = $request->query('search');
        $limit = $request->query('limit', 20);
        $limit = min(max(1, (int)$limit), 100);
        $villageId = $request->cookie('village_id');

        $query = Donation::query();

        if ($villageId) {
            $query->where("village_id", $villageId);
        }

        if ($search) {
            $query->where('title', 'like', '%' . $search . '%')
                  ->orWhere('slug', 'like', '%' . $search . '%');
        }

        $query->withSum('donaturs', 'nominal');

        $donations = $query->orderBy('created_at', 'desc')->paginate($limit);

        $sumAllNominal = Donatur::whereHas('donation', function ($query) use ($villageId) {
            $query->where('village_id', $villageId);
        })->sum('nominal');

        return Inertia::render('donation-list', [
            'donations' => $donations,
            'sumAllNominal' => $sumAllNominal,
            'query' => [
                'search' => $search,
            ]
        ]);
    }

    public function explore(Request $request)
    {
        $search = $request->query('search');
        $limit = $request->query('limit', 20);
        $limit = min(max(1, (int)$limit), 100);

        $query = Donation::query()
                        ->with('village:id,village')
                        ->withSum('donaturs', 'nominal');

        if ($search) {
            $query->where('title', 'like', '%' . $search . '%')
                  ->orWhere('slug', 'like', '%' . $search . '%');
        }

        $donations = $query->orderBy('created_at', 'desc')->paginate($limit);

        $donations->through(function ($donation) {
            $plainDescription = strip_tags($donation->description);
            $donation->description = Str::limit($plainDescription, 100);
            return $donation;
        });

        return Inertia::render('donation-explore', [
            'donations' => $donations,
            'query' => [
                'search' => $search,
            ]
        ]);
    }

    public function add()
    {
        return Inertia::render('donation-add');
    }

    public function edit($id)
    {
        $donation = Donation::findOrFail($id);
        return Inertia::render('donation-edit', [
            'donation' => $donation,
        ]);
    }

    public function view($slug)
    {
        $donation = Donation::where('slug', $slug)
                          ->with("village")
                          ->withSum('donaturs', 'nominal')
                          ->firstOrFail();
        return Inertia::render('donation-view', [
            'donation' => $donation,
        ]); 
    }

    public function store(Request $request)
    {
        $villageId = $request->cookie('village_id');

        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'target' => 'nullable|numeric|min:0',
            'description' => 'required|string',
        ]);
        
        try {
            $slug = Str::slug($validatedData['title']);
            $originalSlug = $slug;
            $count = 1;
            while (Donation::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $count++;
            }

            $donation = Donation::create([
                'title' => $validatedData['title'],
                'slug' => $slug,
                'description' => $validatedData['description'],
                'target' => $validatedData['target'],
                'village_id' => $villageId,
            ]);

            return redirect()->route('donation.list')->with('success', 'Program donasi "' . $donation->title . '" berhasil ditambahkan.');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Terjadi kesalahan saat menambahkan program donasi. Silakan coba lagi.');
        }
    }

    public function update(Request $request, $id)
    {
        $donation = Donation::findOrFail($id);

        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'target' => 'nullable|numeric|min:0',
            'description' => 'required|string',
        ]);

        try {
            $newSlug = Str::slug($validatedData['title']);

            if ($newSlug !== $donation->slug) {
                $originalSlug = $newSlug;
                $count = 1;
                while (Donation::where('slug', $newSlug)->where('id', '!=', $donation->id)->exists()) {
                    $newSlug = $originalSlug . '-' . $count++;
                }
                $donation->slug = $newSlug;
            }

            $donation->title = $validatedData['title'];
            $donation->target = $validatedData['target'];
            $donation->description = $validatedData['description'];
            $donation->save();

            return redirect()->route('donation.list')->with('success', 'Program sedekah "' . $donation->title . '" berhasil diperbarui.');

        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Terjadi kesalahan saat memperbarui program sedekah. Silakan coba lagi.');
        }
    }

    public function destroy($id)
    {
        $donation = Donation::findOrFail($id);

        try {
            $donation->delete();
            return redirect()->route('donation.list')->with('success', 'Program sedekah "' . $donation->title . '" berhasil dihapus.');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Terjadi kesalahan saat menghapus program sedekah. Silakan coba lagi.');
        }
    }
}
