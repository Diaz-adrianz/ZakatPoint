<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Http;

class ArticleController extends Controller
{
    public function listRaw()
    {
        $articles = Article::all();
        return response()->json($articles);
    }

    public function list(Request $request)
    {
        $search = $request->query('search');
        $limit = $request->query('limit', 20);
        $limit = min(max(1, (int)$limit), 100);
        $villageId = $request->cookie('village_id');

        $query = Article::query();

        if ($villageId) {
            $query->where("village_id", $villageId);
        }

        if ($search) {
            $query->where('title', 'like', '%' . $search . '%')
                  ->orWhere('slug', 'like', '%' . $search . '%');
        }

        $articles = $query->orderBy('created_at', 'desc')->paginate($limit);

        return Inertia::render('article-list', [
            'articles' => $articles,
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
        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        try {
            $apiHost = env('FLOWISE_API_HOST');
            $chatflowId = env('FLOWISE_CHATFLOW_ID');

            $response = Http::post("$apiHost/api/v1/prediction/$chatflowId", [
                'question' => $validated['message'],
            ]);

            $result = $response->json();

            return response()->json([
                'message' => $result['text'] ?? 'Maaf, tidak ada respons dari AI.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Maaf, ada kesalahan teknis saat mencoba merespons.'
            ]);
        }
    }
}
