// app/components/products/ProductsPaginated.jsx
'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import ProductListItem from '@/app/components/UI/ProductListItem';
import ProductCardSkeleton from '@/app/components/UI/ProductCardSkeleton';
import { TbArrowLeft, TbArrowRight } from 'react-icons/tb';

const PAGE_SIZE = 16;
const MAX_COUNT_ROWS = 10000; // biztonsági sapka kliens oldali counthoz

function safeParseJSON(s) { try { return JSON.parse(s); } catch { return null; } }
function getCategoryPathsFromProduct(product) {
  const raw = product?.kategoria;
  const parsed = typeof raw === 'string' ? safeParseJSON(raw) : raw;
  return Array.isArray(parsed) ? parsed.filter(p => Array.isArray(p) && p.length) : [];
}
function pickBestPath(paths) {
  if (!paths.length) return null;
  return paths.slice().sort((a, b) => b.length - a.length)[0];
}
function buildCategorySlugPath(catId, catsById) {
  const chain = [];
  let cur = catsById.get(catId);
  while (cur) {
    chain.push(cur);
    cur = cur.szulo ? catsById.get(cur.szulo) : null;
  }
  chain.reverse();
  return chain.map(c => c.slug).join('/');
}

export default function ProductsPaginated({ catsByIdObj, categoryId = null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const catsById = useMemo(
    () => new Map(Object.entries(catsByIdObj || {}).map(([k, v]) => [Number(k), v])),
    [catsByIdObj]
  );

  // URL filterek
  const arrange      = searchParams.get('arrange')      || '';
  const color        = searchParams.get('color')        || '';
  const childSlug    = searchParams.get('category')     || '';
  const stock        = searchParams.get('stock')        || '';
  const warranty     = searchParams.get('warranty')     || '';
  const priceRange   = searchParams.get('pricerange')   || '';
  const size         = searchParams.get('size')         || '';
  const weightrange  = searchParams.get('weightrange')  || '';
  const material     = searchParams.get('material')     || '';
  const charging     = searchParams.get('charging')     || '';
  const chargingtime = searchParams.get('chargingtime') || '';
  const noise        = searchParams.get('noise')        || '';
  const waterproof   = searchParams.get('waterproof')   || '';
  const usetime      = searchParams.get('usetime')      || '';
  const modes        = searchParams.get('modes')        || '';
  const speed        = searchParams.get('speed')        || '';
  const controll     = searchParams.get('controll')     || '';
  const app          = searchParams.get('app')          || '';

  // aktuális oldal (0-index)
  const pageFromUrl = Math.max(0, parseInt(searchParams.get('page') || '0', 10) || 0);
  const [page, setPage] = useState(pageFromUrl);
  useEffect(() => { setPage(pageFromUrl); }, [pageFromUrl]);

  const [effectiveCategoryId, setEffectiveCategoryId] = useState(categoryId);
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal]   = useState(0);

  const totalPages = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE));
  const remainingPages = Math.max(0, totalPages - (page + 1));

  // URL frissítése, ha lapozunk
  const updatePageInUrl = useCallback((nextPage) => {
    const params = new URLSearchParams(window.location.search);
    if (nextPage > 0) params.set('page', String(nextPage));
    else params.delete('page');
    router.push(`?${params.toString()}`);
  }, [router]);

  // child slug → kategória id feloldás
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!childSlug) {
        if (!cancelled) setEffectiveCategoryId(categoryId);
        return;
      }
      const { data: cat } = await supabase
        .from('product-categories')
        .select('id, slug')
        .eq('slug', String(childSlug).toLowerCase())
        .maybeSingle();
      if (!cancelled) setEffectiveCategoryId(cat?.id ?? categoryId);
    })();
    return () => { cancelled = true; };
  }, [childSlug, categoryId, supabase]);

  // szűrők változásakor vissza az első oldalra és számoljuk újra az összes találatot
  useEffect(() => {
    setItems([]);
    setTotal(0);
    setPage(0);
    updatePageInUrl(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    arrange,color,childSlug,stock,warranty,priceRange,size,weightrange,material,
    charging,chargingtime,noise,waterproof,usetime,modes,speed,controll,app,effectiveCategoryId
  ]);

  // --- közös query builder (SELECT → FILTER) ---
  const baseQuery = (columns = '*', options) =>
    supabase
      .from('products')
      .select(columns, options)  // FONTOS: előbb select, aztán eq/ilike
      .eq('kozzeteve', true);

  const applyFilters = (q) => {
    const ilike = (col, val) => { if (val) q = q.ilike(col, `%${val}%`); };
    ilike('szin', color);
    ilike('anyag', material);
    ilike('meretek', size);
    ilike('suly', weightrange);
    ilike('toltes', charging);
    ilike('toltesi_ido', chargingtime);
    ilike('zajszint', noise);
    ilike('vizallosag', waterproof);
    ilike('hasznalati_ido', usetime);
    ilike('vibracios_modok', modes);
    ilike('sebessegfokozatok', speed);
    ilike('vezerles', controll);
    ilike('applikacio', app);

    if (warranty) {
      const m = String(warranty).match(/(\d+)/);
      if (m) q = q.ilike('garancia', `%${m[1]}%`);
      else q = q.ilike('garancia', `%${warranty}%`);
    }

    if (stock === 'instock') q = q.gt('keszlet', 0);
    else if (stock === 'out-of-stock') q = q.eq('keszlet', 0);

    if (priceRange) {
      if (priceRange.includes('-')) {
        const [min, max] = priceRange.split('-').map(n => Number(String(n).replace(/\D/g,'')));
        if (!Number.isNaN(min)) q = q.gte('eladasi_ar_brutto', min);
        if (!Number.isNaN(max)) q = q.lte('eladasi_ar_brutto', max);
      } else if (priceRange.endsWith('+')) {
        const n = Number(priceRange.replace('+',''));
        if (!Number.isNaN(n)) q = q.gte('eladasi_ar_brutto', n);
      }
    }

    return q;
  };

  const applyOrdering = (q) => {
    if (arrange === 'price-low-to-high') {
      return q.order('eladasi_ar_brutto', { ascending: true }).order('id', { ascending: true });
    } else if (arrange === 'price-high-to-low') {
      return q.order('eladasi_ar_brutto', { ascending: false }).order('id', { ascending: true });
    } else if (arrange === 'newest') {
      return q.order('created_at', { ascending: false }).order('id', { ascending: true });
    }
    return q.order('created_at', { ascending: false }).order('id', { ascending: true });
  };

  // összes találat számolása
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);

      // Nincs kategória-path filter → pontos DB count
      if (!effectiveCategoryId) {
        let cq = baseQuery('id', { count: 'exact', head: true });
        cq = applyFilters(cq);
        const { count, error } = await cq;
        if (!cancelled) {
          if (error) console.error('count error:', error);
          setTotal(count || 0);
          setLoading(false);
        }
        return;
      }

      // Van kategória-path filter → id + kategoria fel, kliensen szűrjük
      let cq = baseQuery('id,kategoria');
      cq = applyFilters(cq).range(0, MAX_COUNT_ROWS - 1);
      const { data: rows, error } = await cq;
      const safeRows = Array.isArray(rows) ? rows : [];
      if (!cancelled) {
        if (error) console.error('count (client filter) error:', error);
        const wantId = Number(effectiveCategoryId);
        const totalClient = safeRows.filter(r => {
          const paths = getCategoryPathsFromProduct(r);
          return paths.some(p => Array.isArray(p) && p.includes(wantId));
        }).length;
        setTotal(totalClient);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    arrange,color,stock,warranty,priceRange,size,weightrange,material,
    charging,chargingtime,noise,waterproof,usetime,modes,speed,controll,app,effectiveCategoryId
  ]);

  // aktuális oldal adatainak lekérése
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);

      const from = page * PAGE_SIZE;
      const to   = from + PAGE_SIZE - 1;

      let pq = baseQuery('*');
      pq = applyOrdering(applyFilters(pq)).range(from, to);

      const { data: rows, error } = await pq;
      const safeRows = Array.isArray(rows) ? rows : [];
      if (error) console.error('page fetch error:', error);

      // kliens oldali kategória-path szűrés (ha kell)
      let filtered = safeRows;
      if (effectiveCategoryId) {
        const wantId = Number(effectiveCategoryId);
        filtered = safeRows.filter(p => {
          const paths = getCategoryPathsFromProduct(p);
          return paths.some(path => Array.isArray(path) && path.includes(wantId));
        });
      }

      if (!cancelled) {
        setItems(filtered);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page, arrange,color,stock,warranty,priceRange,size,weightrange,material,
    charging,chargingtime,noise,waterproof,usetime,modes,speed,controll,app,effectiveCategoryId
  ]);

  // skeleton az első kör(ök)ben
  if (loading && items.length === 0) {
    return (
      <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 mt-8 gap-4 w-full">
        {Array.from({ length: PAGE_SIZE }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    );
  }

  // lapozó UI (ablakolt számozás)
  const Pagination = () => {
    if (totalPages <= 1) return null;
    const windowSize = 3;
    const start = Math.max(0, Math.min(page - Math.floor(windowSize/2), totalPages - windowSize));
    const end = Math.min(totalPages - 1, start + windowSize - 1);
    const go = (p) => { setPage(p); updatePageInUrl(p); };

    return (
      <div className="flex flex-col items-center gap-2 mt-6">
        <div className="text-xs text-gray-500">
          Összesen {totalPages} oldal
        </div>
        <div className="flex items-center gap-">
          <button
            onClick={() => go(0)}
            disabled={page === 0}
            className="px-2.5 py-1 text-sm rounded-full disabled:opacity-40 hover:bg-[var(--border)]/40 cursor-pointer"
          >
            Első
          </button>
          <button
            onClick={() => go(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-2.5 py-2 text-sm rounded-full disabled:opacity-40 hover:bg-[var(--border)]/40 cursor-pointer"
            aria-label="Előző oldal"
          >
            <TbArrowLeft/>
          </button>

          {Array.from({ length: end - start + 1 }).map((_, i) => {
            const p = start + i;
            const active = p === page;
            return (
              <button
                key={p}
                onClick={() => go(p)}
                className={`px-2.5 py-1 text-sm rounded-full transition cursor-pointer ${
                  active
                    ? 'bg-[var(--green)] text-white'
                    : 'hover:bg-[var(--border)]/40'
                }`}
              >
                {p + 1}
              </button>
            );
          })}

          <button
            onClick={() => go(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-2.5 py-2 text-sm rounded-full disabled:opacity-40 hover:bg-[var(--border)]/40 cursor-pointer"
            aria-label="Következő oldal"
          >
            <TbArrowRight/>
          </button>
          <button
            onClick={() => go(totalPages - 1)}
            disabled={page >= totalPages - 1}
            className="px-2.5 py-1 text-sm rounded-full disabled:opacity-40 hover:bg-[var(--border)]/40 cursor-pointer"
          >
            Utolsó
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 mt-8 gap-4">
        {items.map((p) => {
          const paths = getCategoryPathsFromProduct(p);
          const picked = pickBestPath(paths);
          let categoryPath = '';
          if (picked && picked.length) {
            const lastId = picked[picked.length - 1];
            categoryPath = buildCategorySlugPath(lastId, catsById);
          }
          return (
            <ProductListItem
              key={p.id}
              id={p.id}
              image={p.termekkep || '/default.png'}
              focim={p.fo_cim}
              alcim={p.alcim}
              price={p.eladasi_ar_brutto}
              slug={p.seo_slug}
              categoryPath={categoryPath}
            />
          );
        })}

        {/* ha nincs találat */}
        {!loading && items.length === 0 && (
          <div className="col-span-full text-sm text-gray-500 p-6">
            Nincs találat a megadott szűrőkre.
          </div>
        )}
      </div>

      {/* skeleton a lapváltások közben (alul) */}
      {loading && items.length > 0 && (
        <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4">
          {Array.from({ length: Math.min(PAGE_SIZE, 4) }).map((_, i) => (
            <ProductCardSkeleton key={`sk-${i}`} />
          ))}
        </div>
      )}

      <Pagination />
    </div>
  );
}
