const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSellers: () => ipcRenderer.invoke('get-sellers'),
  addSeller: (name) => ipcRenderer.invoke('add-seller', name),
  deleteSeller: (id) => ipcRenderer.invoke('delete-seller', id),
  
  getBuyers: () => ipcRenderer.invoke('get-buyers'),
  addBuyer: (name) => ipcRenderer.invoke('add-buyer', name),
  deleteBuyer: (id) => ipcRenderer.invoke('delete-buyer', id),
  
  getOrders: () => ipcRenderer.invoke('get-orders'),
  addOrder: (order) => ipcRenderer.invoke('add-order', order),
  updateOrderStatus: (id, status) => ipcRenderer.invoke('update-order-status', id, status),
  deleteOrder: (id) => ipcRenderer.invoke('delete-order', id)
});
