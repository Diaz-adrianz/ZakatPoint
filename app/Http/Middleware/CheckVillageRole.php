<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\UserVillage;
use Illuminate\Support\Facades\Redirect;
use Symfony\Component\HttpFoundation\Response;

class CheckVillageRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string|array  $roles  The required role(s) (e.g., 'admin', 'admin|editor', ['admin', 'editor'])
     * @return \Symfony\Component\HttpFoundation\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next, string|array $roles): Response|RedirectResponse
    {
        $loggedInUserId = Auth::id();
        $villageId = $request->cookie("village_id");
        if (!$villageId) {
            return Redirect::back()->with('error', 'Desa tidak valid.');
        }

        $userVillage = UserVillage::where('user_id', $loggedInUserId)
                                   ->where('village_id', $villageId)
                                   ->first();

        if (!$userVillage) {
            return Redirect::back()->with('error', 'Anda tidak terdaftar di desa ini.');
        }

        $requiredRoles = is_string($roles) ? explode('|', $roles) : (array) $roles;

        if (!in_array($userVillage->role, $requiredRoles)) {
            $rolesString = implode(', ', $requiredRoles);
            return Redirect::back()->with('error', 'Anda bukan (' . $rolesString . ') desa ini.');
        }

        return $next($request);
    }
}