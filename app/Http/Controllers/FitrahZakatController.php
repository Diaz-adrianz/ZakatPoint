<?php

namespace App\Http\Controllers;

use App\Models\FitrahZakat;
use Illuminate\Http\Request;

class FitrahZakatController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'dependents'        => 'required|integer|min:1',
            'amount'            => 'required|numeric|min:0',
            'email'             => 'required|email',
            'name'              => 'required|string',
            'no_hp'             => 'required|string',
            'gender'            => 'required|in:bapak,ibu',
            'fitrah_session_id' => 'required|exists:fitrah_zakat_periode_sessions,id',
            'payment_id'        => 'required|exists:payments,id',
        ]);

        $zakat = FitrahZakat::create([
            'dependents'        => $request->dependents,
            'amount'            => $request->amount,
            'email'             => $request->email,
            'name'              => $request->name,
            'no_hp'             => $request->no_hp,
            'gender'            => $request->gender,
            'fitrah_session_id' => $request->fitrah_session_id,
            'payment_id'        => $request->payment_id,
        ]);

        return response()->json([
            'success'  => true,
            'zakat_id' => $zakat->id,
        ]);
    }
}
