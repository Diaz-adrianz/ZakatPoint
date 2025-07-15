<?php

namespace App\Http\Controllers;

use App\Http\Controllers\PaymentController;
use App\Models\FitrahZakat;
use App\Models\FitrahZakatPeriodeSession;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Redirect;

class FitrahZakatPeriodeSesssionController extends Controller
{
    public function list(Request $request)
    {
        $search = $request->query('search');
        $limit = $request->query('limit', 20);
        $limit = min(max(1, (int)$limit), 100);
        $villageId = $request->cookie('village_id');

        $query = FitrahZakatPeriodeSession::query();

        if ($villageId) {
            $query->where("village_id", $villageId);
        }

        if ($search) {
            $query->where('title', 'like', '%' . $search . '%')
                  ->orWhere('code', 'like', '%' . $search . '%');
        }

        $query->withSum(['zakats' => function ($query) {
                    $query->whereHas('payment', function ($query) {
                        $query->where('status', 'SUCCESS');
                    });
                }], 'amount');

        $periodes = $query->orderBy('created_at', 'desc')->paginate($limit);

        $sumAllAmount = FitrahZakat::whereHas('session', function ($query) use ($villageId) {
                                    $query->where('village_id', $villageId);
                                })
                                ->whereHas('payment', function ($query) {
                                    $query->where('status', 'SUCCESS');
                                })            
                                ->sum('amount');

        return Inertia::render('zakat-fitrah-periode-list', [
            'periodes' => $periodes,
            'sumAllAmount' => $sumAllAmount,
            'query' => [
                'search' => $search,
            ]
        ]);
    }

    public function add()
    {
        return Inertia::render('zakat-fitrah-periode-add');
    }

    public function view($code)
    {
        $periode = FitrahZakatPeriodeSession::where('code', $code)
                            ->with("village")
                            ->with(['zakats' => function ($query) {
                                $query->whereHas('payment', function ($query) {
                                    $query->where('status', 'SUCCESS');
                                });
                                $query->orderBy('created_at', 'desc'); 
                            }])
                            ->withSum(['zakats' => function ($query) {
                                $query->whereHas('payment', function ($query) {
                                    $query->where('status', 'SUCCESS');
                                });
                            }], 'amount')
                            ->first();
        
        return Inertia::render('zakat-fitrah-periode-view', [
            'periode' => $periode,
        ]); 
    }

    public function edit($id)
    {
        $periode = FitrahZakatPeriodeSession::findOrFail($id);
        return Inertia::render('zakat-fitrah-periode-edit', [
            'periode' => $periode,
        ]);
    }

    public function store(Request $request)
    {
        $villageId = $request->cookie('village_id');

        $validatedData = $request->validate([
            'title' => 'required|string|max:255',          
            'start_date' => 'required|date',                
            'end_date' => 'required|date|after_or_equal:start_date',
            'rice_price' => 'required|numeric|min:0',       
        ]);
        
        try {
            $code = Str::random(6);

            $session = FitrahZakatPeriodeSession::create([
                'title' => $validatedData['title'],
                'code' => $code,
                'start_date' => $validatedData['start_date'],
                'end_date' => $validatedData['end_date'],
                'rice_price' => $validatedData['rice_price'],
                'village_id' => $villageId,
            ]);

            return redirect()->route('zakat-fitrah-periode.list')->with('success', 'Periode zakat fitrah "' . $session->title . '" berhasil ditambahkan.');
        } catch (\Exception $e) {
            Log::error($e);
            return Redirect::back()->with('error', 'Terjadi kesalahan saat menambahkan periode zakat fitrah. Silakan coba lagi.');
        }
    }

    public function update(Request $request, $id)
    {
        $periode = FitrahZakatPeriodeSession::findOrFail($id);

        $validatedData = $request->validate([
            'title' => 'required|string|max:255',          
            'start_date' => 'required|date',                
            'end_date' => 'required|date|after_or_equal:start_date',
            'rice_price' => 'required|numeric|min:0',       
        ]);

        try {

            $periode->title = $validatedData['title'];
            $periode->start_date = $validatedData['start_date'];
            $periode->end_date = $validatedData['end_date'];
            $periode->rice_price = $validatedData['rice_price'];
            $periode->save();

            return redirect()->route('zakat-fitrah-periode.list')->with('success', 'Periode zakat fitrah "' . $periode->title . '" berhasil diperbarui.');

        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Terjadi kesalahan saat memperbarui periode zakat fitrah. Silakan coba lagi.');
        }
    }

    public function destroy($id)
    {
        $periode = FitrahZakatPeriodeSession::findOrFail($id);

        try {
            $periode->delete();
            return redirect()->route('zakat-fitrah-periode.list')->with('success', 'Periode zakat fitrah "' . $periode->title . '" berhasil dihapus.');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Terjadi kesalahan saat menghapus periode zakat fitrah. Silakan coba lagi.');
        }
    }

}

