const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// ─── Supabase Client Setup ────────────────────────────────────────────────────
// Using dynamic import because @supabase/supabase-js is ESM-only
let supabase;

async function initSupabase() {
  const { createClient } = await import('@supabase/supabase-js');
  const SUPABASE_URL = 'https://lmswdkotzhffkiodlfxr.supabase.co';
  const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxtc3dka290emhmZmtpb2RsZnhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njk5MTkzMywiZXhwIjoyMTAyNTY3OTMzfQ.Qxjca9CevVUmEW0U5oat8pMUumMJ6bXsDwH6kFT5f78';
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// ─── Window Setup ─────────────────────────────────────────────────────────────
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(async () => {
  await initSupabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ─── IPC Handlers: Sellers ────────────────────────────────────────────────────
ipcMain.handle('get-sellers', async () => {
  const { data, error } = await supabase.from('sellers').select('*').order('id', { ascending: true });
  if (error) { console.error('get-sellers error:', error); return []; }
  return data;
});

ipcMain.handle('add-seller', async (event, name) => {
  const { data, error } = await supabase.from('sellers').insert({ name }).select().single();
  if (error) { console.error('add-seller error:', error); return null; }
  return data;
});

ipcMain.handle('delete-seller', async (event, id) => {
  // Cascade delete handles orders via FK ON DELETE CASCADE
  const { error } = await supabase.from('sellers').delete().eq('id', id);
  if (error) { console.error('delete-seller error:', error); return { success: false }; }
  return { success: true };
});

// ─── IPC Handlers: Buyers ─────────────────────────────────────────────────────
ipcMain.handle('get-buyers', async () => {
  const { data, error } = await supabase.from('buyers').select('*').order('id', { ascending: true });
  if (error) { console.error('get-buyers error:', error); return []; }
  return data;
});

ipcMain.handle('add-buyer', async (event, name) => {
  const { data, error } = await supabase.from('buyers').insert({ name }).select().single();
  if (error) { console.error('add-buyer error:', error); return null; }
  return data;
});

ipcMain.handle('delete-buyer', async (event, id) => {
  const { error } = await supabase.from('buyers').delete().eq('id', id);
  if (error) { console.error('delete-buyer error:', error); return { success: false }; }
  return { success: true };
});

// ─── IPC Handlers: Orders ─────────────────────────────────────────────────────
ipcMain.handle('get-orders', async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      sellers ( name ),
      buyers ( name )
    `)
    .order('order_date', { ascending: false });

  if (error) { console.error('get-orders error:', error); return []; }

  // Flatten the joined names to match what the frontend expects
  return data.map(o => ({
    ...o,
    seller_name: o.sellers ? o.sellers.name : 'Unknown',
    buyer_name: o.buyers ? o.buyers.name : 'Unknown'
  }));
});

ipcMain.handle('add-order', async (event, order) => {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      seller_id: order.seller_id,
      buyer_id: order.buyer_id,
      order_price: order.order_price,
      actual_price: order.actual_price,
      order_date: order.order_date,
      status: order.status || 'Pending'
    })
    .select()
    .single();
  if (error) { console.error('add-order error:', error); return null; }
  return data;
});

ipcMain.handle('update-order-status', async (event, id, status) => {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) { console.error('update-order-status error:', error); return { success: false }; }
  return { success: true };
});

ipcMain.handle('delete-order', async (event, id) => {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) { console.error('delete-order error:', error); return { success: false }; }
  return { success: true };
});
