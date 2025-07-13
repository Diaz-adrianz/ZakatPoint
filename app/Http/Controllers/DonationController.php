<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\Donatur;
use App\Models\Article;
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

        $query = Article::query()
                        ->with('village:id,village');

        if ($search) {
            $query->where('title', 'like', '%' . $search . '%')
                  ->orWhere('slug', 'like', '%' . $search . '%');
        }

        $articles = $query->orderBy('created_at', 'desc')->paginate($limit);

        $articles->through(function ($article) {
            $plainContent = strip_tags($article->content);
            $article->content = Str::limit($plainContent, 100);
            return $article;
        });

        return Inertia::render('article-explore', [
            'articles' => $articles,
            'query' => [
                'search' => $search,
            ]
        ]);
    }

    public function add()
    {
        return Inertia::render('article-add');
    }

    public function edit($id)
    {
        $article = Article::findOrFail($id);
        return Inertia::render('article-edit', [
            'article' => $article,
        ]);
    }

    public function view($slug)
    {
        $article = Article::where('slug', $slug)
                          ->with("village")
                          ->firstOrFail();
        return Inertia::render('article-view', [
            'article' => $article,
        ]); 
    }

    public function store(Request $request)
    {
        $villageId = $request->cookie('village_id');

        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        try {
            $slug = Str::slug($validatedData['title']);
            $originalSlug = $slug;
            $count = 1;
            while (Article::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $count++;
            }

            $article = Article::create([
                'title' => $validatedData['title'],
                'slug' => $slug,
                'content' => $validatedData['content'],
                'village_id' => $villageId,
            ]);

            return redirect()->route('article.list')->with('success', 'Artikel "' . $article->title . '" berhasil ditambahkan.');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Terjadi kesalahan saat menambahkan artikel. Silakan coba lagi.');
        }
    }

    public function update(Request $request, $id)
    {
        $article = Article::findOrFail($id);

        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        try {
            $newSlug = Str::slug($validatedData['title']);

            if ($newSlug !== $article->slug) {
                $originalSlug = $newSlug;
                $count = 1;
                while (Article::where('slug', $newSlug)->where('id', '!=', $article->id)->exists()) {
                    $newSlug = $originalSlug . '-' . $count++;
                }
                $article->slug = $newSlug;
            }

            $article->title = $validatedData['title'];
            $article->content = $validatedData['content'];
            $article->save();

            return redirect()->route('article.list')->with('success', 'Artikel "' . $article->title . '" berhasil diperbarui.');

        } catch (\Exception $e) {
            // Log the error for debugging
            \Log::error('Error updating article: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'article_id' => $id,
                'village_id' => $villageIdFromCookie,
                'exception' => $e
            ]);

            // Redirect back with an error message
            return Redirect::back()->with('error', 'Terjadi kesalahan saat memperbarui artikel. Silakan coba lagi.');
        }
    }

    public function destroy($id)
    {
        $article = Article::findOrFail($id);

        try {
            $article->delete();
            return redirect()->route('article.list')->with('success', 'Artikel "' . $article->title . '" berhasil dihapus.');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Terjadi kesalahan saat menghapus artikel. Silakan coba lagi.');
        }
    }

    public function chat(Request $request) 
    {
        $validatedData = $request->validate([
            'message' => 'required|string',
        ]);

        try {
            return response()->json([
                'message' => 'PONG'
            ] , 200);
        } catch (\Exception $th) {
            return response()->json([
                'message' => 'Maaf, ada kesalahan teknis saat saya mencoba membuat respons.'
            ] , 200);
        }
    }
}
