<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\UserVillage; // Import your UserVillage model
use Illuminate\Support\Facades\Redirect;
use Symfony\Component\HttpFoundation\Response;

class IsVillageAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next): Response|RedirectResponse
    {
        $loggedInUserId = Auth::id();
        $villageId = $request->cookie("village_id");

        $adminUserVillage = UserVillage::where('user_id', $loggedInUserId)
                                       ->where('village_id', $villageId)
                                       ->first();

        if (!$adminUserVillage || $adminUserVillage->role !== 'admin') {
            return Redirect::back()->with('error', 'Anda bukan admin desa.');
            // Or abort(403, 'Forbidden: You do not have admin rights for this village.');
        }

        return $next($request);
    }
}