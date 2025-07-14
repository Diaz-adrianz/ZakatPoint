<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\Donatur;
use App\Http\Controllers\PaymentController;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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

        $query->withSum(['donaturs' => function ($query) {
                    $query->whereHas('payment', function ($query) {
                        $query->where('status', 'SUCCESS');
                    });
                }], 'nominal');

        $donations = $query->orderBy('created_at', 'desc')->paginate($limit);

        $sumAllNominal = Donatur::whereHas('donation', function ($query) use ($villageId) {
                                    $query->where('village_id', $villageId);
                                })
                                ->whereHas('payment', function ($query) {
                                    $query->where('status', 'SUCCESS');
                                })            
                                ->sum('nominal');

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
                            ->with(['donaturs' => function ($query) {
                                $query->whereHas('payment', function ($query) {
                                    $query->where('status', 'SUCCESS');
                                });
                                $query->orderBy('created_at', 'desc'); 
                            }])
                            ->withSum(['donaturs' => function ($query) {
                                $query->whereHas('payment', function ($query) {
                                    $query->where('status', 'SUCCESS');
                                });
                            }], 'nominal')
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

            return redirect()->route('donation.list')->with('success', 'Program sedekah "' . $donation->title . '" berhasil ditambahkan.');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Terjadi kesalahan saat menambahkan program sedekah. Silakan coba lagi.');
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

    public function donate(Request $request, $slug)
    {
        $data = $request->validate([
            'email' => 'required|string|email|max:255', 
            'name' => 'nullable|string|max:255', 
            'no_hp' => 'required|string|regex:/^[0-9]{10,15}$/', 
            'gender' => 'required|string', 
            'nominal' => 'nullable|numeric|min:0',
        ]);

        try {
            $donation = Donation::where('slug', $slug)
                                ->firstOrFail();

            $paymentController = new PaymentController();            
            $payment = $paymentController->store([
                'amount' => $data['nominal'],
                'first_name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['no_hp'],
            ], array(
                [
                    'item_id' => uniqid(),
                    'name' => 'Sedekah program ' . $donation->title,
                    'price' => $data['nominal'],
                    'quantity' => 1,
                    'category' => 'sedekah'
                ],
            ), 1);

            if ($payment == null) {
                throw new \Exception('Payment failed');
            }

            Donatur::create([
                'username' => $data['name'],
                'nominal' => $data['nominal'],
                'donation_id' => $donation->id,
                'payment_id' => $payment['id'],
            ]);

            return to_route('payment.view', ['id' => $payment['id']]);
        } catch (\Exception $e) {
            Log::error('Payment error: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            return Redirect()->back()->with('error', "Terjadi kesalahan saat membuat pembayaran sedekah. Silakan coba lagi.");
        }
    }
}
