<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Redirect;

class ArticleController extends Controller
{
    public function list(Request $request)
    {
        $search = $request->query('search');
        $limit = $request->query('limit', 20);
        $limit = min(max(1, (int)$limit), 100);

        $query = Article::query();

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

    public function add()
    {
        return Inertia::render('article-add');
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
}
