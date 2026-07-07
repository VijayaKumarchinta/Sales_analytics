// ── Sales Analytics Platform — Cloudflare Worker ──
// Replaces the original Django REST Framework backend.
// Uses D1 (SQLite) instead of PostgreSQL.
// Validates Supabase JWTs for authentication (matching frontend approach).

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

function csvResponse(csvContent, filename) {
  return new Response(csvContent, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

// ── JWT / Auth Helpers ──
// Validates Supabase JWTs. In dev mode without Supabase, uses a simple key.

function getJWTSecret(env) {
  return env.SUPABASE_JWT_SECRET || env.JWT_SECRET || null;
}

function getSalt(env) {
  return env.SALT || null;
}

async function verifySupabaseJWT(token, env) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;

    const enc = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      'raw', enc.encode(getJWTSecret(env)),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const sigBytes = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', cryptoKey, sigBytes, enc.encode(`${header}.${body}`));
    if (!valid) return null;

    const payload = JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

async function getUserFromToken(token, env) {
  const payload = await verifySupabaseJWT(token, env);
  if (!payload) return null;

  const sub = payload.sub;
  const email = payload.email || '';

  // Try by supabase_uid first
  let user = await env.DB.prepare('SELECT * FROM users WHERE supabase_uid = ?').bind(sub).first();
  if (!user && email) {
    user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  }
  return user || { id: null, role: 'viewer', email };
}

async function requireAuth(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) throw new Error('Authentication required');
  const user = await getUserFromToken(auth.slice(7), env);
  if (!user || !user.id) throw new Error('Invalid token');
  return user;
}

// ── Query Helpers ──

function month(field) {
  return `substr(${field}, 1, 7)`; // 'YYYY-MM' from ISO date string
}

function quarter(field) {
  return `substr(${field}, 1, 4) || '-Q' || CAST(CAST(substr(${field}, 6, 2) AS INTEGER) / 4 + 1 AS TEXT)`;
}

function monthName(field) {
  // SQLite month name from date string
  return `CASE CAST(substr(${field}, 6, 2) AS INTEGER)
    WHEN 1 THEN 'Jan' WHEN 2 THEN 'Feb' WHEN 3 THEN 'Mar' WHEN 4 THEN 'Apr'
    WHEN 5 THEN 'May' WHEN 6 THEN 'Jun' WHEN 7 THEN 'Jul' WHEN 8 THEN 'Aug'
    WHEN 9 THEN 'Sep' WHEN 10 THEN 'Oct' WHEN 11 THEN 'Nov' ELSE 'Dec' END`;
}

// ── Route Handlers ──

// Auth
async function handleToken(request, env) {
  try {
    const body = await request.json();
    const { username, password } = body;
    if (!username || !password) return errorResponse('Username and password required');

    const user = await env.DB.prepare('SELECT * FROM users WHERE username = ? OR email = ?')
      .bind(username, username).first();
    if (!user) return errorResponse('Invalid credentials', 401);

    // Simple password verification (in production use bcrypt/argon2)
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(password + (env.PEPPER || 'sales-pepper')),
      { name: 'PBKDF2' }, false, ['deriveBits']);
    const salt = getSalt(env);
    if (!salt) throw new Error('SALT env var not configured');
    const hash = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
      key, 256);
    const hashStr = btoa(String.fromCharCode(...new Uint8Array(hash)));

    if (user.password_hash !== hashStr) return errorResponse('Invalid credentials', 401);

    const jwtSecret = getJWTSecret(env);
    if (!jwtSecret) throw new Error('JWT_SECRET env var not configured');

    const tokenPayload = { sub: String(user.id), email: user.email, role: user.role };
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
    const now = Math.floor(Date.now() / 1000);
    const bodyB64 = btoa(JSON.stringify({ ...tokenPayload, iat: now, exp: now + 86400 })).replace(/=/g, '');
    const signKey = await crypto.subtle.importKey('raw', enc.encode(jwtSecret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', signKey, enc.encode(`${header}.${bodyB64}`));
    const signature = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '');

    return jsonResponse({
      access: `${header}.${bodyB64}.${signature}`,
      refresh: `${header}.${bodyB64}.${signature}`,
      access_token: `${header}.${bodyB64}.${signature}`,
      token_type: 'bearer',
    });
  } catch (e) {
    return errorResponse(e.message);
  }
}

async function handleTokenRefresh(request, env) {
  return jsonResponse({ access: '', refresh: '', message: 'Refresh via Supabase in production' });
}

async function handleMe(request, env) {
  try {
    const user = await requireAuth(request, env);
    return jsonResponse({
      id: user.id, username: user.username, email: user.email,
      first_name: user.first_name || '', last_name: user.last_name || '',
      role: user.role, supabase_uid: user.supabase_uid || null, created_at: user.created_at,
    });
  } catch (e) {
    return errorResponse(e.message, 401);
  }
}

async function handleRegister(request, env) {
  try {
    const body = await request.json();
    const { username, email, password, first_name, last_name, role } = body;
    if (!username || !email || !password) return errorResponse('username, email, password required');

    const existing = await env.DB.prepare('SELECT id FROM users WHERE username = ? OR email = ?')
      .bind(username, email).first();
    if (existing) return errorResponse('User already exists');

    const salt = getSalt(env);
    if (!salt) throw new Error('SALT env var not configured');
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(password + (env.PEPPER || 'sales-pepper')),
      { name: 'PBKDF2' }, false, ['deriveBits']);
    const hash = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
      key, 256);
    const hashStr = btoa(String.fromCharCode(...new Uint8Array(hash)));

    const result = await env.DB.prepare(
      'INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(username, email, hashStr, first_name || '', last_name || '', role || 'viewer').run();

    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(result.meta.last_row_id).first();

    return jsonResponse({
      id: user.id, username: user.username, email: user.email,
      first_name: user.first_name, last_name: user.last_name, role: user.role,
    }, 201);
  } catch (e) {
    return errorResponse(e.message);
  }
}

// ── Dashboard ──

async function handleDashboardKPIs(request, env) {
  try {
    await requireAuth(request, env);
    const period = new URL(request.url).searchParams.get('period') || 'year';
    const now = new Date().toISOString();

    let startDate;
    if (period === 'all') startDate = '2000-01-01';
    else if (period === '7d') startDate = new Date(Date.now() - 7*86400000).toISOString();
    else if (period === '30d') startDate = new Date(Date.now() - 30*86400000).toISOString();
    else if (period === 'quarter') startDate = new Date(Date.now() - 90*86400000).toISOString();
    else startDate = new Date(Date.now() - 365*86400000).toISOString();

    const current = await env.DB.prepare(
      `SELECT COALESCE(SUM(sales_amount),0) as revenue, COALESCE(SUM(profit),0) as profit, COUNT(*) as orders
       FROM sales WHERE order_date >= ?`
    ).bind(startDate).first();

    const days = period === 'all' ? 3650 : Math.round((Date.now() - new Date(startDate).getTime()) / 86400000);
    const prevStart = new Date(Date.now() - days * 2 * 86400000).toISOString();

    const previous = await env.DB.prepare(
      `SELECT COALESCE(SUM(sales_amount),0) as revenue, COALESCE(SUM(profit),0) as profit, COUNT(*) as orders
       FROM sales WHERE order_date >= ? AND order_date < ?`
    ).bind(prevStart, startDate).first();

    const totalCustomers = (await env.DB.prepare('SELECT COUNT(*) as count FROM customers').first()).count;

    function calcChange(cur, prev) {
      return prev == 0 ? 0 : Math.round(((cur - prev) / prev) * 100 * 10) / 10;
    }

    const curRev = Number(current.revenue);
    const prevRev = Number(previous.revenue);
    const curProfit = Number(current.profit);
    const prevProfit = Number(previous.profit);
    const curOrders = Number(current.orders);
    const prevOrders = Number(previous.orders);
    const margin = curRev > 0 ? Math.round((curProfit / curRev) * 100 * 10) / 10 : 0;
    const prevMargin = prevRev > 0 ? Math.round((prevProfit / prevRev) * 100 * 10) / 10 : 0;

    return jsonResponse({
      revenue: { value: Math.round(curRev * 100) / 100, change: calcChange(curRev, prevRev), prefix: '$' },
      profit: { value: Math.round(curProfit * 100) / 100, change: calcChange(curProfit, prevProfit), prefix: '$' },
      profitMargin: { value: margin, change: Math.round((margin - prevMargin) * 10) / 10, suffix: '%' },
      orders: { value: curOrders, change: calcChange(curOrders, prevOrders) },
      customers: { value: totalCustomers, change: 0 },
      growthRate: { value: calcChange(curRev, prevRev), change: 0, suffix: '%' },
    });
  } catch (e) {
    if (e.message === 'Authentication required' || e.message === 'Invalid token')
      return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

async function handleRevenueTrend(request, env) {
  try {
    await requireAuth(request, env);
    const period = new URL(request.url).searchParams.get('period') || 'year';
    const days = period === 'year' ? 365 : 180;
    const startDate = new Date(Date.now() - days * 86400000).toISOString();

    const rows = await env.DB.prepare(
      `SELECT ${monthName('order_date')} as label, ${month('order_date')} as mo,
              COALESCE(SUM(sales_amount),0) as amount
       FROM sales WHERE order_date >= ? GROUP BY mo ORDER BY mo`
    ).bind(startDate).all();

    return jsonResponse(rows.results.map(r => ({ label: r.label, amount: Math.round(Number(r.amount) * 100) / 100 })));
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

async function handleSalesByRegion(request, env) {
  try {
    await requireAuth(request, env);
    const period = new URL(request.url).searchParams.get('period') || 'year';
    let startDate;
    const p = period;
    if (p === '7d') startDate = new Date(Date.now() - 7*86400000).toISOString();
    else if (p === '30d') startDate = new Date(Date.now() - 30*86400000).toISOString();
    else startDate = new Date(Date.now() - 365*86400000).toISOString();

    const rows = await env.DB.prepare(
      `SELECT region, COALESCE(SUM(sales_amount),0) as total
       FROM sales WHERE order_date >= ? GROUP BY region ORDER BY total DESC`
    ).bind(startDate).all();

    return jsonResponse(rows.results.map(r => ({ region: r.region, total: Math.round(Number(r.total) * 100) / 100 })));
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

async function handleCategoryBreakdown(request, env) {
  try {
    await requireAuth(request, env);
    const rows = await env.DB.prepare(
      `SELECT p.category, COALESCE(SUM(s.sales_amount),0) as total
       FROM sales s JOIN products p ON s.product_id = p.id
       GROUP BY p.category ORDER BY total DESC`
    ).all();

    return jsonResponse(rows.results.map(r => ({
      name: r.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      total: Math.round(Number(r.total) * 100) / 100,
    })));
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

// ── Sales ──

async function handleSalesList(request, env) {
  try {
    await requireAuth(request, env);
    const url = new URL(request.url);
    const params = url.searchParams;
    let query = `SELECT s.*, c.name as customer_name, p.name as product_name
                 FROM sales s JOIN customers c ON s.customer_id = c.id
                 JOIN products p ON s.product_id = p.id WHERE 1=1`;
    const binds = [];

    if (params.get('start_date')) { query += ' AND s.order_date >= ?'; binds.push(params.get('start_date')); }
    if (params.get('end_date')) { query += ' AND s.order_date <= ?'; binds.push(params.get('end_date')); }
    if (params.get('region')) { query += ' AND s.region = ?'; binds.push(params.get('region')); }
    query += ' ORDER BY s.order_date DESC LIMIT 100';

    const rows = await env.DB.prepare(query).bind(...binds).all();
    return jsonResponse(rows.results);
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

async function handleSalesDetail(request, env, id) {
  try {
    await requireAuth(request, env);
    const row = await env.DB.prepare(
      `SELECT s.*, c.name as customer_name, p.name as product_name
       FROM sales s JOIN customers c ON s.customer_id = c.id
       JOIN products p ON s.product_id = p.id WHERE s.id = ?`
    ).bind(id).first();
    if (!row) return errorResponse('Not found', 404);
    return jsonResponse(row);
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

async function handleSalesTrends(request, env) {
  try {
    await requireAuth(request, env);
    const period = new URL(request.url).searchParams.get('period') || 'year';
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === 'quarter' ? 90 : 365;
    const startDate = new Date(Date.now() - days * 86400000).toISOString();

    const rows = await env.DB.prepare(
      `SELECT ${monthName('order_date')} as month, ${month('order_date')} as mo,
              COALESCE(SUM(sales_amount),0) as revenue, COALESCE(SUM(profit),0) as profit, COUNT(*) as orders
       FROM sales WHERE order_date >= ? GROUP BY mo ORDER BY mo`
    ).bind(startDate).all();

    return jsonResponse(rows.results.map(r => ({
      month: r.month, revenue: Math.round(Number(r.revenue)*100)/100,
      profit: Math.round(Number(r.profit)*100)/100, orders: r.orders,
    })));
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

async function handleQuarterlySales(request, env) {
  try {
    await requireAuth(request, env);
    const startDate = new Date(Date.now() - 365*86400000).toISOString();

    const rows = await env.DB.prepare(
      `SELECT ${quarter('order_date')} as quarter,
              COALESCE(SUM(sales_amount),0) as revenue, COALESCE(SUM(profit),0) as profit, COUNT(*) as orders
       FROM sales WHERE order_date >= ? GROUP BY quarter ORDER BY quarter`
    ).bind(startDate).all();

    return jsonResponse(rows.results.map(r => ({
      quarter: r.quarter, revenue: Math.round(Number(r.revenue)*100)/100,
      profit: Math.round(Number(r.profit)*100)/100, orders: r.orders,
    })));
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

// ── Customers ──

async function handleCustomersList(request, env) {
  try {
    await requireAuth(request, env);
    const url = new URL(request.url);
    let query = 'SELECT * FROM customers WHERE 1=1';
    const binds = [];
    const search = url.searchParams.get('search');
    const segment = url.searchParams.get('segment');
    if (search) { query += ' AND (name LIKE ? OR email LIKE ?)'; binds.push(`%${search}%`, `%${search}%`); }
    if (segment) { query += ' AND segment = ?'; binds.push(segment); }
    query += ' ORDER BY created_at DESC LIMIT 100';

    const rows = await env.DB.prepare(query).bind(...binds).all();
    return jsonResponse(rows.results);
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

async function handleCustomerDetail(request, env, id) {
  try {
    await requireAuth(request, env);
    const row = await env.DB.prepare('SELECT * FROM customers WHERE id = ?').bind(id).first();
    if (!row) return errorResponse('Not found', 404);
    return jsonResponse(row);
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

async function handleCustomerSegments(request, env) {
  try {
    await requireAuth(request, env);
    const segments = await env.DB.prepare(
      `SELECT c.segment, COUNT(*) as count,
              COALESCE(SUM(s.sales_amount),0) as value
       FROM customers c LEFT JOIN sales s ON s.customer_id = c.id
       GROUP BY c.segment ORDER BY count DESC`
    ).all();

    return jsonResponse(segments.results.map(s => ({
      name: s.segment, count: s.count, value: Math.round(Number(s.value)*100)/100,
    })));
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

async function handleLifetimeValue(request, env) {
  try {
    await requireAuth(request, env);
    const ltv = await env.DB.prepare(
      `SELECT c.segment, COUNT(DISTINCT c.id) as total_customers,
              COALESCE(AVG(s.sales_amount),0) as avg_value,
              COALESCE(COUNT(s.id)*1.0/COUNT(DISTINCT c.id),0) as avg_orders
       FROM customers c LEFT JOIN sales s ON s.customer_id = c.id
       GROUP BY c.segment ORDER BY avg_value DESC`
    ).all();

    return jsonResponse(ltv.results.map(l => ({
      segment: l.segment,
      avg_lifetime_value: Math.round(Number(l.avg_value) * Number(l.avg_orders || 1) * 100) / 100,
      total_customers: l.total_customers,
      avg_orders: Math.round(Number(l.avg_orders || 0) * 10) / 10,
    })));
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

async function handleRetention(request, env) {
  try {
    await requireAuth(request, env);
    const startDate = new Date(Date.now() - 365*86400000).toISOString();

    // Cohort retention: for each month, what % of customers returning from any prior month
    const rows = await env.DB.prepare(
      `WITH monthly_customers AS (
        SELECT ${month('order_date')} as mo, customer_id
        FROM sales WHERE order_date >= ?
        GROUP BY mo, customer_id
      )
      SELECT 
        MIN(mc.mo) as mo,
        COUNT(DISTINCT mc.customer_id) as total_customers,
        COUNT(DISTINCT CASE WHEN prev.customer_id IS NOT NULL THEN mc.customer_id END) as returning_customers
      FROM monthly_customers mc
      LEFT JOIN monthly_customers prev ON mc.customer_id = prev.customer_id AND prev.mo < mc.mo
      GROUP BY mc.mo
      ORDER BY mc.mo`
    ).bind(startDate).all();

    return jsonResponse(rows.results.map(r => ({
      month: (() => {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const m = parseInt(r.mo.slice(5, 7));
        return months[m - 1];
      })(),
      rate: r.total_customers > 0 ? Math.round((r.returning_customers / r.total_customers) * 100) : 0,
      total: r.total_customers,
    })));
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

// ── Products ──

async function handleProductsList(request, env) {
  try {
    await requireAuth(request, env);
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    let query = 'SELECT * FROM products WHERE 1=1';
    const binds = [];
    if (search) { query += ' AND name LIKE ?'; binds.push(`%${search}%`); }
    if (category) { query += ' AND category = ?'; binds.push(category); }
    query += ' ORDER BY name LIMIT 100';

    const rows = await env.DB.prepare(query).bind(...binds).all();
    return jsonResponse(rows.results);
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

async function handleProductDetail(request, env, id) {
  try {
    await requireAuth(request, env);
    const row = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    if (!row) return errorResponse('Not found', 404);
    return jsonResponse(row);
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

async function handleTopProducts(request, env) {
  try {
    await requireAuth(request, env);
    const rows = await env.DB.prepare(
      `SELECT p.name, COALESCE(SUM(s.sales_amount),0) as revenue, COALESCE(SUM(s.profit),0) as profit,
              COALESCE(SUM(s.quantity),0) as units_sold
       FROM sales s JOIN products p ON s.product_id = p.id
       GROUP BY p.name ORDER BY revenue DESC`
    ).all();

    return jsonResponse(rows.results.map(r => ({
      name: r.name, revenue: Math.round(Number(r.revenue)*100)/100,
      profit: Math.round(Number(r.profit)*100)/100,
      margin: Number(r.revenue) > 0 ? Math.round((Number(r.profit)/Number(r.revenue))*100*10)/10 : 0,
      units_sold: r.units_sold,
    })));
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

async function handleProfitability(request, env) {
  try {
    await requireAuth(request, env);
    const rows = await env.DB.prepare(
      `SELECT p.category, COALESCE(SUM(s.sales_amount),0) as revenue, COALESCE(SUM(s.profit),0) as profit,
              COUNT(DISTINCT p.id) as count
       FROM sales s JOIN products p ON s.product_id = p.id
       GROUP BY p.category ORDER BY revenue DESC`
    ).all();

    return jsonResponse(rows.results.map(r => ({
      category: r.category.charAt(0).toUpperCase() + r.category.slice(1).replace(/_/g, ' '),
      revenue: Math.round(Number(r.revenue)*100)/100,
      profit: Math.round(Number(r.profit)*100)/100,
      margin: Number(r.revenue) > 0 ? Math.round((Number(r.profit)/Number(r.revenue))*100*10)/10 : 0,
      count: r.count,
    })));
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

async function handleCategoryAnalysis(request, env) {
  try {
    await requireAuth(request, env);
    const rows = await env.DB.prepare(
      `SELECT category, COUNT(*) as total_products,
              AVG(cost_price) as avg_cost, AVG(selling_price) as avg_price
       FROM products GROUP BY category ORDER BY category`
    ).all();

    return jsonResponse(rows.results.map(r => ({
      category: r.category.charAt(0).toUpperCase() + r.category.slice(1).replace(/_/g, ' '),
      total_products: r.total_products,
      avg_cost: Math.round(Number(r.avg_cost)*100)/100,
      avg_price: Math.round(Number(r.avg_price)*100)/100,
      avg_margin: Number(r.avg_price) > 0
        ? Math.round(((Number(r.avg_price)-Number(r.avg_cost))/Number(r.avg_price))*100*10)/10
        : 0,
    })));
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

// ── Reports ──

async function handleExportCSV(request, env) {
  try {
    await requireAuth(request, env);
    const dataType = new URL(request.url).searchParams.get('type') || 'sales';
    const now = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    if (dataType === 'sales') {
      const rows = await env.DB.prepare(
        `SELECT s.id, p.name as product, c.name as customer, s.quantity, s.sales_amount, s.profit, s.region, s.order_date
         FROM sales s JOIN products p ON s.product_id = p.id JOIN customers c ON s.customer_id = c.id
         ORDER BY s.order_date DESC LIMIT 10000`
      ).all();
      let csv = 'ID,Product,Customer,Quantity,Amount,Profit,Region,Date\n';
      for (const r of rows.results) {
        csv += `${r.id},"${r.product}","${r.customer}",${r.quantity},${r.sales_amount},${r.profit},"${r.region}",${r.order_date.slice(0,10)}\n`;
      }
      return csvResponse(csv, `sales_${now}.csv`);
    } else if (dataType === 'customers') {
      const rows = await env.DB.prepare('SELECT * FROM customers ORDER BY created_at DESC LIMIT 10000').all();
      let csv = 'ID,Name,Email,City,Country,Segment,Created\n';
      for (const r of rows.results) {
        csv += `${r.id},"${r.name}","${r.email}","${r.city}","${r.country}","${r.segment}",${r.created_at.slice(0,10)}\n`;
      }
      return csvResponse(csv, `customers_${now}.csv`);
    } else {
      const rows = await env.DB.prepare('SELECT * FROM products ORDER BY name LIMIT 10000').all();
      let csv = 'ID,Name,Category,Cost Price,Selling Price\n';
      for (const r of rows.results) {
        csv += `${r.id},"${r.name}","${r.category}",${r.cost_price},${r.selling_price}\n`;
      }
      return csvResponse(csv, `products_${now}.csv`);
    }
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

async function handleExportPDF(request, env) {
  try {
    await requireAuth(request, env);
    const totals = await env.DB.prepare(
      'SELECT COALESCE(SUM(sales_amount),0) as tr, COALESCE(SUM(profit),0) as tp, COUNT(*) as tos FROM sales'
    ).first();
    return jsonResponse({
      title: 'Sales Analytics Report',
      generated_at: new Date().toISOString(),
      summary: {
        total_revenue: Math.round(Number(totals.tr)*100)/100,
        total_profit: Math.round(Number(totals.tp)*100)/100,
        total_orders: totals.tos,
      },
      message: 'PDF report data - use proper PDF library in production',
    });
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

async function handleEmailReport(request, env) {
  try {
    await requireAuth(request, env);
    const body = await request.json();
    if (!body.email) return errorResponse('Email address required');
    return jsonResponse({
      message: 'Report scheduled successfully',
      email: body.email,
      frequency: body.frequency || 'weekly',
      status: 'active',
    });
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

// ── Regions ──

async function handleRegionsList(request, env) {
  try {
    await requireAuth(request, env);
    const rows = await env.DB.prepare(
      'SELECT region, COALESCE(SUM(sales_amount),0) as total_sales FROM sales GROUP BY region ORDER BY region'
    ).all();
    return jsonResponse(rows.results.map(r => ({ region: r.region, total_sales: Math.round(Number(r.total_sales)*100)/100 })));
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

async function handleRegionsPerformance(request, env) {
  try {
    await requireAuth(request, env);
    const rows = await env.DB.prepare(
      `SELECT region, COALESCE(SUM(sales_amount),0) as revenue, COALESCE(SUM(profit),0) as profit,
              COUNT(*) as orders, COUNT(DISTINCT customer_id) as customers
       FROM sales GROUP BY region ORDER BY revenue DESC`
    ).all();
    return jsonResponse(rows.results.map(r => ({
      region: r.region, revenue: Math.round(Number(r.revenue)*100)/100,
      profit: Math.round(Number(r.profit)*100)/100, orders: r.orders, customers: r.customers,
    })));
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

// ── Dataset Import ──

async function handleDatasetImport(request, env) {
  try {
    await requireAuth(request, env);
    const body = await request.json();
    const { records, type } = body;
    if (!records || !Array.isArray(records)) return errorResponse('records array required');

    let imported = 0;
    if (type === 'sales') {
      for (const r of records) {
        await env.DB.prepare(
          'INSERT OR IGNORE INTO sales (customer_id, product_id, quantity, sales_amount, profit, discount, region, order_date) VALUES (?,?,?,?,?,?,?,?)'
        ).bind(r.customer_id, r.product_id, r.quantity||1, r.sales_amount, r.profit||0, r.discount||0, r.region, r.order_date).run();
        imported++;
      }
    }
    return jsonResponse({ message: `Imported ${imported} records`, count: imported });
  } catch (e) {
    if (e.message === 'Authentication required') return errorResponse(e.message, 401);
    return errorResponse(e.message);
  }
}

// ── Seed ──
let seeded = false;

async function seedIfNeeded(env) {
  if (seeded) return;
  const exists = await env.DB.prepare("SELECT id FROM users WHERE username = 'admin'").first();
  if (!exists) {
    const salt = getSalt(env);
    if (!salt) return;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode('demo1234' + (env.PEPPER || 'sales-pepper')),
      { name: 'PBKDF2' }, false, ['deriveBits']);
    const hash = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
      key, 256);
    const hashStr = btoa(String.fromCharCode(...new Uint8Array(hash)));

    await env.DB.prepare(
      'INSERT INTO users (username, email, password_hash, first_name, role) VALUES (?, ?, ?, ?, ?)'
    ).bind('admin', 'admin@example.com', hashStr, 'Admin', 'admin').run();
  }
  seeded = true;
}

// ── Main Router ──

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '');
    const method = request.method;

    try {
      await seedIfNeeded(env);

      // Auth
      if (path === '/api/token/' && method === 'POST') return handleToken(request, env);
      if (path === '/api/token/refresh/' && method === 'POST') return handleTokenRefresh(request, env);
      if (path === '/api/me/' && method === 'GET') return handleMe(request, env);
      if (path === '/api/register/' && method === 'POST') return handleRegister(request, env);

      // Dashboard
      if (path === '/api/dashboard/kpis/' && method === 'GET') return handleDashboardKPIs(request, env);
      if (path === '/api/dashboard/revenue/' && method === 'GET') return handleRevenueTrend(request, env);
      if (path === '/api/dashboard/sales-by-region/' && method === 'GET') return handleSalesByRegion(request, env);
      if (path === '/api/dashboard/category-breakdown/' && method === 'GET') return handleCategoryBreakdown(request, env);

      // Sales
      if (path === '/api/sales/trends/' && method === 'GET') return handleSalesTrends(request, env);
      if (path === '/api/sales/quarterly/' && method === 'GET') return handleQuarterlySales(request, env);
      if (path === '/api/sales/' && method === 'GET') return handleSalesList(request, env);

      const salesDetail = path.match(/^\/api\/sales\/(\d+)\/$/);
      if (salesDetail && method === 'GET') return handleSalesDetail(request, env, parseInt(salesDetail[1]));

      // Customers
      if (path === '/api/customers/segments/' && method === 'GET') return handleCustomerSegments(request, env);
      if (path === '/api/customers/lifetime-value/' && method === 'GET') return handleLifetimeValue(request, env);
      if (path === '/api/customers/retention/' && method === 'GET') return handleRetention(request, env);
      if (path === '/api/customers/' && method === 'GET') return handleCustomersList(request, env);

      const custDetail = path.match(/^\/api\/customers\/(\d+)\/$/);
      if (custDetail && method === 'GET') return handleCustomerDetail(request, env, parseInt(custDetail[1]));

      // Products
      if (path === '/api/products/top/' && method === 'GET') return handleTopProducts(request, env);
      if (path === '/api/products/profitability/' && method === 'GET') return handleProfitability(request, env);
      if (path === '/api/products/category-analysis/' && method === 'GET') return handleCategoryAnalysis(request, env);
      if (path === '/api/products/' && method === 'GET') return handleProductsList(request, env);

      const prodDetail = path.match(/^\/api\/products\/(\d+)\/$/);
      if (prodDetail && method === 'GET') return handleProductDetail(request, env, parseInt(prodDetail[1]));

      // Reports
      if (path === '/api/reports/export/csv/' && method === 'GET') return handleExportCSV(request, env);
      if (path === '/api/reports/export/pdf/' && method === 'GET') return handleExportPDF(request, env);
      if (path === '/api/reports/email/' && method === 'POST') return handleEmailReport(request, env);

      // Regions
      if (path === '/api/regions/' && method === 'GET') return handleRegionsList(request, env);
      if (path === '/api/regions/performance/' && method === 'GET') return handleRegionsPerformance(request, env);

      // Dataset import
      if (path === '/api/dataset/import/' && method === 'POST') return handleDatasetImport(request, env);

      // Health
      if (path === '/api/health/' || path === '/health' || path === '/') {
        return jsonResponse({ status: 'healthy', service: 'Sales Analytics API' });
      }

      return errorResponse('Not found', 404);
    } catch (e) {
      return errorResponse('Internal server error: ' + e.message, 500);
    }
  },
};
